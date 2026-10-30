"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Building2, FilePenLine, Files, FolderCog, Inbox, LayoutDashboard, LogOut, Scale, UsersRound } from "lucide-react";
import { logoutAction } from "./actions";

type AdminShellProps = {
  children: React.ReactNode;
};

const sections = [
  { href: "/admin", label: "Resumen", icon: LayoutDashboard },
  { href: "/admin/crear-blog", label: "Noticias", icon: FilePenLine },
  { href: "/admin/paginas", label: "Páginas y SEO", icon: Files },
  { href: "/admin/propiedades", label: "Propiedades", icon: Building2 },
  { href: "/admin/servicios", label: "Servicios", icon: Scale },
  { href: "/admin/miembros", label: "Miembros", icon: UsersRound },
  { href: "/admin/solicitudes-contacto", label: "Solicitudes", icon: Inbox },
  { href: "/admin/contenido", label: "Ajustes", icon: FolderCog },
];

export function AdminShell({ children }: AdminShellProps) {
  const pathname = usePathname();
  return (
    <section className="admin-page">
      <div className="admin-heading">
        <div>
          <p className="eyebrow">Panel privado</p>
          <h1>Administrar Bosich Legal</h1>
          <p>Gestiona publicaciones, solicitudes, miembros y contenido del sitio.</p>
        </div>
        <form action={logoutAction}>
          <button className="logout-button" type="submit">
            <LogOut size={16} />
            Salir
          </button>
        </form>
      </div>
      <nav className="admin-section-nav" aria-label="Secciones de administración">
        {sections.map(({ href, label, icon: Icon }) => (
          <Link key={href} href={href} className="admin-section-link" aria-current={(href === "/admin" ? pathname === href : pathname.startsWith(href)) ? "page" : undefined}>
            <Icon size={17} />
            {label}
          </Link>
        ))}
      </nav>
      <div className="admin-section-content">{children}</div>
    </section>
  );
}
