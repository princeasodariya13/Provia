const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function check() {
  const profile = await prisma.professionalProfile.findFirst({
    include: {
      education: true,
    }
  });

  if (!profile) return;
  console.log(JSON.stringify(profile.education, null, 2));
}

check().finally(() => prisma.$disconnect());
