"use server";

import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function POST(request: Request) {
  try {
    const { transactionId } = await request.json();
    if (!transactionId) {
      return NextResponse.json({ error: "Missing transactionId" }, { status: 400 });
    }

    // Use a transaction to guarantee idempotency
    const result = await prisma.$transaction(async (tx) => {
      // Attempt to record the webhook event; if it already exists, skip reset
      try {
        await tx.webhookEvent.create({ data: { transactionId } });
      } catch (err: any) {
        if (err.code === "P2002" || err.message?.includes("Unique constraint")) {
          return { skipped: true, message: "Webhook already processed (idempotent skip)" };
        }
        throw err;
      }

      // Reset all providers' quota to their maxQuota (default 10)
      await tx.provider.updateMany({ data: { currentQuota: 10 } });
      return { skipped: false, message: "Provider quotas reset to 10" };
    });

    const status = result.skipped ? 200 : 200;
    return NextResponse.json({ message: result.message, resetOccurred: !result.skipped }, { status });
  } catch (error: any) {
    console.error("Quota reset webhook error:", error);
    return NextResponse.json({ error: "Failed to process webhook" }, { status: 500 });
  }
}
