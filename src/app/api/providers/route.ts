import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

// Ensure responses are not cached, so the dashboard gets the latest data
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const providers = await prisma.provider.findMany({
      orderBy: { id: "asc" },
      include: {
        assignments: {
          orderBy: { assignedAt: "desc" },
          include: {
            lead: {
              include: {
                service: true,
              },
            },
          },
        },
      },
    });

    const formattedProviders = providers.map((p) => ({
      id: p.id,
      name: p.name,
      maxQuota: p.maxQuota,
      currentQuota: p.currentQuota,
      leadsReceived: p.leadsReceived,
      lastAssignedAt: p.lastAssignedAt,
      leads: p.assignments.map((a) => ({
        id: a.lead.id,
        name: a.lead.name,
        phone: a.lead.phone,
        city: a.lead.city,
        serviceName: a.lead.service.name,
        description: a.lead.description,
        assignedAt: a.assignedAt,
      })),
    }));

    return NextResponse.json(formattedProviders);
  } catch (error: any) {
    console.error("Error fetching providers:", error);
    return NextResponse.json(
      { error: "Failed to fetch providers" },
      { status: 500 }
    );
  }
}
