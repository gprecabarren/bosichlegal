import type { SiteContent } from "@/types/site";
import { siteUrl } from "@/lib/content";

export function organizationSchema(content: SiteContent) {
  const baseUrl = siteUrl();

  return {
    "@context": "https://schema.org",
    "@type": ["LegalService", "Attorney"],
    name: content.brand.name,
    url: baseUrl,
    logo: `${baseUrl}${content.brand.logo}`,
    image: `${baseUrl}${content.home.heroImage}`,
    description: content.seo.description,
    telephone: content.contact.phone,
    email: content.contact.email,
    areaServed: ["Concepción", "Santiago", "Valdivia", "Chile"],
    address: content.locations.items.map((item) => ({
      "@type": "PostalAddress",
      streetAddress: item.address,
      addressCountry: "CL",
    })),
    openingHoursSpecification: [
      {
        "@type": "OpeningHoursSpecification",
        dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
        opens: "09:00",
        closes: "19:00",
      },
      {
        "@type": "OpeningHoursSpecification",
        dayOfWeek: "Saturday",
        opens: "09:00",
        closes: "14:00",
      },
    ],
    sameAs: [
      content.contact.social.instagram,
      content.contact.social.linkedin,
    ].filter(Boolean),
    makesOffer: content.services.items.map((service) => ({
      "@type": "Offer",
      itemOffered: {
        "@type": "Service",
        name: service.title,
        serviceType: service.title,
      },
    })),
  };
}

