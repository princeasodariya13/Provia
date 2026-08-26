import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  const result = await prisma.job.updateMany({
    where: { status: 'PROCESSING' },
    data: { status: 'QUEUED' }
  });
  console.log("Reset jobs:", result.count);
  
  const resume = await prisma.resume.updateMany({
    where: { status: 'FAILED' },
    data: { status: 'PROCESSING', extractionError: null }
  });
  console.log("Reset resumes:", resume.count);
}

main().finally(() => prisma.$disconnect());
