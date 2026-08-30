const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  try {
    const user = await prisma.user.findFirst();
    console.log("Success:", user?.email);
  } catch (error) {
    console.error("Database Error:", error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
