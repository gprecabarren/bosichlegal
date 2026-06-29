import { MessageCircle } from "lucide-react";
import type { SiteContent } from "@/types/site";

export function FloatingWhatsApp({ content }: { content: SiteContent }) {
  return (
    <a
      className="floating-whatsapp"
      href={content.contact.social.whatsapp}
      target="_blank"
      aria-label="Contactar por WhatsApp"
    >
      <MessageCircle size={22} />
    </a>
  );
}
