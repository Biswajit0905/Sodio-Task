import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    
    // Filters
    const serviceLine = searchParams.get("serviceLine")?.toUpperCase();
    const priority = searchParams.get("priority")?.toUpperCase();
    const status = searchParams.get("status")?.toUpperCase();
    const isGenuineStr = searchParams.get("isGenuine");
    const search = searchParams.get("q")?.trim().toLowerCase();
    
    // Sorting
    const sortBy = searchParams.get("sortBy") || "receivedAt"; // "receivedAt" or "priority"
    const sortOrder = searchParams.get("sortOrder") || "desc"; // "asc" or "desc"

    // Construct Prisma Query
    const whereClause: any = {};

    if (serviceLine && serviceLine !== "ALL") {
      whereClause.serviceLine = serviceLine;
    }
    
    if (priority && priority !== "ALL") {
      whereClause.priority = priority;
    }
    
    if (status && status !== "ALL") {
      whereClause.status = status;
    }

    if (isGenuineStr && isGenuineStr !== "ALL") {
      whereClause.isGenuine = isGenuineStr === "true";
    }

    // Fetch all matching enquiries
    let enquiries = await prisma.enquiry.findMany({
      where: whereClause,
      include: {
        followUps: {
          select: {
            id: true,
            fromName: true,
            receivedAt: true,
          }
        }
      },
      orderBy: sortBy === "receivedAt" ? { receivedAt: sortOrder as "asc" | "desc" } : undefined,
    });

    // Apply Client-side fuzzy search if query exists
    if (search) {
      enquiries = enquiries.filter((item) => {
        return (
          item.fromName.toLowerCase().includes(search) ||
          item.fromEmail.toLowerCase().includes(search) ||
          item.originalText.toLowerCase().includes(search) ||
          item.summary.toLowerCase().includes(search)
        );
      });
    }

    // Custom In-Memory sorting for Priority (HIGH -> MEDIUM -> LOW)
    if (sortBy === "priority") {
      const priorityWeights = { HIGH: 3, MEDIUM: 2, LOW: 1 };
      enquiries.sort((a, b) => {
        const weightA = priorityWeights[a.priority as keyof typeof priorityWeights] || 0;
        const weightB = priorityWeights[b.priority as keyof typeof priorityWeights] || 0;
        
        if (sortOrder === "desc") {
          return weightB - weightA;
        } else {
          return weightA - weightB;
        }
      });
    }

    return NextResponse.json(enquiries);
  } catch (error: any) {
    console.error("Fetch enquiries API error:", error);
    return NextResponse.json({ error: error.message || "Failed to fetch enquiries" }, { status: 500 });
  }
}
