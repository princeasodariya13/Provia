const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function check() {
  const users = await prisma.user.findMany();
  for (const user of users) {
    const profile = await prisma.professionalProfile.findFirst({
      where: { userId: user.id },
      include: {
        experiences: true,
        education: true,
        skills: true,
        projects: true,
        certifications: true,
        links: true,
      }
    });

    if (profile) {
      console.log(`User ${user.email} Profile:`);
      console.log(`- Experiences: ${profile.experiences.length}`);
      console.log(`- Education: ${profile.education.length}`);
      console.log(`- Projects: ${profile.projects.length}`);
      console.log(`- Certs: ${profile.certifications.length}`);
      
      const dedupe = async (items, keyFn, deleteModel) => {
        const seen = new Set();
        const toDelete = [];
        for (const item of items) {
          const key = keyFn(item);
          if (seen.has(key)) {
            toDelete.push(item.id);
          } else {
            seen.add(key);
          }
        }
        
        if (toDelete.length > 0) {
          console.log(`  Deleting ${toDelete.length} duplicates from ${deleteModel}`);
          await prisma[deleteModel].deleteMany({
            where: { id: { in: toDelete } }
          });
        }
      };

      await dedupe(profile.experiences, e => `${e.title}-${e.company}`, 'professionalExperience');
      await dedupe(profile.education, e => `${e.institution}-${e.degree}`, 'professionalEducation');
      await dedupe(profile.projects, e => e.name, 'professionalProject');
      await dedupe(profile.certifications, e => e.name, 'professionalCertification');
      await dedupe(profile.links, e => e.url, 'professionalLink');
    }
  }
}

check().finally(() => prisma.$disconnect());
