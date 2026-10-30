import type { ServiceItem } from "./service";

export type StaticPagePath = "/" | "/servicios" | "/sobre-nosotros" | "/ubicacion" | "/contacto" | "/noticias" | "/propiedades";
export type PageFieldValue = string | string[];
export type StaticPageSeo = {
  title?: string;
  description?: string;
  canonical?: string;
  ogTitle?: string;
  ogDescription?: string;
  ogImage?: string;
  /** Compatibility input. New saves use seo.noindexPaths as the single source. */
  noindex?: boolean;
};
export type StaticPageOverride = {
  content?: Record<string, PageFieldValue>;
  seo?: StaticPageSeo;
};

export type SiteContent = {
  layoutCopy?: Partial<Record<keyof typeof import("../lib/layout-copy").layoutCopyDefaults, string>>;
  pages?: Partial<Record<StaticPagePath, StaticPageOverride>>;
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
    googleSiteVerification?: string;
    noindexPaths?: string[];
  };
  integrations?: {
    searchConsoleProperty?: string;
    contactNotifyEmail?: string;
    contactFromEmail?: string;
    turnstileSiteKey?: string;
    corporateEmailProvider?: string;
    corporateEmailNotes?: string;
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
    description?: string;
    homeTitle?: string;
    introTitle?: string;
    heroImage: string;
    items: ServiceItem[];
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
