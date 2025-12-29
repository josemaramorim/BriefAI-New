import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  const templateId = 'cmjhuec1o0001l0q8n7ogldw9';
  const template = await prisma.template.findUnique({
    where: { id: templateId },
    include: {
      blocks: {
        include: { questions: true },
        orderBy: { order: 'asc' }
      },
      rules: true
    }
  });
  console.dir(template, { depth: 10 });
}

main().catch(console.error).finally(() => prisma.$disconnect());
