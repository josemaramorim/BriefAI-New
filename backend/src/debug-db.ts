import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('Testing DB connection...');
    try {
        const count = await prisma.user.count();
        console.log('User count:', count);

        const tenant = await prisma.tenant.create({
            data: { name: 'Debug Tenant ' + Date.now() }
        });
        console.log('Tenant created:', tenant.id);
    } catch (e) {
        console.error('Error:', e);
    } finally {
        await prisma.$disconnect();
    }
}

main();
