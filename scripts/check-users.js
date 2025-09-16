const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  try {
    const userCount = await prisma.user.count();
    console.log('✔ User table exists, count:', userCount);
    
    if (userCount > 0) {
      const adminUser = await prisma.user.findUnique({ 
        where: { email: 'admin@example.com' },
        select: { id: true, email: true, name: true, role: true }
      });
      console.log('Admin user:', adminUser ? 'EXISTS' : 'NOT FOUND');
      if (adminUser) {
        console.log('  Email:', adminUser.email);
        console.log('  Role:', adminUser.role);
      }
    }
  } catch (e) {
    console.error('✖ Error:', e.message);
  } finally {
    await prisma.$disconnect();
  }
}

main();