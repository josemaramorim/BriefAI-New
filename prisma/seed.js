const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding (JS)...');
  await prisma.tenant.deleteMany();
  const t1 = await prisma.tenant.create({ data: { name: 'Tenant A' } });
  const t2 = await prisma.tenant.create({ data: { name: 'Tenant B' } });
  console.log('Tenants created:', t1.id, t2.id);
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });
