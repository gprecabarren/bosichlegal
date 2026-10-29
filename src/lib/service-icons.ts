export const serviceIcons = [
  { id: "civil", label: "Derecho civil" },
  { id: "humanos", label: "Derechos humanos" },
  { id: "penal", label: "Derecho penal" },
  { id: "publico", label: "Derecho público" },
  { id: "propiedad", label: "Propiedad" },
  { id: "corporativo", label: "Empresas" },
  { id: "concursal", label: "Derecho concursal" },
  { id: "ambiental", label: "Derecho ambiental" },
  { id: "digital", label: "Derecho digital y datos" },
] as const;

export function resolveServiceIcon(title: string, index = 0) {
  const normalized = title.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
  return serviceIcons.find(({ id }) => normalized.includes(id))?.id
    || serviceIcons[index % serviceIcons.length].id;
}
