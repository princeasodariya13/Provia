import type { MetadataRoute } from "next";
import { prisma } from "@/lib/db";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://provia-developer.vercel.app";

  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: `${baseUrl}`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1.0,
    },
    {
      url: `${baseUrl}/about`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: `${baseUrl}/blog`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.8,
    },
    {
      url: `${baseUrl}/contact`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.5,
    },
    {
      url: `${baseUrl}/how-it-works`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: `${baseUrl}/features/ai-extraction`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: `${baseUrl}/features/portfolio-generation`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: `${baseUrl}/features/premium-designs`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.8,
    },
  ];

  let dynamicPortfolioRoutes: MetadataRoute.Sitemap = [];

  try {
    const publications = await prisma.portfolioPublication.findMany({
      where: {
        isActive: true,
        publicCode: { not: null },
        user: { username: { not: null } },
        portfolioDocument: {
          status: "PUBLISHED",
        },
      },
      select: {
        publicCode: true,
        updatedAt: true,
        user: {
          select: {
            username: true,
          },
        },
        portfolioDocument: {
          select: {
            content: true,
            updatedAt: true,
          },
        },
      },
    });

    dynamicPortfolioRoutes = publications
      .filter((pub) => {
        if (!pub.user?.username || !pub.publicCode) return false;
        try {
          const content = JSON.parse(pub.portfolioDocument.content);
          if (content?.seo?.noIndex === true) {
            return false;
          }
        } catch {
          // If content parsing fails, retain safe default
        }
        return true;
      })
      .map((pub) => {
        const lastMod = pub.portfolioDocument?.updatedAt || pub.updatedAt || new Date();
        return {
          url: `${baseUrl}/${pub.user!.username}/${pub.publicCode}`,
          lastModified: new Date(lastMod),
          changeFrequency: "weekly",
          priority: 0.7,
        };
      });
  } catch (error) {
    console.error("Failed to query public portfolios for sitemap:", error);
  }

  return [...staticRoutes, ...dynamicPortfolioRoutes];
}
