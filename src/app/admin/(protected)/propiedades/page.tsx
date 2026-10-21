import Link from "next/link";
import { Pencil, Plus } from "lucide-react";
import { listAdminProperties } from "@/lib/properties";
import { propertyPrice, propertyStatuses, regionName } from "@/lib/property-fields";
import { PropertyTrashButton } from "../../PropertyEditor";

export const dynamic = "force-dynamic";

export default async function AdminPropertiesPage() {
  let properties;
  try { properties = await listAdminProperties(); } catch (error) {
    return <div className="admin-warning" role="alert">{error instanceof Error ? error.message : "No se pudieron cargar las propiedades."}</div>;
  }
  const active = properties.filter((property) => !property.deleted_at);
  const trash = properties.filter((property) => property.deleted_at);
  return <div className="property-admin-list">
    <div className="editor-section-heading"><h2>Propiedades</h2><Link className="button" href="/admin/propiedades/nueva"><Plus size={18} />Nueva propiedad</Link></div>
    {active.length === 0 ? <div className="empty-state"><h3>Aún no hay propiedades</h3><p>Las propiedades publicadas aparecerán en el catálogo.</p></div> : null}
    {active.map((property) => <article key={property.id} className="property-admin-row">
      {property.images[0] ? <img src={property.images[0].url} alt="" /> : <div className="property-photo-placeholder">Sin foto</div>}
      <div><span className={`property-status property-status-${property.status}`}>{propertyStatuses[property.status]}</span><h3>{property.title}</h3><p>{property.city}, {regionName(property.region)}</p><p>{propertyPrice(property)}</p></div>
      <div className="property-row-actions"><Link className="button button-secondary" href={`/admin/propiedades/${property.id}`}><Pencil size={16} />Editar</Link><PropertyTrashButton id={property.id} /></div>
    </article>)}
    {trash.length > 0 ? <details className="property-trash"><summary>Papelera ({trash.length})</summary>{trash.map((property) => <article key={property.id} className="property-trash-row"><span>{property.title}</span><PropertyTrashButton id={property.id} restore /></article>)}</details> : null}
  </div>;
}
