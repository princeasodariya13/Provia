import { prisma } from "../lib/db";
import crypto from "crypto";

function generatePublicCode() {
  return crypto.randomBytes(16).toString("hex"); // 32 characters
}

function normalizeUsername(name: string) {
  // Convert to lowercase, replace non-alphanumeric with hyphen, remove consecutive hyphens
  let username = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '');
  if (!username) username = "user";
  return username;
}

async function main() {
  const users = await prisma.user.findMany({
    where: { username: null }
  });

  console.log(`Found ${users.length} users missing username.`);

  for (const user of users) {
    let baseName = user.name || user.email.split('@')[0];
    let username = normalizeUsername(baseName);
    
    // Ensure uniqueness
    let isUnique = false;
    let suffix = 0;
    let finalUsername = username;
    
    while (!isUnique) {
      const existing = await prisma.user.findUnique({ where: { username: finalUsername } });
      if (existing) {
        suffix++;
        finalUsername = `${username}-${suffix}`;
      } else {
        isUnique = true;
      }
    }

    await prisma.user.update({
      where: { id: user.id },
      data: { username: finalUsername }
    });
    console.log(`Updated user ${user.id} with username ${finalUsername}`);
  }

  const publications = await prisma.portfolioPublication.findMany({
    where: { publicCode: null }
  });

  console.log(`Found ${publications.length} publications missing publicCode.`);

  for (const pub of publications) {
    let isUnique = false;
    let code = "";
    
    while (!isUnique) {
      code = generatePublicCode();
      const existing = await prisma.portfolioPublication.findUnique({ where: { publicCode: code } });
      if (!existing) {
        isUnique = true;
      }
    }

    await prisma.portfolioPublication.update({
      where: { id: pub.id },
      data: { publicCode: code }
    });
    console.log(`Updated publication ${pub.id} with publicCode ${code}`);
  }

  console.log("Migration complete.");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
