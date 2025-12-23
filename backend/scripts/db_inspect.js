require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

(async () => {
  try {
    const templateId = 'cmjhqa5xt0004wqc52hcbi8ye';
    const template = await prisma.template.findUnique({
      where: { id: templateId },
      include: { blocks: { include: { questions: true }, orderBy: { order: 'asc' } }, rules: true }
    });
    console.log('TEMPLATE:', JSON.stringify(template, null, 2));

    const user = await prisma.user.findUnique({ where: { email: 'admin@brief.com' } });
    console.log('USER:', JSON.stringify(user, null, 2));
  } catch (e) {
    console.error('Inspect error:', e);
  } finally {
    await prisma.$disconnect();
  }
})();
