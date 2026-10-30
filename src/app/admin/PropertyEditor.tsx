"use client";

import Link from "next/link";
import { startTransition, useActionState, useRef, useState } from "react";
import { ArrowDown, ArrowLeft, ArrowUp, ExternalLink, ImagePlus, RotateCcw, Save, Trash2, WandSparkles } from "lucide-react";
import { emptyProperty, propertyStatuses, propertyTypes, regions, slugify } from "@/lib/property-fields";
import type { Property, PropertyImage, PropertyInput } from "@/types/property";
import { changePropertyVisibilityAction, deletePropertyPermanentlyAction, savePropertyAction } from "./property-actions";

export function PropertyEditor({ property }: { property?: Property }) {
  const [values, setValues] = useState<PropertyInput>(property || emptyProperty());
  const [state, action, pending] = useActionState(savePropertyAction, null);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const imageInput = useRef<HTMLInputElement>(null);
  const busy = pending || uploading;
  const id = state?.id || property?.id || "";
  function set<K extends keyof PropertyInput>(key: K, value: PropertyInput[K]) {
    setValues((current) => ({ ...current, [key]: value }));
  }
  function updateImage(index: number, changes: Partial<PropertyImage>) {
    setValues((current) => ({ ...current, images: current.images.map((image, position) => position === index ? { ...image, ...changes } : image) }));
  }
  function moveImage(index: number, direction: number) {
    const images = [...values.images];
    [images[index], images[index + direction]] = [images[index + direction], images[index]];
    set("images", images);
  }
  async function uploadImages(files: FileList | null) {
    if (!files?.length) return;
    const selected = Array.from(files);
    if (selected.length + values.images.length > 20) { setUploadError("La galería admite hasta 20 imágenes."); return; }
    if (selected.some((file) => file.size > 4 * 1024 * 1024 || !["image/jpeg", "image/png", "image/webp"].includes(file.type))) {
      setUploadError("Selecciona imágenes JPG, PNG o WebP de hasta 4 MB cada una."); return;
    }
    setUploadError("");
    setUploading(true);
    try {
      for (const file of selected) {
        const data = new FormData();
        data.set("image", file);
        const response = await fetch("/api/admin/property-images", { method: "POST", body: data });
        const result = await response.json();
        if (!response.ok || typeof result.url !== "string") throw new Error(result.error || "No se pudo cargar la imagen.");
        setValues((current) => ({ ...current, images: [...current.images, { url: result.url, alt: "", caption: "" }] }));
      }
      if (imageInput.current) imageInput.current.value = "";
    } catch (error) {
      setUploadError(error instanceof Error ? error.message : "No se pudieron cargar las imágenes.");
    } finally { setUploading(false); }
  }
  const numericFields = [
    { key: "bedrooms", label: "Dormitorios", step: "1" }, { key: "bathrooms", label: "Baños", step: "1" },
    { key: "area_m2", label: "Superficie construida (m²)", step: "0.01" }, { key: "land_m2", label: "Superficie de terreno (m²)", step: "0.01" },
  ] as const;
  return (
    <form className="admin-form property-editor" onSubmit={(event) => {
      event.preventDefault();
      const data = new FormData(event.currentTarget);
      startTransition(() => action(data));
    }}>
      <div className="editor-section-heading"><div><Link className="back-link" href="/admin/propiedades"><ArrowLeft size={16} />Propiedades</Link><h2>{id ? "Editar propiedad" : "Nueva propiedad"}</h2></div>
        {state?.ok && values.status !== "draft" ? <Link className="back-link" href={`/propiedades/${state.slug}`} target="_blank">Ver publicación<ExternalLink size={16} /></Link> : null}
      </div>
      {id ? <Link className="back-link" href={`/admin/propiedades/${id}/vista-previa`} target="_blank">Vista previa privada<ExternalLink size={16} /></Link> : null}
      <input type="hidden" name="id" value={id} />
      <input type="hidden" name="property" value={JSON.stringify(values)} />
      <fieldset disabled={busy} className="property-fieldset">
        <section>
          <h3>Publicación</h3>
          <label>Título<input required maxLength={180} value={values.title} onChange={(event) => set("title", event.target.value)} /></label>
          <label>Enlace de la propiedad<span className="input-prefix"><span>/propiedades/</span><input maxLength={180} value={values.slug} placeholder={slugify(values.title) || "nombre-de-la-propiedad"} onChange={(event) => set("slug", slugify(event.target.value))} /></span></label>
          <div className="form-grid"><label>Estado<select value={values.status} onChange={(event) => set("status", event.target.value as PropertyInput["status"])}>{Object.entries(propertyStatuses).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></label>
            <label>Tipo de propiedad<select value={values.property_type} onChange={(event) => set("property_type", event.target.value)}>{propertyTypes.map((type) => <option key={type}>{type}</option>)}</select></label></div>
          <label>Descripción<textarea required rows={9} maxLength={20000} value={values.description} onChange={(event) => set("description", event.target.value)} /></label>
        </section>
        <section>
          <h3>Ubicación</h3>
          <div className="form-grid"><label>Región<select value={values.region} onChange={(event) => set("region", event.target.value)}>{regions.map((region) => <option key={region.id} value={region.id}>{region.name}</option>)}</select></label>
            <label>Ciudad o comuna<input required maxLength={100} value={values.city} onChange={(event) => set("city", event.target.value)} /></label></div>
          <label>Dirección pública<input maxLength={250} value={values.address} onChange={(event) => set("address", event.target.value)} /></label>
        </section>
        <section>
          <h3>Precio y características</h3>
          <div className="form-grid"><label>Precio<input type="number" min="0" max="1000000000000" step={values.currency === "UF" ? "0.01" : "1"} value={values.price ?? ""} onChange={(event) => set("price", event.target.value === "" ? null : Number(event.target.value))} placeholder="A consultar" /></label>
            <label>Moneda<select value={values.currency} onChange={(event) => set("currency", event.target.value as "CLP" | "UF")}><option value="CLP">Pesos chilenos (CLP)</option><option value="UF">UF</option></select></label>
            {numericFields.map(({ key, label, step }) => <label key={key}>{label}<input type="number" min="0" max={step === "1" ? "1000" : "1000000000000"} step={step} value={values[key] ?? ""} onChange={(event) => set(key, event.target.value === "" ? null : Number(event.target.value))} /></label>)}
          </div>
        </section>
        <section>
          <div className="editor-section-heading"><h3>Fotografías</h3><span>{values.images.length} / 20</span></div>
          <label className="property-upload"><ImagePlus size={20} />Agregar fotografías<input ref={imageInput} type="file" accept="image/jpeg,image/png,image/webp" multiple disabled={values.images.length >= 20} onChange={(event) => uploadImages(event.target.files)} /></label>
          <p className="admin-help">JPG, PNG o WebP, hasta 4 MB por imagen. La primera será la portada. Se conserva la calidad del archivo original.</p>
          <div className="property-image-editor">
            {values.images.map((image, index) => <div className="property-image-row" key={image.url}>
              <img src={image.url} alt={image.alt || `Fotografía ${index + 1}`} />
              <div><label>Texto alternativo<input maxLength={200} value={image.alt} onChange={(event) => updateImage(index, { alt: event.target.value })} placeholder={values.title} /></label>
                <label>Pie de foto<input maxLength={500} value={image.caption} onChange={(event) => updateImage(index, { caption: event.target.value })} /></label>
                <div className="icon-toolbar"><span>{index === 0 ? "Portada" : `Foto ${index + 1}`}</span>
                  <button type="button" disabled={index === 0} title="Subir fotografía" aria-label={`Subir fotografía ${index + 1}`} onClick={() => moveImage(index, -1)}><ArrowUp size={18} /></button>
                  <button type="button" disabled={index === values.images.length - 1} title="Bajar fotografía" aria-label={`Bajar fotografía ${index + 1}`} onClick={() => moveImage(index, 1)}><ArrowDown size={18} /></button>
                  <button type="button" title="Quitar de la galería" aria-label={`Quitar fotografía ${index + 1}`} onClick={() => set("images", values.images.filter((_, position) => position !== index))}><Trash2 size={18} /></button>
                </div>
              </div>
            </div>)}
          </div>
        </section>
        <section>
          <div className="editor-section-heading"><h3>SEO</h3><button className="button button-secondary" type="button" onClick={() => setValues({ ...values,
            seo_title: `${values.title}${values.city ? ` en ${values.city}` : ""}`.slice(0, 70),
            meta_description: values.description.replace(/\s+/g, " ").trim().slice(0, 160),
          })}><WandSparkles size={16} />Completar SEO</button></div>
          <label>Título SEO<input maxLength={180} value={values.seo_title} onChange={(event) => set("seo_title", event.target.value)} placeholder={values.title} /></label>
          <label>Descripción SEO<textarea maxLength={320} rows={3} value={values.meta_description} onChange={(event) => set("meta_description", event.target.value)} placeholder={values.description.slice(0, 160)} /></label>
          <label className="checkbox-label"><input type="checkbox" checked={values.noindex === true} onChange={event => set("noindex", event.target.checked)} />No indexar esta propiedad en buscadores</label>
        </section>
      </fieldset>
      {uploading ? <p role="status">Cargando fotografías...</p> : null}
      {uploadError ? <p className="admin-error" role="alert">{uploadError}</p> : null}
      <div className="admin-actions"><button className="button" disabled={busy}><Save size={18} />{pending ? "Guardando..." : "Guardar propiedad"}</button></div>
      {state ? <p className={state.ok ? "admin-success" : "admin-error"} role="status">{state.message}</p> : null}
    </form>
  );
}

export function PropertyTrashButton({ id, restore = false }: { id: string; restore?: boolean }) {
  const [state, action, pending] = useActionState(changePropertyVisibilityAction, null);
  return <form action={action} onSubmit={(event) => { if (!restore && !window.confirm("¿Enviar esta propiedad a la papelera? Dejará de mostrarse en el sitio y podrás restaurarla.")) event.preventDefault(); }}>
    <input type="hidden" name="id" value={id} /><input type="hidden" name="restore" value={String(restore)} />
    <button className="danger-button" disabled={pending}>{restore ? <RotateCcw size={16} /> : <Trash2 size={16} />}{restore ? "Restaurar" : "Papelera"}</button>
    {state && !state.ok ? <p className="admin-error" role="alert">{state.message}</p> : null}
  </form>;
}

export function PropertyDeleteButton({ id, title }: { id: string; title: string }) {
  const [confirming, setConfirming] = useState(false);
  const [state, action, pending] = useActionState(deletePropertyPermanentlyAction, null);
  if (!confirming) return <button type="button" className="danger-button" onClick={() => setConfirming(true)}><Trash2 size={16} />Eliminar definitivamente</button>;
  return <form action={action} className="admin-delete-confirmation">
    <input type="hidden" name="id" value={id} />
    <p>Se eliminará «{title}». Esta acción no se puede deshacer.</p>
    <label>Escribe ELIMINAR<input name="confirmation" required pattern="ELIMINAR" autoComplete="off" /></label>
    <div className="admin-actions"><button className="danger-button" disabled={pending}><Trash2 size={16} />{pending ? "Eliminando..." : "Eliminar definitivamente"}</button><button className="button button-secondary" type="button" disabled={pending} onClick={() => setConfirming(false)}>Cancelar</button></div>
    {state ? <p role="status" className={state.ok ? "admin-success" : "admin-error"}>{state.message}</p> : null}
  </form>;
}
