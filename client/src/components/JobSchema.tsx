import { useEffect } from "react";

interface JobSchemaProps {
  title: string;
  description: string;
  department: string;
  lastDate?: string;
  postDate?: string;
  qualification?: string;
  state?: string;
  category?: string;
  url: string;
  imageUrl?: string;
}

export default function JobSchema({
  title,
  description,
  department,
  lastDate,
  postDate,
  qualification,
  state,
  category,
  url,
  imageUrl = "https://www.sarkarijobseva.com/logo.png",
}: JobSchemaProps) {
  useEffect(() => {
    const schemaData = {
      "@context": "https://schema.org",
      "@type": "JobPosting",
      "title": title,
      "description": description,
      "hiringOrganization": {
        "@type": "Organization",
        "name": department || "Government of India",
        "sameAs": "https://www.india.gov.in",
        "logo": imageUrl,
      },
      "jobLocation": {
        "@type": "Place",
        "address": {
          "@type": "PostalAddress",
          "addressCountry": "IN",
          "addressRegion": state || "India",
        },
      },
      "employmentType": "FULL_TIME",
      "industry": "Government",
      "occupationalCategory": category || "Government Job",
      "educationRequirements": {
        "@type": "EducationalOccupationalCredential",
        "credentialCategory": qualification || "Graduate",
      },
      "datePosted": postDate || new Date().toISOString().split('T')[0],
      "validThrough": lastDate || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      "applicationContact": {
        "@type": "ContactPoint",
        "url": url,
        "contactType": "Application",
      },
      "mainEntityOfPage": {
        "@type": "WebPage",
        "@id": url,
      },
    };

    // Remove existing schema
    const existing = document.getElementById("job-schema-jsonld");
    if (existing) existing.remove();

    // Add new schema
    const script = document.createElement("script");
    script.type = "application/ld+json";
    script.id = "job-schema-jsonld";
    script.textContent = JSON.stringify(schemaData);
    document.head.appendChild(script);

    return () => {
      const el = document.getElementById("job-schema-jsonld");
      if (el) el.remove();
    };
  }, [title, description, department, lastDate, postDate, qualification, state, category, url, imageUrl]);

  return null;
}

// Breadcrumb Schema Component
export function BreadcrumbSchema({ items }: { items: { name: string; url: string }[] }) {
  useEffect(() => {
    const schemaData = {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      "itemListElement": items.map((item, index) => ({
        "@type": "ListItem",
        "position": index + 1,
        "name": item.name,
        "item": item.url,
      })),
    };

    const existing = document.getElementById("breadcrumb-schema-jsonld");
    if (existing) existing.remove();

    const script = document.createElement("script");
    script.type = "application/ld+json";
    script.id = "breadcrumb-schema-jsonld";
    script.textContent = JSON.stringify(schemaData);
    document.head.appendChild(script);

    return () => {
      const el = document.getElementById("breadcrumb-schema-jsonld");
      if (el) el.remove();
    };
  }, [items]);

  return null;
}

// Organization Schema
export function OrganizationSchema() {
  useEffect(() => {
    const schemaData = {
      "@context": "https://schema.org",
      "@type": "Organization",
      "name": "SarkariJobSeva",
      "url": "https://www.sarkarijobseva.com",
      "logo": "https://www.sarkarijobseva.com/logo.png",
      "description": "India's most trusted government job information portal providing latest updates on SSC, Railway, UPSC, Bank, Police, and State Government jobs.",
      "sameAs": [
        "https://t.me/sarkarijobse",
      ],
      "contactPoint": {
        "@type": "ContactPoint",
        "email": "supportsarkarijobseva@gmail.com",
        "contactType": "Customer Support",
        "availableLanguage": ["Hindi", "English"],
      },
    };

    const existing = document.getElementById("org-schema-jsonld");
    if (existing) existing.remove();

    const script = document.createElement("script");
    script.type = "application/ld+json";
    script.id = "org-schema-jsonld";
    script.textContent = JSON.stringify(schemaData);
    document.head.appendChild(script);

    return () => {
      const el = document.getElementById("org-schema-jsonld");
      if (el) el.remove();
    };
  }, []);

  return null;
}

// WebSite Schema with Search
export function WebsiteSchema() {
  useEffect(() => {
    const schemaData = {
      "@context": "https://schema.org",
      "@type": "WebSite",
      "name": "SarkariJobSeva",
      "url": "https://www.sarkarijobseva.com",
      "potentialAction": {
        "@type": "SearchAction",
        "target": {
          "@type": "EntryPoint",
          "urlTemplate": "https://www.sarkarijobseva.com/search?q={search_term_string}",
        },
        "query-input": "required name=search_term_string",
      },
    };

    const existing = document.getElementById("website-schema-jsonld");
    if (existing) existing.remove();

    const script = document.createElement("script");
    script.type = "application/ld+json";
    script.id = "website-schema-jsonld";
    script.textContent = JSON.stringify(schemaData);
    document.head.appendChild(script);

    return () => {
      const el = document.getElementById("website-schema-jsonld");
      if (el) el.remove();
    };
  }, []);

  return null;
}
