import Link from "next/link";
import { Pencil, Plus, Trash2, Building2 } from "lucide-react";
import { listAdminProperties } from "@/lib/properties";
import { propertyPrice, propertyStatuses, regionName } from "@/lib/property-fields";
import { PropertyDeleteButton, PropertyTrashButton } from "../../PropertyEditor";

export const dynamic = "force-dynamic";

export default async function AdminPropertiesPage({ searchParams }: { searchParams: Promise<{ vista?: string }> }) {
  const inTrash = (await searchParams).vista === "papelera";
  let properties;
  try { properties = await listAdminProperties(); } catch (error) {
    return <div className="admin-warning" role="alert">{error instanceof Error ? error.message : "No se pudieron cargar las propiedades."}</div>;
  }
  const active = properties.filter((property) => !property.deleted_at);
  const trash = properties.filter((property) => property.deleted_at);
  return <div className="property-admin-list">
    <div className="editor-section-heading"><h2>Propiedades</h2><Link className="button" href="/admin/propiedades/nueva"><Plus size={18} />Nueva propiedad</Link></div>
    <nav className="admin-view-tabs" aria-label="Vistas de propiedades"><Link aria-current={!inTrash ? "page" : undefined} href="/admin/propiedades"><Building2 size={16} />Activas ({active.length})</Link><Link aria-current={inTrash ? "page" : undefined} href="/admin/propiedades?vista=papelera"><Trash2 size={16} />Papelera ({trash.length})</Link></nav>
    {!inTrash && active.length === 0 ? <div className="empty-state"><h3>Aún no hay propiedades</h3><p>Las propiedades publicadas aparecerán en el catálogo.</p></div> : null}
    {!inTrash && active.map((property) => <article key={property.id} className="property-admin-row">
      {property.images[0] ? <img src={property.images[0].url} alt="" /> : <div className="property-photo-placeholder">Sin foto</div>}
      <div><span className={`property-status property-status-${property.status}`}>{propertyStatuses[property.status]}</span><h3>{property.title}</h3><p>{property.city}, {regionName(property.region)}</p><p>{propertyPrice(property)}</p></div>
      <div className="property-row-actions"><Link className="button button-secondary" href={`/admin/propiedades/${property.id}`}><Pencil size={16} />Editar</Link><PropertyTrashButton id={property.id} /></div>
    </article>)}
    {inTrash && trash.length === 0 ? <p className="empty-state">La papelera está vacía.</p> : null}
    {inTrash && trash.map((property) => <article key={property.id} className="admin-trash-row"><div><h3>{property.title}</h3><p className="admin-help">Se restaurará como borrador, sin publicarse automáticamente.</p></div><div className="admin-trash-actions"><PropertyTrashButton id={property.id} restore /><PropertyDeleteButton id={property.id} title={property.title} /></div></article>)}
  </div>;
}
