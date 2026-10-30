import Link from "next/link";
import { Instagram, Linkedin, Mail, MapPin, MessageCircle, Phone } from "lucide-react";
import type { SiteContent } from "@/types/site";
import { resolveLinkedInProfileUrl } from "@/lib/linkedin";
import { layoutCopy } from "@/lib/layout-copy";

function phoneHref(phone: string) {
  const compact = phone.replace(/[^\d+]/g, "");
  return `tel:${compact.startsWith("+") ? compact : `+${compact}`}`;
}

function mapsHref(query: string) {
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`;
}

export function Footer({ content }: { content: SiteContent }) {
  const copy = layoutCopy(content.layoutCopy);
  const social = content.contact.social;
  const linkedinUrl = resolveLinkedInProfileUrl(social.linkedin);

  return (
    <footer className="footer">
      <div className="footer-grid">
        <div>
          <img className="footer-logo" src="/assets/brand/logo-mark.jpg" alt="Bosich Legal" />
          <p>{content.seo.description}</p>
          <div className="footer-social">
            {social.instagram ? (
              <a className="social-instagram" href={social.instagram} aria-label="Instagram" target="_blank">
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
          </div>
        </div>
        <div>
          <h2>{copy.footerContact}</h2>
          <a href={phoneHref(content.contact.phone)}><Phone size={16} /> {content.contact.phone}</a>
          <a href={`mailto:${content.contact.email}`}><Mail size={16} /> {content.contact.email}</a>
          <a href={social.whatsapp} target="_blank" rel="noreferrer"><MessageCircle size={16} /> {copy.footerWhatsapp}</a>
        </div>
        <div>
          <h2>{copy.footerOffices}</h2>
          {content.locations.items.map((location) => (
            <a key={location.address} href={mapsHref(location.mapQuery)} target="_blank" rel="noreferrer">
              <MapPin size={16} /> {location.address}
            </a>
          ))}
        </div>
        <div>
          <h2>{copy.footerNavigation}</h2>
          <Link href="/servicios">{copy.footerServices}</Link>
          <Link href="/propiedades">{copy.footerProperties}</Link>
          <Link href="/sobre-nosotros">{copy.footerAbout}</Link>
          <Link href="/ubicacion">{copy.footerLocation}</Link>
          <Link href="/contacto">{copy.footerContactLink}</Link>
        </div>
      </div>
      <div className="footer-bottom">
        <span>© {new Date().getFullYear()} Bosich Legal</span>
      </div>
    </footer>
  );
}
