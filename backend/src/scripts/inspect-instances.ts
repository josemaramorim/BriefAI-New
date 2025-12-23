import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function inspect() {
    const instances = await prisma.briefInstance.findMany({
        include: {
            template: {
                select: {
                    id: true,
                    name: true
                }
            },
            user: {
                select: {
                    email: true,
                    name: true
                }
            },
            _count: {
                select: {
                    responses: true
                }
            }
        }
    });

    console.log('Brief Instances:');
    instances.forEach(i => {
        console.log(`- ID: ${i.id}`);
        console.log(`  Template: ${i.template?.name} (${i.template?.id})`);
        console.log(`  User: ${i.user?.name} (${i.user?.email})`);
        console.log(`  Responses: ${i._count.responses}`);
        console.log(`  Status: ${i.status}`);
        console.log('---');
    });
}

inspect()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect());
