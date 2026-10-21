import { getSiteContent } from "@/lib/content";
import { ServicesEditor } from "../../ServicesEditor";

export const dynamic = "force-dynamic";

export default async function AdminServicesPage() {
  const content = await getSiteContent();
  return <ServicesEditor services={content.services} />;
}
