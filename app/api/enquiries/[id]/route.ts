import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

// GET /api/enquiries/[id]
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const enquiry = await prisma.enquiry.findUnique({
      where: { id },
      include: {
        followUps: {
          select: {
            id: true,
            fromName: true,
            receivedAt: true,
            summary: true,
          }
        },
        parent: {
          select: {
            id: true,
            fromName: true,
            receivedAt: true,
            summary: true,
          }
        }
      }
    });

    if (!enquiry) {
      return NextResponse.json({ error: "Enquiry not found" }, { status: 404 });
    }

    return NextResponse.json(enquiry);
  } catch (error: any) {
    console.error("Fetch single enquiry API error:", error);
    return NextResponse.json({ error: error.message || "Failed to fetch enquiry" }, { status: 500 });
  }
}

// PUT /api/enquiries/[id]
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();

    const existingEnquiry = await prisma.enquiry.findUnique({
      where: { id },
    });

    if (!existingEnquiry) {
      return NextResponse.json({ error: "Enquiry not found" }, { status: 404 });
    }

    // Prepare update data
    const updateData: any = {};

    // 1. Core Workflow fields
    if (body.status) {
      updateData.status = body.status.toUpperCase();
    }
    if (body.priority) {
      updateData.priority = body.priority.toUpperCase();
    }
    if (body.processingStatus) {
      updateData.processingStatus = body.processingStatus.toUpperCase();
    }
    if (body.isGenuine !== undefined) {
      updateData.isGenuine = body.isGenuine;
    }

    // 2. Extracted metadata fields (inline editing)
    if (body.fields) {
      const currentFields = JSON.parse(existingEnquiry.currentFields || "{}");
      const updatedFields = { ...currentFields, ...body.fields };

      // Map inline edit fields back to dedicated table columns for searchability/consistency
      if (body.fields.company !== undefined) updateData.company = body.fields.company;
      if (body.fields.contactName !== undefined) updateData.fromName = body.fields.contactName;
      if (body.fields.contactEmail !== undefined) updateData.fromEmail = body.fields.contactEmail;
      if (body.fields.serviceLine !== undefined) updateData.serviceLine = body.fields.serviceLine.toUpperCase();
      if (body.fields.summary !== undefined) updateData.summary = body.fields.summary;
      if (body.fields.timelineRaw !== undefined) updateData.timeline = body.fields.timelineRaw;
      if (body.fields.budgetRaw !== undefined) updateData.budget = body.fields.budgetRaw;
      
      // Map normalized fields if supplied
      if (body.fields.budgetMinUSD !== undefined) updateData.normalizedBudgetMin = body.fields.budgetMinUSD;
      if (body.fields.budgetMaxUSD !== undefined) updateData.normalizedBudgetMax = body.fields.budgetMaxUSD;
      if (body.fields.budgetCurrency !== undefined) updateData.normalizedBudgetCurrency = body.fields.budgetCurrency;
      if (body.fields.isGenuine !== undefined) updateData.isGenuine = body.fields.isGenuine;

      updateData.currentFields = JSON.stringify(updatedFields);
    }

    // 3. Parent link changes (e.g. manually split / link)
    if (body.parentId !== undefined) {
      updateData.parentId = body.parentId;
      updateData.isFollowUp = body.parentId !== null;
    }

    const updatedEnquiry = await prisma.enquiry.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json(updatedEnquiry);
  } catch (error: any) {
    console.error("Update enquiry API error:", error);
    return NextResponse.json({ error: error.message || "Failed to update enquiry" }, { status: 500 });
  }
}
