import { NextResponse } from "next/server";
import { withAPIHandler } from "@/lib/api-handler";
import { requireAuth } from "@/lib/auth";
import { prisma } from "@/lib/db";

export const GET = withAPIHandler(async () => {
  const user = await requireAuth();
  
  const profile = await prisma.professionalProfile.findFirst({
    where: { userId: user.id },
    include: {
      projects: true,
      user: true
    }
  });

  const connections = await prisma.connection.findMany({
    where: { userId: user.id }
  });

  const resumes = await prisma.resume.findMany({
    where: { userId: user.id, isActive: true }
  });

  const hasName = Boolean(profile?.user?.name || profile?.fullName);
  const hasHeadline = Boolean(profile?.headline || profile?.bio);
  const hasProject = (profile?.projects?.length || 0) > 0;
  
  const hasGithub = connections.some(c => c.provider === "GITHUB" && c.state === "SYNCED");
  const hasLinkedin = connections.some(c => c.provider === "LINKEDIN" && c.state === "SYNCED");
  const hasResume = resumes.length > 0;

  // Sensible minimum threshold:
  // Must have a name and headline/bio, PLUS at least one meaningful source of truth (resume, github, linkedin, or manual projects)
  const isReady = hasName && hasHeadline && (hasGithub || hasLinkedin || hasResume || hasProject);

  const checks = [
    {
      id: "name",
      label: "Name added",
      passed: hasName,
      actionLabel: "Edit Profile",
      actionUrl: "/profile"
    },
    {
      id: "headline",
      label: "Professional headline or bio added",
      passed: hasHeadline,
      actionLabel: "Edit Profile",
      actionUrl: "/profile"
    },
    {
      id: "project",
      label: "Add at least one project",
      passed: hasProject,
      actionLabel: "Add Project",
      actionUrl: "/profile"
    },
    {
      id: "github",
      label: "Connect GitHub",
      passed: hasGithub,
      actionLabel: "Connect GitHub",
      actionUrl: "/integrations"
    },
    {
      id: "resume",
      label: "Upload your resume",
      passed: hasResume,
      actionLabel: "Upload Resume",
      actionUrl: "/profile"
    },
    {
      id: "linkedin",
      label: "Connect LinkedIn",
      passed: hasLinkedin,
      actionLabel: "Connect LinkedIn",
      actionUrl: "/integrations"
    }
  ];

  return NextResponse.json({
    success: true,
    data: {
      isReady,
      checks
    }
  });
});
