import { AdminContacts } from "../../AdminContacts";
import { listContactSubmissions } from "@/lib/contact-submissions";

export const dynamic = "force-dynamic";

export default async function ContactRequestsPage() {
  return <AdminContacts submissions={await listContactSubmissions()} />;
}
