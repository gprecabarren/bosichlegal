import { resolveServiceIcon, serviceIcons } from "@/lib/service-icons";

export function ServiceIcon({ title, icon, index = 0 }: { title: string; icon?: string; index?: number }) {
  const symbol = serviceIcons.some(({ id }) => id === icon) ? icon : resolveServiceIcon(title, index);
  return <img className="official-service-icon" src={`/assets/services/${symbol}.png`} alt="" aria-hidden="true" width={80} height={80} />;
}
