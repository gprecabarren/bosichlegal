import Link from "next/link";
import { Instagram, Linkedin, Mail, MapPin, MessageCircle, Phone } from "lucide-react";
import type { SiteContent } from "@/types/site";

export function Footer({ content }: { content: SiteContent }) {
  const social = content.contact.social;

  return (
    <footer className="footer">
      <div className="footer-grid">
        <div>
          <img className="footer-logo" src={content.brand.logo} alt="Bosich Legal" />
          <p>{content.seo.description}</p>
          <div className="footer-social">
            {social.instagram ? (
              <a className="social-instagram" href={social.instagram} aria-label="Instagram" target="_blank">
                <Instagram size={18} />
              </a>
            ) : null}
            {social.linkedin ? (
              <a className="social-linkedin" href={social.linkedin} aria-label="LinkedIn" target="_blank">
                <Linkedin size={18} />
              </a>
            ) : null}
            <a className="social-mail" href={social.email} aria-label="Correo electrónico">
              <Mail size={18} />
            </a>
            <a className="social-whatsapp" href={social.whatsapp} aria-label="WhatsApp" target="_blank">
              <MessageCircle size={18} />
            </a>
          </div>
        </div>
        <div>
          <h2>Contacto</h2>
          <p><Phone size={16} /> {content.contact.phone}</p>
          <p><Mail size={16} /> {content.contact.email}</p>
          <p><MessageCircle size={16} /> WhatsApp directo</p>
        </div>
        <div>
          <h2>Oficinas</h2>
          {content.contact.addresses.map((address) => (
            <p key={address}><MapPin size={16} /> {address}</p>
          ))}
        </div>
        <div>
          <h2>Navegación</h2>
          <Link href="/servicios">Servicios jurídicos</Link>
          <Link href="/sobre-nosotros">Sobre nosotros</Link>
          <Link href="/ubicacion">Ubicación</Link>
          <Link href="/contacto">Contacto</Link>
        </div>
      </div>
      <div className="footer-bottom">
        <span>© {new Date().getFullYear()} Bosich Legal</span>
        <Link href="/admin">Admin</Link>
      </div>
    </footer>
  );
}
