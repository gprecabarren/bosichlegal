import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { ServiceIcon } from "@/components/ServiceIcon";
import { serviceLinks } from "@/lib/service-fields";
import type { ServiceItem, ServicePageSummary } from "@/types/service";

export function ServiceCard({ service, pages, index, compact = false, buttonLabel = "Ver más información" }: { service: ServiceItem; pages: ServicePageSummary[]; index: number; compact?: boolean; buttonLabel?: string }) {
  const { primary, topics } = serviceLinks(service, pages);
  return <article className={`service-card${primary ? " service-card-linked" : ""}${service.icon === "digital" ? " service-card-digital" : ""}`}>
    <div className="service-card-icon"><ServiceIcon title={service.title} icon={service.icon} index={index} /></div>
    <h3>{service.title}</h3>
    {service.description ? <p className="service-description">{service.description}</p> : null}
    <ul>{(compact ? service.details.slice(0, 3) : service.details).map(detail => <li key={detail}>{detail}</li>)}</ul>
    {primary ? <div className="service-card-links">
      <Link className="service-primary-link" href={`/servicios/${primary.slug}`} aria-label={`${buttonLabel}: ${service.title}`}>{buttonLabel}<ArrowRight size={18} aria-hidden="true" /></Link>
      {topics.length ? <div className="service-topic-links">{topics.map(topic => <Link href={`/servicios/${topic.pageSlug}`} key={topic.pageSlug}>{topic.label}<ArrowRight size={15} aria-hidden="true" /></Link>)}</div> : null}
    </div> : null}
  </article>;
}
