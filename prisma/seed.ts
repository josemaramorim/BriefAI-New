import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';

dotenv.config();
const prisma = new PrismaClient();

async function main() {
  console.log('Seeding...');
  const t1 = await prisma.tenant.upsert({
    where: { name: 'Tenant A' },
    update: {},
    create: { name: 'Tenant A' }
  });
  const t2 = await prisma.tenant.upsert({
    where: { name: 'Tenant B' },
    update: {},
    create: { name: 'Tenant B' }
  });

  console.log('Tenants created:', t1.id, t2.id);
}

main()
  .catch((e) => console.error(e))
  .finally(async () => { await prisma.$disconnect(); });
