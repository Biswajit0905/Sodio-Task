import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { splitEnquiriesFile, parseSingleEnquiry } from "@/lib/parser";
import { processPendingQueue } from "@/lib/queue";

export async function POST(req: NextRequest) {
  try {
    const contentType = req.headers.get("content-type") || "";
    let rawText = "";

    // 1. Extract text from either multipart file upload or JSON payload
    if (contentType.includes("multipart/form-data")) {
      const formData = await req.formData();
      const file = formData.get("file") as File | null;
      if (!file) {
        return NextResponse.json({ error: "No file provided" }, { status: 400 });
      }
      rawText = await file.text();
    } else if (contentType.includes("application/json")) {
      const body = await req.json();
      rawText = body.text || "";
    } else {
      // Fallback to reading raw body text
      rawText = await req.text();
    }

    if (!rawText.trim()) {
      return NextResponse.json({ error: "Empty content provided" }, { status: 400 });
    }

    // 2. Determine if we are ingesting a file with multiple enquiries or a single pasted enquiry
    const blocks = splitEnquiriesFile(rawText);
    const parsedEnquiries: { fromName: string; fromEmail: string; receivedAt: Date; originalText: string }[] = [];

    if (blocks.length > 0) {
      // Multiple enquiries parsed from file format
      for (const block of blocks) {
        const parsed = parseSingleEnquiry(block);
        parsedEnquiries.push({
          fromName: parsed.fromName,
          fromEmail: parsed.fromEmail,
          receivedAt: parsed.receivedAt,
          originalText: block,
        });
      }
    } else {
      // Single pasted enquiry - parse raw text directly
      // If the user pastes a raw email with From/Email/Received, try parsing it
      // Otherwise fallback to generic name/email and message
      if (rawText.toLowerCase().includes("message:") || rawText.toLowerCase().includes("from:")) {
        const parsed = parseSingleEnquiry(rawText);
        parsedEnquiries.push({
          fromName: parsed.fromName,
          fromEmail: parsed.fromEmail,
          receivedAt: parsed.receivedAt,
          originalText: rawText,
        });
      } else {
        // Plain text pasted directly
        parsedEnquiries.push({
          fromName: "Pasted Enquiry",
          fromEmail: "web-form@sodio.tech",
          receivedAt: new Date(),
          originalText: rawText,
        });
      }
    }

    if (parsedEnquiries.length === 0) {
      return NextResponse.json({ error: "No valid enquiries could be parsed from input" }, { status: 400 });
    }

    // 3. Insert all parsed enquiries into the database as PENDING
    const createdEnquiries = await prisma.$transaction(
      parsedEnquiries.map((enquiry) =>
        prisma.enquiry.create({
          data: {
            originalText: enquiry.originalText,
            fromName: enquiry.fromName,
            fromEmail: enquiry.fromEmail,
            receivedAt: enquiry.receivedAt,
            status: "NEW",
            priority: "LOW",
            processingStatus: "PENDING",
          },
        })
      )
    );

    // 4. Trigger the background queue processing (do NOT await it, let it run in the background!)
    // Next.js Route Handlers on local dev servers will continue execution of background promises.
    // In serverless deployment, this would use a Vercel Queue or background jobs, but for local run, it executes fine.
    processPendingQueue(prisma).catch((err) => {
      console.error("Error in background queue invocation:", err);
    });

    return NextResponse.json({
      message: `Successfully queued ${createdEnquiries.length} enquiries for processing.`,
      enquiries: createdEnquiries,
    });
  } catch (error: any) {
    console.error("Ingest API error:", error);
    return NextResponse.json({ error: error.message || "Failed to ingest enquiries" }, { status: 500 });
  }
}
