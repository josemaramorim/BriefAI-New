const bcrypt = require('bcryptjs');
const fs = require('fs');
const path = require('path');

const password = 'admin123';
const hash = bcrypt.hashSync(password, 10);

console.log('Generated Hash:', hash);
fs.writeFileSync(path.join(__dirname, 'active_hash.txt'), hash);
console.log('Hash written to active_hash.txt');
