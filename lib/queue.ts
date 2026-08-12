import { PrismaClient } from "@prisma/client";
import { extractEnquiryFields } from "./extractor";
import { calculatePriority } from "./scoring";
import { findDuplicateOrParentEnquiry } from "./duplicates";

/**
 * Concurrency-limited queue runner.
 * Runs up to `limit` promises concurrently.
 */
async function runWithConcurrencyLimit(tasks: (() => Promise<void>)[], limit: number) {
  const executing: Promise<void>[] = [];
  
  for (const task of tasks) {
    const p = task();
    executing.push(p);
    
    // Once a task finishes, remove it from the executing array
    const cleanUp = () => {
      const idx = executing.indexOf(p);
      if (idx > -1) executing.splice(idx, 1);
    };
    p.then(cleanUp).catch(cleanUp);
    
    if (executing.length >= limit) {
      await Promise.race(executing);
    }
  }
  
  await Promise.all(executing);
}

/**
 * Background worker that processes all PENDING enquiries in the database.
 * Does not block the HTTP request, runs asynchronously.
 */
export async function processPendingQueue(prisma: PrismaClient): Promise<void> {
  try {
    // 1. Fetch all pending enquiries
    const pendingEnquiries = await prisma.enquiry.findMany({
      where: {
        processingStatus: "PENDING",
      },
      orderBy: {
        receivedAt: "asc",
      },
    });

    if (pendingEnquiries.length === 0) {
      return;
    }

    // 2. Map them to tasks
    const tasks = pendingEnquiries.map((enquiry) => {
      return async () => {
        // Mark the current item as PROCESSING
        await prisma.enquiry.update({
          where: { id: enquiry.id },
          data: { processingStatus: "PROCESSING" },
        });

        try {
          // Extract fields using our extractor (handles mock data/API/heuristics)
          const extracted = await extractEnquiryFields(
            enquiry.originalText,
            enquiry.fromName,
            enquiry.fromEmail,
            enquiry.receivedAt.toISOString()
          );

          // Calculate priority using our custom rules code
          const priority = calculatePriority(extracted);

          // Check for duplicate / follow-up emails within 7 days
          const parentId = await findDuplicateOrParentEnquiry(
            prisma,
            extracted.contactEmail,
            enquiry.receivedAt
          );

          const isFollowUp = parentId !== null;

          // Prepare JSON strings for the DB
          const jsonString = JSON.stringify(extracted);

          // Update enquiry with successfully extracted details
          await prisma.enquiry.update({
            where: { id: enquiry.id },
            data: {
              processingStatus: "COMPLETED",
              status: extracted.isGenuine ? "NEW" : "DROPPED", // Auto-drop spam
              priority: priority,
              isGenuine: extracted.isGenuine,
              fromName: extracted.contactName !== "Unknown" ? extracted.contactName : enquiry.fromName,
              fromEmail: extracted.contactEmail !== "n/a" ? extracted.contactEmail : enquiry.fromEmail,
              company: extracted.company !== "Unknown" ? extracted.company : "Unknown",
              serviceLine: extracted.serviceLine.toUpperCase(),
              summary: extracted.summary,
              timeline: extracted.timelineRaw,
              budget: extracted.budgetRaw,
              normalizedBudgetMin: extracted.budgetMinUSD,
              normalizedBudgetMax: extracted.budgetMaxUSD,
              normalizedBudgetCurrency: extracted.budgetCurrency,
              normalizedTimelineStart: extracted.timelineNormalizedMonths >= 0 
                ? new Date(enquiry.receivedAt.getTime() + (extracted.timelineNormalizedMonths * 30 * 24 * 60 * 60 * 1000))
                : null,
              originalFields: jsonString,
              currentFields: jsonString, // Human edits can modify this later
              isFollowUp,
              parentId,
              errorMessage: null,
            },
          });
        } catch (error: any) {
          console.error(`Failed to process enquiry ${enquiry.id}:`, error);
          
          // Mark this specific enquiry as FAILED, saving the error message
          await prisma.enquiry.update({
            where: { id: enquiry.id },
            data: {
              processingStatus: "FAILED",
              errorMessage: error.message || "Unknown error during extraction",
            },
          });
        }
      };
    });

    // 3. Run tasks with concurrency limit of 3
    // This executes asynchronously in the background.
    // Standard Next.js route handlers will complete while this promise resolves.
    // SQLite can handle concurrent writes due to Prisma pooling, and concurrency: 3 is safe.
    await runWithConcurrencyLimit(tasks, 3);
    
  } catch (error) {
    console.error("Error running pending queue processor:", error);
  }
}
