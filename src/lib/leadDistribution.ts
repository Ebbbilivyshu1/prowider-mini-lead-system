import { prisma } from "./db";

// Configuration for Services, Mandatory Providers and Fair Pools
export const SERVICE_RULES: Record<
  string,
  { mandatoryIds: number[]; poolIds: number[] }
> = {
  "Service 1": {
    mandatoryIds: [1],
    poolIds: [2, 3, 4],
  },
  "Service 2": {
    mandatoryIds: [5],
    poolIds: [6, 7, 8],
  },
  "Service 3": {
    mandatoryIds: [1, 4],
    poolIds: [2, 3, 5, 6, 7, 8],
  },
};

interface CreateLeadParams {
  name: string;
  phone: string;
  city: string;
  serviceName: string;
  description: string;
}

export async function distributeLead(params: CreateLeadParams) {
  const { name, phone, city, serviceName, description } = params;

  // 1. Fetch the service to verify it exists
  const service = await prisma.service.findUnique({
    where: { name: serviceName },
  });

  if (!service) {
    throw new Error(`Service "${serviceName}" not found.`);
  }

  const rules = SERVICE_RULES[serviceName];
  if (!rules) {
    throw new Error(`No rules defined for service "${serviceName}".`);
  }

  const { mandatoryIds, poolIds } = rules;

  // Sort candidate provider IDs to prevent deadlocks when locking rows
  const allCandidateIds = Array.from(new Set([...mandatoryIds, ...poolIds])).sort((a, b) => a - b);

  // Execute the entire allocation in a transaction
  return await prisma.$transaction(async (tx) => {
    // 2. Lock the AllocationState row for this service
    // This serializes distribution requests for the SAME service
    const allocationStates = await tx.$queryRaw<any[]>`
      SELECT * FROM "AllocationState" 
      WHERE "serviceId" = ${service.id} 
      FOR UPDATE
    `;

    if (!allocationStates || allocationStates.length === 0) {
      throw new Error(`Allocation state not found for service "${serviceName}".`);
    }

    const allocationState = allocationStates[0];
    const currentIndex = allocationState.currentIndex;

    // 3. Lock candidate provider rows in sorted order
    const providers = await tx.$queryRaw<any[]>`
      SELECT * FROM "Provider" 
      WHERE "id" = ANY(${allCandidateIds}) 
      FOR UPDATE
    `;

    const providerMap = new Map<number, any>();
    for (const p of providers) {
      providerMap.set(p.id, p);
    }

    const selectedProviders: any[] = [];

    // 4. Try to assign mandatory providers first (if quota available)
    for (const mandatoryId of mandatoryIds) {
      const provider = providerMap.get(mandatoryId);
      if (provider && provider.currentQuota > 0) {
        selectedProviders.push(provider);
      }
    }

    // 5. Fill remaining slots from the fair pool using round-robin
    const remainingSlots = 3 - selectedProviders.length;
    let newIndex = currentIndex;

    if (remainingSlots > 0) {
      let poolScannedCount = 0;
      let currentScanIdx = currentIndex;
      let lastScannedIdx = currentIndex;

      const poolSelected: any[] = [];

      while (poolSelected.length < remainingSlots && poolScannedCount < poolIds.length) {
        const providerId = poolIds[currentScanIdx];
        const provider = providerMap.get(providerId);

        // Provider is eligible if they have quota and are not already selected (e.g. as mandatory)
        if (
          provider &&
          provider.currentQuota > 0 &&
          !selectedProviders.some((p) => p.id === providerId)
        ) {
          poolSelected.push(provider);
        }

        lastScannedIdx = currentScanIdx;
        currentScanIdx = (currentScanIdx + 1) % poolIds.length;
        poolScannedCount++;
      }

      // Add the selected pool providers to the final list
      selectedProviders.push(...poolSelected);

      // Only advance the index if we scanned and selected from the pool
      if (poolSelected.length > 0) {
        newIndex = (lastScannedIdx + 1) % poolIds.length;
      }
    }

    // 6. Check if we have exactly 3 providers assigned
    if (selectedProviders.length !== 3) {
      throw new Error(
        `Could not assign exactly 3 providers. Eligible assigned count: ${selectedProviders.length}. Rollback lead creation.`
      );
    }

    // 7. Create the Lead (unique constraint @@unique([phone, serviceId]) will check for duplicates here)
    const lead = await tx.lead.create({
      data: {
        name,
        phone,
        city,
        serviceId: service.id,
        description,
      },
    });

    // 8. Update selected providers and create assignments
    for (const provider of selectedProviders) {
      await tx.provider.update({
        where: { id: provider.id },
        data: {
          currentQuota: provider.currentQuota - 1,
          leadsReceived: provider.leadsReceived + 1,
          lastAssignedAt: new Date(),
        },
      });

      await tx.leadAssignment.create({
        data: {
          leadId: lead.id,
          providerId: provider.id,
        },
      });
    }

    // 9. Update the allocation pointer in AllocationState
    await tx.allocationState.update({
      where: { serviceId: service.id },
      data: {
        currentIndex: newIndex,
      },
    });

    return {
      lead,
      assignedProviders: selectedProviders.map((p) => ({
        id: p.id,
        name: p.name,
      })),
    };
  });
}
