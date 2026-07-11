import Link from "next/link";
import { Instagram, Linkedin, LockKeyhole, Mail, MessageCircle } from "lucide-react";
import type { SiteContent } from "@/types/site";

const nav = [
  { href: "/", label: "Inicio" },
  { href: "/servicios", label: "Servicios" },
  { href: "/noticias", label: "Noticias" },
  { href: "/ubicacion", label: "Ubicación" },
  { href: "/sobre-nosotros", label: "Sobre nosotros" },
  { href: "/contacto", label: "Contacto" },
];

const linkedinFallback = "https://www.linkedin.com/company/bosich-legal/";

export function SiteHeader({ content }: { content: SiteContent }) {
  const social = content.contact.social;
  const linkedinUrl = social.linkedin || linkedinFallback;

  return (
    <header className="site-header">
      <Link className="brand" href="/" aria-label="Bosich Legal inicio">
        <img src="/assets/brand/logo-web.svg" alt={`${content.brand.name} ${content.brand.tagline}`} />
      </Link>
      <nav aria-label="Navegación principal">
        {nav.map((item) => (
          <Link key={item.href} href={item.href}>
            {item.label}
          </Link>
        ))}
      </nav>
      <div className="social-links" aria-label="Redes sociales y contacto">
        {social.instagram ? (
          <a className="social-instagram" href={social.instagram} aria-label="Instagram" target="_blank" rel="noreferrer">
            <Instagram size={18} />
          </a>
        ) : null}
        <a className="social-linkedin" href={linkedinUrl} aria-label="LinkedIn" target="_blank" rel="noreferrer">
          <Linkedin size={18} />
        </a>
        <a className="social-mail" href={social.email} aria-label="Correo electrónico">
          <Mail size={18} />
        </a>
        <a className="social-whatsapp" href={social.whatsapp} aria-label="WhatsApp" target="_blank" rel="noreferrer">
          <MessageCircle size={18} />
        </a>
        <a className="social-admin" href="/admin/crear-blog" aria-label="Panel de administración">
          <LockKeyhole size={17} />
        </a>
      </div>
    </header>
  );
}
