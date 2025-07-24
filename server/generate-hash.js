// generate-hash.js
import bcrypt from 'bcryptjs';

const password = 'admin123';
const hash = bcrypt.hashSync(password, 10);
console.log(`Hash pour "${password}": ${hash}`);