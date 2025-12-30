const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    const questions = await prisma.question.findMany({
        where: { type: 'image_choice' },
        select: {
            id: true,
            text: true,
            imageOptions: true,
            block: {
                select: { templateId: true }
            }
        }
    });

    console.log('--- Image Choice Questions ---');
    questions.forEach(q => {
        console.log(`Question: ${q.text} (ID: ${q.id})`);
        console.log(`Template: ${q.block.templateId}`);
        console.log(`Options:`, q.imageOptions);
        console.log('----------------------------');
    });

    await prisma.$disconnect();
}

main().catch(console.error);
