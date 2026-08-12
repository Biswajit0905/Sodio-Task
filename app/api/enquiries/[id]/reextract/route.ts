import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { extractEnquiryFields } from "@/lib/extractor";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const enquiry = await prisma.enquiry.findUnique({
      where: { id },
    });

    if (!enquiry) {
      return NextResponse.json({ error: "Enquiry not found" }, { status: 404 });
    }

    // Run the extraction utility on the original text
    const extractedFields = await extractEnquiryFields(
      enquiry.originalText,
      enquiry.fromName,
      enquiry.fromEmail,
      enquiry.receivedAt.toISOString()
    );

    return NextResponse.json({
      message: "Successfully re-extracted fields from original text.",
      extractedFields,
    });
  } catch (error: any) {
    console.error("Reextract API error:", error);
    return NextResponse.json({ error: error.message || "Failed to re-extract fields" }, { status: 500 });
  }
}
