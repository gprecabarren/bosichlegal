import {
  BriefcaseBusiness,
  Building2,
  FileCheck2,
  Gavel,
  Globe2,
  Landmark,
  Leaf,
  Scale,
  ShieldCheck,
} from "lucide-react";

const iconMap = [
  { match: "civil", icon: Scale },
  { match: "humanos", icon: Globe2 },
  { match: "penal", icon: Gavel },
  { match: "público", icon: Landmark },
  { match: "propiedad", icon: ShieldCheck },
  { match: "corporativo", icon: BriefcaseBusiness },
  { match: "concursal", icon: Building2 },
  { match: "ambiental", icon: Leaf },
];

export function ServiceIcon({ title }: { title: string }) {
  const normalized = title.toLowerCase();
  const match = iconMap.find((item) => normalized.includes(item.match));
  const Icon = match?.icon || FileCheck2;

  return <Icon aria-hidden="true" />;
}
