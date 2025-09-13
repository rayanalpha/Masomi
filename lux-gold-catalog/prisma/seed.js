/* eslint-disable no-console */
const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");

const prisma = new PrismaClient();

async function main() {
  // Admin user
  const adminEmail = "admin@example.com";
  const adminPassword = "admin123"; // dev only; change in production

  const existingAdmin = await prisma.user.findUnique({ where: { email: adminEmail } });
  if (!existingAdmin) {
    const passwordHash = await bcrypt.hash(adminPassword, 10);
    await prisma.user.create({
      data: {
        email: adminEmail,
        passwordHash,
        name: "Admin",
        role: "ADMIN",
      },
    });
    console.log("✔ Created admin user:", adminEmail);
  } else {
    console.log("ℹ Admin user already exists:", adminEmail);
  }

  // Categories
  const categoryNames = [
    { name: "Rings", slug: "rings" },
    { name: "Necklaces", slug: "necklaces" },
    { name: "Bracelets", slug: "bracelets" },
  ];
  for (const c of categoryNames) {
    await prisma.category.upsert({
      where: { slug: c.slug },
      update: {},
      create: { name: c.name, slug: c.slug },
    });
  }
  console.log("✔ Seeded categories");

  // Attributes
  const colorAttr = await prisma.attribute.upsert({
    where: { slug: "color" },
    update: {},
    create: { name: "Color", slug: "color" },
  });
  const gold = await prisma.attributeValue.upsert({
    where: { attributeId_slug: { attributeId: colorAttr.id, slug: "gold" } },
    update: {},
    create: { attributeId: colorAttr.id, value: "Gold", slug: "gold" },
  });
  const silver = await prisma.attributeValue.upsert({
    where: { attributeId_slug: { attributeId: colorAttr.id, slug: "silver" } },
    update: {},
    create: { attributeId: colorAttr.id, value: "Silver", slug: "silver" },
  });
  console.log("✔ Seeded attributes: color[gold, silver]");

  // Note: No demo products are created. Admin can add products from the dashboard.
  console.log("✔ Seeded attributes: color[gold, silver]");
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });

