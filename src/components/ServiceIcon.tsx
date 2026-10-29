import { resolveServiceIcon, serviceIcons } from "@/lib/service-icons";
import { CircuitBoard, ShieldCheck } from "lucide-react";

export function ServiceIcon({ title, icon, index = 0 }: { title: string; icon?: string; index?: number }) {
  const symbol = serviceIcons.some(({ id }) => id === icon) ? icon : resolveServiceIcon(title, index);
  if (symbol === "digital") return <span className="digital-service-icon official-service-icon" aria-hidden="true"><CircuitBoard /><ShieldCheck /></span>;
  return <img className="official-service-icon" src={`/assets/services/${symbol}.svg`} alt="" aria-hidden="true" width={80} height={80} />;
}
