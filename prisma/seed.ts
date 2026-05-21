import { PrismaClient } from '../src/generated/prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  // 1. Create Services
  const services = [
    { name: 'Service 1' },
    { name: 'Service 2' },
    { name: 'Service 3' },
  ];

  for (const s of services) {
    const service = await prisma.service.upsert({
      where: { name: s.name },
      update: {},
      create: s,
    });

    await prisma.allocationState.upsert({
      where: { serviceId: service.id },
      update: {},
      create: {
        serviceId: service.id,
        currentIndex: 0,
      },
    });
  }

  console.log('Services and AllocationStates seeded.');

  // 2. Create 8 Providers
  const providers = [];
  for (let i = 1; i <= 8; i++) {
    providers.push({
      id: i,
      name: `Provider ${i}`,
      maxQuota: 10,
      currentQuota: 10,
      leadsReceived: 0,
    });
  }

  for (const p of providers) {
    await prisma.provider.upsert({
      where: { id: p.id },
      update: {},
      create: p,
    });
  }

  console.log('Providers seeded.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
