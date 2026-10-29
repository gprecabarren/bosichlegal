import { ServicePageEditor } from "@/app/admin/ServicePageEditor";
import { listAdminServicePages } from "@/lib/service-pages";

export default async function NewServicePage() { return <ServicePageEditor pages={await listAdminServicePages()} />; }
