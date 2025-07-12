
const { addUser } = require('../src/services/userService');
const { simpleHash } = require('../src/utils/authUtils');


async function main() {
  const salt = 'logigrine2025';
  const password = 'admin123';
  const passwordHash = await simpleHash(password, salt);
  const now = new Date().toISOString();
  const adminUser = {
    username: 'admin',
    passwordHash,
    salt,
    role: 'admin',
    fullName: 'Admin System',
    firstName: 'Admin',
    lastName: 'System',
    email: 'admin@logigrine.com',
    phone: ['+33 6 56 78 90 12'],
    createdAt: now,
    isActive: true
  };
  await addUser(adminUser);
  console.log('Admin user created in Firestore');
}
main();
