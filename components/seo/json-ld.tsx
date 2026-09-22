import React from "react";

export function JsonLd() {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://provia-developer.vercel.app";

  const jsonLdData = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        "@id": `${baseUrl}/#organization`,
        name: "Provia",
        url: baseUrl,
        logo: `${baseUrl}/logo.png`,
      },
      {
        "@type": "WebApplication",
        "@id": `${baseUrl}/#webapp`,
        name: "Provia Platform",
        url: baseUrl,
        description:
          "Transform your GitHub, LinkedIn, and resume into a stunning, responsive portfolio website automatically. High-impact identity platform for ambitious professionals.",
        applicationCategory: "DesignApplication",
        operatingSystem: "All",
        publisher: {
          "@id": `${baseUrl}/#organization`,
        },
      },
    ],
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdData) }}
    />
  );
}
