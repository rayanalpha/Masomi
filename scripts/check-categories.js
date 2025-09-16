const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  try {
    const categories = await prisma.category.findMany();
    console.log('Categories in database:');
    categories.forEach(cat => {
      console.log(`- Name: ${cat.name}, Slug: ${cat.slug}`);
    });
    
    if (categories.length === 0) {
      console.log('\nNo categories found. Creating some...');
      const created = await prisma.category.createMany({
        data: [
          { name: 'Rings', slug: 'rings' },
          { name: 'Necklaces', slug: 'necklaces' },
          { name: 'Bracelets', slug: 'bracelets' },
        ]
      });
      console.log(`Created ${created.count} categories`);
    }
  } catch (e) {
    console.error('Error:', e.message);
  } finally {
    await prisma.$disconnect();
  }
}

main();