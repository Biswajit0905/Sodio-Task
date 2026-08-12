import { PrismaClient } from "@prisma/client";

/**
 * Checks for a prior enquiry from the same email address within a 7-day window.
 * Returns the parent enquiry ID if a match is found, allowing us to link them.
 */
export async function findDuplicateOrParentEnquiry(
  prisma: PrismaClient,
  email: string,
  receivedAt: Date
): Promise<string | null> {
  if (!email || email === "n/a" || email.toLowerCase() === "unknown") {
    return null;
  }

  // 7 days in milliseconds
  const SEVEN_DAYS_MS = 7 * 24 * 60 * 60 * 1000;
  
  // Find the oldest enquiry from this email that is close in time to the new one
  const parent = await prisma.enquiry.findFirst({
    where: {
      fromEmail: {
        equals: email,
      },
      // Check if it's within a 7-day window
      receivedAt: {
        gte: new Date(receivedAt.getTime() - SEVEN_DAYS_MS),
        lte: new Date(receivedAt.getTime() + SEVEN_DAYS_MS),
      },
      isFollowUp: false, // Link to the primary parent
    },
    orderBy: {
      receivedAt: 'asc',
    },
  });

  return parent ? parent.id : null;
}
