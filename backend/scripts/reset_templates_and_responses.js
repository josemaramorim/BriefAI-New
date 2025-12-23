const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const force = process.env.FORCE_RESET === '1' || process.argv.includes('--yes');
  if (!force) {
    console.log('This script will DELETE template-related data.');
    console.log('Set environment variable FORCE_RESET=1 or pass --yes to confirm.');
    process.exit(1);
  }

  try {
    console.log('Deleting responses...');
    await prisma.response.deleteMany();
    console.log('Deleting brief instances...');
    await prisma.briefInstance.deleteMany();
    console.log('Deleting template versions...');
    await prisma.templateVersion.deleteMany();
    console.log('Deleting rules...');
    await prisma.rule.deleteMany();
    console.log('Deleting questions...');
    await prisma.question.deleteMany();
    console.log('Deleting blocks...');
    await prisma.block.deleteMany();
    console.log('Deleting templates...');
    await prisma.template.deleteMany();

    console.log('Reset complete. Note: tenants and users were NOT deleted.');
  } catch (err) {
    console.error('Error during reset:', err);
  } finally {
    await prisma.$disconnect();
  }
}

main();
