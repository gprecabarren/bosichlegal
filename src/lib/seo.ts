import type { SiteContent } from "@/types/site";

export function organizationSchema(content: SiteContent, baseUrl = "https://www.bosichlegal.cl") {
  const organizationId = `${baseUrl}/#estudio`;
  const branches = content.locations.items.map((location, index) => ({
    "@type": "LegalService", "@id": `${baseUrl}/ubicacion#oficina-${index + 1}`,
    name: `${content.brand.name} - ${location.city}`, url: `${baseUrl}/ubicacion`,
    parentOrganization: { "@id": organizationId }, image: `${baseUrl}/assets/site/location-hero.png`, telephone: content.contact.phone,
    address: { "@type": "PostalAddress", streetAddress: location.address, addressLocality: location.city, addressCountry: "CL" },
    hasMap: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(location.mapQuery)}`,
  }));
  return { "@context": "https://schema.org", "@graph": [
    { "@type": "Organization", "@id": organizationId, name: content.brand.name, url: baseUrl,
      logo: `${baseUrl}/assets/brand/logo-mark.jpg`, description: content.seo.description,
      telephone: content.contact.phone, email: content.contact.email, areaServed: { "@type": "Country", name: "Chile" },
      sameAs: [content.contact.social.instagram, content.contact.social.linkedin].filter(Boolean), department: branches.map(branch => ({ "@id": branch["@id"] })),
    },
    { "@type": "WebSite", "@id": `${baseUrl}/#website`, url: baseUrl, name: content.brand.name, inLanguage: "es-CL", publisher: { "@id": organizationId } },
    ...branches,
  ] };
}
