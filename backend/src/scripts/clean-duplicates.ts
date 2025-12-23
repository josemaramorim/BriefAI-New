import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function cleanDuplicates() {
    console.log('Cleaning duplicate responses...');

    const allResponses = await prisma.response.findMany({
        orderBy: {
            updatedAt: 'desc'
        }
    });

    console.log(`Analyzing ${allResponses.length} total responses.`);

    const seen = new Set<string>();
    const idsToDelete: string[] = [];

    for (const r of allResponses) {
        const key = `${r.briefId}-${r.questionId}`;
        if (seen.has(key)) {
            idsToDelete.push(r.id);
        } else {
            seen.add(key);
        }
    }

    if (idsToDelete.length > 0) {
        console.log(`Deleting ${idsToDelete.length} duplicates...`);
        await prisma.response.deleteMany({
            where: {
                id: {
                    in: idsToDelete
                }
            }
        });
        console.log('Duplicates deleted.');
    } else {
        console.log('No duplicates found.');
    }

    console.log('Cleanup finished.');
}

cleanDuplicates()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect());
