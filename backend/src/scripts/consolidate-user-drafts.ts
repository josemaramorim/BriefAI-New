import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function consolidate() {
    const email = 'josemaramorim@yahoo.com.br';
    console.log(`Consolidating drafts for ${email}...`);

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
        console.log('User not found.');
        return;
    }

    const drafts = await prisma.briefInstance.findMany({
        where: {
            userId: user.id,
            status: 'draft'
        },
        include: {
            _count: {
                select: { responses: true }
            }
        }
    });

    console.log(`Found ${drafts.length} drafts.`);

    // Keep instances that have responses, delete those that are empty
    const emptyDrafts = drafts.filter(d => d._count.responses === 0);

    if (emptyDrafts.length > 0) {
        console.log(`Deleting ${emptyDrafts.length} empty drafts...`);
        await prisma.briefInstance.deleteMany({
            where: {
                id: {
                    in: emptyDrafts.map(d => d.id)
                }
            }
        });
        console.log('Empty drafts deleted.');
    } else {
        console.log('No empty drafts found.');
    }

    console.log('Consolidation finished.');
}

consolidate()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect());
