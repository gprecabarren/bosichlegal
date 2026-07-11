import { AdminForm } from "../../AdminForm";
import { getSiteContent } from "@/lib/content";

export const dynamic = "force-dynamic";

export default async function ContentPage() {
  return <AdminForm content={await getSiteContent()} />;
}
