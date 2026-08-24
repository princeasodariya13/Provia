import { PortfolioDocumentDTO } from "@/lib/schemas/portfolio";

export const mockPortfolioDocument: PortfolioDocumentDTO = {
  schemaVersion: "1.0.0",
  metadata: {
    generatedAt: new Date().toISOString(),
    title: "Jane Doe - Portfolio",
  },
  hero: {
    name: "Jane Doe",
    headline: "Full Stack Software Engineer",
    shortIntroduction: "Passionate software engineer building scalable web applications. I love turning complex problems into simple, beautiful, and intuitive designs.",
    primaryLinks: [
      { title: "GitHub", url: "https://github.com" },
      { title: "LinkedIn", url: "https://linkedin.com" },
      { title: "Twitter", url: "https://twitter.com" }
    ]
  },
  about: {
    summary: "With over 5 years of experience in full-stack development, I specialize in React, Node.js, and cloud architecture. I thrive in collaborative environments and enjoy mentoring junior developers.",
    careerThemes: ["Scalable Architecture", "UI/UX Engineering", "Open Source"]
  },
  experience: [
    {
      title: "Senior Frontend Engineer",
      company: "TechNova Solutions",
      location: "Remote",
      startDate: "2021-03-01",
      isCurrent: true,
      description: "Led the frontend architecture migration from Vue to React/Next.js. Improved core web vitals by 45%. Mentored junior engineers and established design system guidelines."
    },
    {
      title: "Software Engineer",
      company: "Creative Code Agency",
      location: "New York, NY",
      startDate: "2018-06-01",
      endDate: "2021-02-28",
      isCurrent: false,
      description: "Developed responsive web applications for enterprise clients. Integrated RESTful APIs and optimized database queries to reduce load times by 30%."
    }
  ],
  education: [
    {
      institution: "University of Technology",
      degree: "B.S.",
      fieldOfStudy: "Computer Science",
      location: "Boston, MA",
      startDate: "2014-09-01",
      endDate: "2018-05-30",
      description: "Graduated with honors. Specialization in Human-Computer Interaction."
    }
  ],
  projects: [
    {
      name: "Auralis E-commerce",
      description: "A high-performance headless e-commerce storefront built with Next.js App Router and Shopify Storefront API. Features optimistic cart updates and 3D product previews.",
      url: "https://example.com",
      repositoryUrl: "https://github.com",
      technologies: ["Next.js", "React", "TailwindCSS", "TypeScript"]
    },
    {
      name: "Pulse Analytics Dashboard",
      description: "Real-time data visualization dashboard processing millions of events per day. Utilized WebSockets for live updates and D3.js for custom charting.",
      url: "https://example.com",
      repositoryUrl: "https://github.com",
      technologies: ["Vue.js", "D3.js", "Node.js", "PostgreSQL"]
    },
    {
      name: "Syntax Syntax Highlighter",
      description: "An open-source lightweight syntax highlighting library for modern browsers with zero dependencies. Used by over 10,000 projects globally.",
      repositoryUrl: "https://github.com",
      technologies: ["TypeScript", "Open Source", "Web APIs"]
    }
  ],
  skills: [
    { category: "Frontend", skills: ["React", "Next.js", "TailwindCSS", "Vue.js", "Svelte"] },
    { category: "Backend", skills: ["Node.js", "PostgreSQL", "MongoDB", "GraphQL"] },
    { category: "Languages", skills: ["TypeScript", "JavaScript", "Python", "Go"] }
  ],
  certifications: [
    {
      name: "AWS Certified Solutions Architect",
      organization: "Amazon Web Services",
      issueDate: "2023-01-15",
      credentialUrl: "https://aws.amazon.com"
    }
  ],
  contact: {
    email: "jane.doe@example.com",
    location: "San Francisco, CA"
  },
  seo: {
    title: "Jane Doe | Full Stack Engineer",
    description: "Portfolio of Jane Doe, a full stack software engineer."
  }
};
