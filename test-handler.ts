import { PrismaClient } from '@prisma/client';
import { ResumeExtractionHandler } from './lib/jobs/handlers/resume-extraction';

const prisma = new PrismaClient();

async function main() {
  const resume = await prisma.resume.findFirst({ orderBy: { createdAt: 'desc' }});
  if (!resume) return console.log("No resume");

  console.log("Processing resume:", resume.id);
  try {
    await ResumeExtractionHandler.handler({
      payload: { userId: resume.userId, resumeId: resume.id },
      id: 'test', type: 'RESUME_EXTRACTION', status: 'PROCESSING', createdAt: new Date(), updatedAt: new Date(), attempts: 1
    } as any);
    console.log("Success!");
  } catch (e) {
    console.error("Handler error:", e);
  }
}

main().finally(() => prisma.$disconnect());
