"use client";

import { useState } from "react";
import { Search } from "lucide-react";
import { propertyTypes, regions } from "@/lib/property-fields";
import type { PageFieldValue } from "@/types/site";

export type PropertyFilterValues = { region?: string; city?: string; type?: string; status?: string };

export function PropertyFilters({ locations, selected, copy = {} }: { locations: { region: string; city: string }[]; selected: PropertyFilterValues; copy?: Record<string, PageFieldValue> }) {
  const text = (key: string, fallback: string) => typeof copy[key] === "string" ? copy[key] as string : fallback;
  const [region, setRegion] = useState(selected.region || "");
  const [city, setCity] = useState(selected.city || "");
  const cities = [...new Set(locations.filter((location) => !region || location.region === region).map((location) => location.city))].sort((a, b) => a.localeCompare(b, "es"));
  return <form className="property-filters" action="/propiedades" method="get">
    <label>{text("regionLabel", "Región")}<select name="region" value={region} onChange={(event) => { setRegion(event.target.value); setCity(""); }}><option value="">{text("allRegions", "Todas las regiones")}</option>{regions.map((region) => <option key={region.id} value={region.id}>{region.name}</option>)}</select></label>
    <label>{text("cityLabel", "Ciudad")}<select name="city" value={city} onChange={(event) => setCity(event.target.value)}><option value="">{text("allCities", "Todas las ciudades")}</option>{cities.map((city) => <option key={city}>{city}</option>)}</select></label>
    <label>{text("typeLabel", "Tipo")}<select name="type" defaultValue={selected.type || ""}><option value="">{text("allTypes", "Todos los tipos")}</option>{propertyTypes.map((type) => <option key={type}>{type}</option>)}</select></label>
    <label>{text("statusLabel", "Estado")}<select name="status" defaultValue={selected.status || ""}><option value="">{text("allStatuses", "Todas")}</option><option value="published">{text("publishedLabel", "En venta")}</option><option value="sold">{text("soldLabel", "Vendidas")}</option></select></label>
    <button className="button" type="submit"><Search size={18} />{text("searchButton", "Buscar")}</button>
  </form>;
}
