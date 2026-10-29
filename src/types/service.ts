export type ServiceTopic = { label: string; pageSlug: string };
export type ServiceItem = {
  title: string;
  description?: string;
  icon?: string;
  details: string[];
  showOnHome?: boolean;
  clickable?: boolean;
  pageSlug?: string;
  topics?: ServiceTopic[];
};
export type ServicePageContent = {
  eyebrow: string;
  intro: string;
  heroImage: string;
  heroAlt: string;
  notice: string;
  sections: { title: string; text: string; bullets: string[] }[];
  steps: { title: string; text: string }[];
  faqs: { question: string; answer: string }[];
  sources: { label: string; url: string }[];
  relatedSlugs: string[];
  reviewedAt: string;
};
export type ServicePageInput = {
  slug: string;
  title: string;
  status: "draft" | "published";
  noindex: boolean;
  seo_title: string;
  meta_description: string;
  focus_keyword: string;
  og_title: string;
  og_description: string;
  content: ServicePageContent;
};
export type ServicePage = ServicePageInput & { id: string; created_at: string; updated_at: string };
export type ServicePageSummary = Pick<ServicePage, "id" | "slug" | "title" | "status" | "noindex" | "updated_at">;
