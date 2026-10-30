import Link from "next/link";
import { ArrowRight, Building2, FilePenLine, Files, Inbox, Scale, Settings, UsersRound } from "lucide-react";

const sections = [
  { href: "/admin/crear-blog", title: "Noticias", text: "Publicaciones, borradores y papelera.", icon: FilePenLine },
  { href: "/admin/paginas", title: "Páginas y SEO", text: "Textos, imágenes e indexación de las páginas principales.", icon: Files },
  { href: "/admin/servicios/paginas", title: "Páginas de servicios", text: "Crear y editar páginas, contenido y SEO de cada especialidad.", icon: Scale },
  { href: "/admin/servicios", title: "Tarjetas de servicios", text: "Orden, visibilidad y enlaces desde inicio y servicios.", icon: Scale },
  { href: "/admin/propiedades", title: "Propiedades", text: "Catálogo, fotografías, ubicaciones y papelera.", icon: Building2 },
  { href: "/admin/miembros", title: "Miembros", text: "Equipo, fotografías y orden de presentación.", icon: UsersRound },
  { href: "/admin/solicitudes-contacto", title: "Solicitudes", text: "Consultas recibidas y seguimiento de contacto.", icon: Inbox },
  { href: "/admin/contenido", title: "Ajustes generales", text: "Contacto, redes, notificaciones e integraciones.", icon: Settings },
];

export default function AdminIndexPage() {
  return <section className="admin-overview"><h2>Contenido y gestión</h2><div className="admin-overview-grid">
    {sections.map(({ href, title, text, icon: Icon }) => <Link key={href} href={href} className="admin-overview-item"><Icon size={22} /><div><h3>{title}</h3><p>{text}</p></div><ArrowRight size={18} /></Link>)}
  </div></section>;
}
