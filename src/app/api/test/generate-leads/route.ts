import { NextResponse } from "next/server";
import { distributeLead } from "@/lib/leadDistribution";

export async function POST(request: Request) {
  try {
    const { serviceName = "Service 1" } = await request.json().catch(() => ({}));

    // Trigger 10 lead submissions in parallel to test concurrency handling
    const leadPromises = Array.from({ length: 10 }).map((_, i) => {
      // Create a unique phone number for each lead to bypass the duplicate constraint
      const uniqueSuffix = String(Math.floor(100000 + Math.random() * 900000));
      const phone = `99${uniqueSuffix}${i}`;

      return distributeLead({
        name: `Concurrent Customer ${i + 1}`,
        phone,
        city: "Concurrent City",
        serviceName,
        description: `Automated concurrency test lead #${i + 1}`,
      })
        .then((res) => ({
          success: true,
          customer: `Concurrent Customer ${i + 1}`,
          phone,
          assigned: res.assignedProviders.map((p) => p.name).join(", "),
        }))
        .catch((err) => ({
          success: false,
          customer: `Concurrent Customer ${i + 1}`,
          phone,
          error: err.message,
        }));
    });

    const results = await Promise.all(leadPromises);

    return NextResponse.json({ results });
  } catch (error: any) {
    console.error("Concurrency generator error:", error);
    return NextResponse.json(
      { error: "Internal test generator error" },
      { status: 500 }
    );
  }
}
