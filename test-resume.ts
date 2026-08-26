import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  const resume = await prisma.resume.findFirst({ orderBy: { createdAt: 'desc' }});
  console.log("Resume status:", resume?.status);
  console.log("Extraction Error:", resume?.extractionError);
  
  const job = await prisma.job.findFirst({ orderBy: { createdAt: 'desc' }});
  console.log("Job payload:", job?.payload);
  console.log("Job status:", job?.status);
  console.log("Job error:", job?.lastError);
}

main().finally(() => prisma.$disconnect());
