import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    // Fetch the original enquiry
    const original = await prisma.enquiry.findUnique({
      where: { id },
    });

    if (!original) {
      return NextResponse.json({ error: "Enquiry not found" }, { status: 404 });
    }

    // Create a cloned enquiry representing the second split project
    const splitEnquiry = await prisma.enquiry.create({
      data: {
        originalText: original.originalText,
        fromName: `${original.fromName} (Project 2)`,
        fromEmail: original.fromEmail,
        receivedAt: original.receivedAt,
        status: "NEW",
        priority: original.priority,
        processingStatus: "COMPLETED",
        isGenuine: original.isGenuine,
        serviceLine: original.serviceLine,
        summary: `${original.summary} - Split Project`,
        timeline: original.timeline,
        budget: original.budget,
        normalizedBudgetMin: original.normalizedBudgetMin,
        normalizedBudgetMax: original.normalizedBudgetMax,
        normalizedBudgetCurrency: original.normalizedBudgetCurrency,
        normalizedTimelineStart: original.normalizedTimelineStart,
        originalFields: original.originalFields,
        currentFields: original.currentFields,
        isFollowUp: original.isFollowUp,
        parentId: original.parentId,
      },
    });

    // Update the original enquiry's name and summary to clarify it is Project 1
    const originalFields = JSON.parse(original.currentFields || "{}");
    const updatedFields = { 
      ...originalFields, 
      contactName: `${original.fromName} (Project 1)`,
      summary: `${original.summary} - Primary Project`
    };

    await prisma.enquiry.update({
      where: { id },
      data: {
        fromName: `${original.fromName} (Project 1)`,
        summary: `${original.summary} - Primary Project`,
        currentFields: JSON.stringify(updatedFields),
      },
    });

    return NextResponse.json({
      message: "Enquiry successfully split into two separate records.",
      primaryId: original.id,
      splitId: splitEnquiry.id,
    });
  } catch (error: any) {
    console.error("Split enquiry API error:", error);
    return NextResponse.json({ error: error.message || "Failed to split enquiry" }, { status: 500 });
  }
}
