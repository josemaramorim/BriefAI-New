const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    try {
        const user = await prisma.user.findUnique({
            where: { email: 'admin@briefai.com' }
        });
        if (user) {
            console.log('VERIFICATION SUCCESS: User found:', user.email);
            console.log('Role:', user.role);
            console.log('Tenant:', user.tenantId);
        } else {
            console.log('VERIFICATION FAILED: User not found.');
        }
    } catch (e) {
        console.error('VERIFICATION ERROR:', e);
    } finally {
        await prisma.$disconnect();
    }
}
main();
