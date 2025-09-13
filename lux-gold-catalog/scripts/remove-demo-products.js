/* eslint-disable no-console */
const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

async function main() {
  // Remove any pre-existing demo products by known slugs
  const demoSlugs = [
    "heritage-ring",
    "aurora-ring",
    "helix-bracelet",
    "venus-earrings",
    "zenith-set",
    "urban-cuff",
    "orbit-necklace",
    "nova-earrings",
    "atlas-chain",
    "luna-bracelet",
    "orion-set",
  ];

  for (const slug of demoSlugs) {
    const p = await prisma.product.findUnique({ where: { slug } });
    if (p) {
      await prisma.product.delete({ where: { id: p.id } });
      console.log("Deleted demo product:", slug);
    }
  }
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

