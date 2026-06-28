import type { Metadata } from "next";
import { getSiteContent } from "@/lib/content";
import { AdminForm } from "./AdminForm";

export const metadata: Metadata = {
  title: "Admin",
  robots: { index: false, follow: false },
};

export default async function AdminPage() {
  const content = await getSiteContent();

  return (
    <section className="admin-page">
      <div className="admin-heading">
        <p className="eyebrow">Panel privado</p>
        <h1>Administrar Bosich Legal</h1>
        <p>Edita los campos principales del sitio, SEO, contacto, redes sociales, servicios y sobre nosotros.</p>
      </div>
      <AdminForm content={content} />
    </section>
  );
}

