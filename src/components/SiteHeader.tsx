import Link from "next/link";
import { Instagram, Linkedin, Mail, MessageCircle } from "lucide-react";
import type { SiteContent } from "@/types/site";

const nav = [
  { href: "/", label: "Inicio" },
  { href: "/servicios", label: "Servicios" },
  { href: "/ubicacion", label: "Ubicación" },
  { href: "/sobre-nosotros", label: "Sobre nosotros" },
  { href: "/contacto", label: "Contacto" },
];

export function SiteHeader({ content }: { content: SiteContent }) {
  const social = content.contact.social;

  return (
    <header className="site-header">
      <Link className="brand" href="/" aria-label="Bosich Legal inicio">
        <img src={content.brand.logo} alt="Bosich Legal" />
        <span>
          <strong>{content.brand.name}</strong>
          <small>{content.brand.tagline}</small>
        </span>
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
          <a href={social.instagram} aria-label="Instagram" target="_blank">
            <Instagram size={18} />
          </a>
        ) : null}
        {social.linkedin ? (
          <a href={social.linkedin} aria-label="LinkedIn" target="_blank">
            <Linkedin size={18} />
          </a>
        ) : null}
        <a href={social.email} aria-label="Correo electrónico">
          <Mail size={18} />
        </a>
        <a href={social.whatsapp} aria-label="WhatsApp" target="_blank">
          <MessageCircle size={18} />
        </a>
      </div>
    </header>
  );
}

