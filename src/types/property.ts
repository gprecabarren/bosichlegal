export type PropertyImage = { url: string; alt: string; caption: string };
export type PropertyStatus = "draft" | "published" | "sold";
export type PropertyInput = {
  title: string;
  slug: string;
  description: string;
  region: string;
  city: string;
  address: string;
  property_type: string;
  price: number | null;
  currency: "CLP" | "UF";
  bedrooms: number | null;
  bathrooms: number | null;
  area_m2: number | null;
  land_m2: number | null;
  images: PropertyImage[];
  status: PropertyStatus;
  seo_title: string;
  meta_description: string;
};
export type Property = PropertyInput & {
  id: string;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
};
