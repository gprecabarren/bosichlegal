import Link from "next/link";
import { Instagram, Linkedin, LockKeyhole, Mail, MessageCircle } from "lucide-react";
import type { SiteContent } from "@/types/site";
import { resolveLinkedInProfileUrl } from "@/lib/linkedin";
import { layoutCopy } from "@/lib/layout-copy";

export function SiteHeader({ content }: { content: SiteContent }) {
  const copy = layoutCopy(content.layoutCopy);
  const nav = [
    { href: "/", label: copy.navHome }, { href: "/servicios", label: copy.navServices }, { href: "/propiedades", label: copy.navProperties }, { href: "/noticias", label: copy.navNews }, { href: "/ubicacion", label: copy.navLocation }, { href: "/sobre-nosotros", label: copy.navAbout }, { href: "/contacto", label: copy.navContact },
  ];
  const social = content.contact.social;
  const linkedinUrl = resolveLinkedInProfileUrl(social.linkedin);

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
        <a className="social-admin" href="/admin" aria-label="Panel de administración">
          <LockKeyhole size={17} />
        </a>
      </div>
    </header>
  );
}
