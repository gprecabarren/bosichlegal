"use client";

import { startTransition, useActionState, useState } from "react";
import { ArrowDown, ArrowUp, Plus, Save, Trash2 } from "lucide-react";
import { ServiceIcon } from "@/components/ServiceIcon";
import { resolveServiceIcon, serviceIcons } from "@/lib/service-icons";
import type { SiteContent } from "@/types/site";
import { saveServicesAction } from "./service-actions";

export function ServicesEditor({ services }: { services: SiteContent["services"] }) {
  const [state, action, pending] = useActionState(saveServicesAction, null);
  const [fields, setFields] = useState({
    title: services.title,
    description: services.description || "Asesoría preventiva, representación judicial y estrategia legal para personas, empresas e instituciones.",
    homeTitle: services.homeTitle || "Servicios jurídicos principales",
    introTitle: services.introTitle || "Práctica integral para personas y empresas",
  });
  const [items, setItems] = useState(services.items.map((item, index) => ({
    ...item, description: item.description || "", icon: item.icon || resolveServiceIcon(item.title, index), key: `service-${index}`,
  })));
  function update(index: number, field: "title" | "description" | "icon" | "details", value: string | string[]) {
    setItems((current) => current.map((item, position) => position === index ? { ...item, [field]: value } : item));
  }
  function move(index: number, direction: number) {
    setItems((current) => {
      const next = [...current];
      [next[index], next[index + direction]] = [next[index + direction], next[index]];
      return next;
    });
  }
  return (
    <form className="admin-form service-editor" onSubmit={(event) => {
      event.preventDefault();
      const data = new FormData(event.currentTarget);
      startTransition(() => action(data));
    }}>
      <h2>Servicios jurídicos</h2>
      <section>
        <div className="form-grid">
          <label>Título de la página<input name="title" required maxLength={160} value={fields.title} onChange={(event) => setFields({ ...fields, title: event.target.value })} /></label>
          <label>Título en inicio<input name="homeTitle" maxLength={160} value={fields.homeTitle} onChange={(event) => setFields({ ...fields, homeTitle: event.target.value })} /></label>
        </div>
        <label>Descripción principal<textarea name="description" rows={3} maxLength={3000} value={fields.description} onChange={(event) => setFields({ ...fields, description: event.target.value })} /></label>
        <label>Título de presentación<input name="introTitle" maxLength={160} value={fields.introTitle} onChange={(event) => setFields({ ...fields, introTitle: event.target.value })} /></label>
      </section>
      <input type="hidden" name="items" value={JSON.stringify(items.map(({ key: _key, ...item }) => item))} />
      {items.map((item, index) => (
        <section key={item.key} className="service-edit-item">
          <div className="editor-section-heading"><h3>Servicio {index + 1}</h3><div className="icon-toolbar">
            <button type="button" aria-label="Subir servicio" title="Subir servicio" disabled={pending || index === 0} onClick={() => move(index, -1)}><ArrowUp size={18} /></button>
            <button type="button" aria-label="Bajar servicio" title="Bajar servicio" disabled={pending || index === items.length - 1} onClick={() => move(index, 1)}><ArrowDown size={18} /></button>
            <button type="button" aria-label="Quitar servicio" title="Quitar servicio" disabled={pending || items.length === 1} onClick={() => setItems(items.filter((_, position) => position !== index))}><Trash2 size={18} /></button>
          </div></div>
          <label>Título<input required maxLength={160} value={item.title} onChange={(event) => update(index, "title", event.target.value)} /></label>
          <label>Descripción<textarea rows={3} maxLength={3000} value={item.description} onChange={(event) => update(index, "description", event.target.value)} /></label>
          <label>Materias, una por línea<textarea rows={5} value={item.details.join("\n")} onChange={(event) => update(index, "details", event.target.value.split("\n"))} /></label>
          <div className="service-icon-picker"><div><ServiceIcon title={item.title} icon={item.icon} /></div><label>Ícono oficial<select value={item.icon} onChange={(event) => update(index, "icon", event.target.value)}>{serviceIcons.map((icon) => <option key={icon.id} value={icon.id}>{icon.label}</option>)}</select></label></div>
        </section>
      ))}
      <div className="admin-actions">
        <button className="button button-secondary" type="button" disabled={pending || items.length >= 30} onClick={() => setItems([...items, { key: crypto.randomUUID(), title: "", description: "", icon: "civil", details: [] }])}><Plus size={18} />Agregar servicio</button>
        <button className="button" disabled={pending}><Save size={18} />{pending ? "Guardando..." : "Guardar servicios"}</button>
      </div>
      {state ? <p role="status" className={state.ok ? "admin-success" : "admin-error"}>{state.message}</p> : null}
    </form>
  );
}
