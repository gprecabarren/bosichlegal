"use client";

import { useState } from "react";
import { Search } from "lucide-react";
import { propertyTypes, regions } from "@/lib/property-fields";

export type PropertyFilterValues = { region?: string; city?: string; type?: string; status?: string };

export function PropertyFilters({ locations, selected }: { locations: { region: string; city: string }[]; selected: PropertyFilterValues }) {
  const [region, setRegion] = useState(selected.region || "");
  const [city, setCity] = useState(selected.city || "");
  const cities = [...new Set(locations.filter((location) => !region || location.region === region).map((location) => location.city))].sort((a, b) => a.localeCompare(b, "es"));
  return <form className="property-filters" action="/propiedades" method="get">
    <label>Región<select name="region" value={region} onChange={(event) => { setRegion(event.target.value); setCity(""); }}><option value="">Todas las regiones</option>{regions.map((region) => <option key={region.id} value={region.id}>{region.name}</option>)}</select></label>
    <label>Ciudad<select name="city" value={city} onChange={(event) => setCity(event.target.value)}><option value="">Todas las ciudades</option>{cities.map((city) => <option key={city}>{city}</option>)}</select></label>
    <label>Tipo<select name="type" defaultValue={selected.type || ""}><option value="">Todos los tipos</option>{propertyTypes.map((type) => <option key={type}>{type}</option>)}</select></label>
    <label>Estado<select name="status" defaultValue={selected.status || ""}><option value="">Todas</option><option value="published">En venta</option><option value="sold">Vendidas</option></select></label>
    <button className="button" type="submit"><Search size={18} />Buscar</button>
  </form>;
}
