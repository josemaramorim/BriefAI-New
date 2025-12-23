const bcrypt = require('bcryptjs');

async function test() {
    console.log('Testing bcrypt...');
    try {
        const hash = await bcrypt.hash('admin123', 10);
        console.log('HASH_RESULT:', hash);
    } catch (e) {
        console.error('Bcrypt error:', e);
    }
}

test();
