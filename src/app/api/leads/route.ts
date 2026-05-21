"use server";

import { NextResponse } from "next/server";
import { distributeLead } from "@/lib/leadDistribution";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, phone, city, serviceName, description } = body;

    // Basic validation
    if (!name || !phone || !city || !serviceName || !description) {
      return NextResponse.json({ error: "All fields are required" }, { status: 400 });
    }

    // Run distribution logic – this will also enforce duplicate constraint via Prisma unique index
    const result = await distributeLead({ name, phone, city, serviceName, description });

    return NextResponse.json(result, { status: 201 });
  } catch (error: any) {
    console.error("Lead submission error:", error);

    // Prisma duplicate error (unique constraint on phone+serviceId)
    if (error.code === "P2002" || error.message?.includes("Unique constraint")) {
      return NextResponse.json(
        { error: "Duplicate lead: same phone already submitted for this service." },
        { status: 409 }
      );
    }

    // Quota exhaustion or allocation failure
    if (error.message?.includes("Could not assign exactly 3 providers")) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ error: error.message || "Unexpected error" }, { status: 500 });
  }
}
