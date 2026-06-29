export type SiteContent = {
  brand: {
    name: string;
    tagline: string;
    logo: string;
  };
  contact: {
    phone: string;
    whatsapp: string;
    email: string;
    hours: string[];
    addresses: string[];
    social: {
      instagram: string;
      linkedin: string;
      email: string;
      whatsapp: string;
    };
  };
  seo: {
    title: string;
    description: string;
    keywords: string[];
  };
  home: {
    heroTitle: string;
    heroSubtitle: string;
    heroImage: string;
    introTitle: string;
    introText: string;
  };
  about: {
    title: string;
    heroImage: string;
    paragraphs: string[];
    team: Array<{
      name: string;
      role: string;
      focus: string;
      photo_url?: string | null;
    }>;
  };
  services: {
    title: string;
    heroImage: string;
    items: Array<{
      title: string;
      details: string[];
    }>;
  };
  locations: {
    title: string;
    items: Array<{
      city: string;
      address: string;
      mapQuery: string;
    }>;
  };
  cta: {
    title: string;
    text: string;
    button: string;
  };
};
