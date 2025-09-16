const bcrypt = require('bcryptjs');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  try {
    const user = await prisma.user.findUnique({ 
      where: { email: 'admin@example.com' } 
    });
    
    if (!user) {
      console.log('❌ User not found');
      return;
    }
    
    console.log('✔ User found:', user.email);
    
    // Test current password
    const isValid = await bcrypt.compare('admin123', user.passwordHash);
    console.log('Password valid:', isValid);
    
    if (!isValid) {
      console.log('🔧 Regenerating password hash...');
      const newHash = await bcrypt.hash('admin123', 10);
      await prisma.user.update({
        where: { email: 'admin@example.com' },
        data: { passwordHash: newHash }
      });
      console.log('✅ Password updated successfully');
    }
    
    // Test again
    const updatedUser = await prisma.user.findUnique({ 
      where: { email: 'admin@example.com' } 
    });
    const finalCheck = await bcrypt.compare('admin123', updatedUser.passwordHash);
    console.log('Final password test:', finalCheck);
    
  } catch (e) {
    console.error('❌ Error:', e.message);
  } finally {
    await prisma.$disconnect();
  }
}

main();