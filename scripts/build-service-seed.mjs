import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";

const root = process.cwd();
const destination = path.resolve(process.argv[2] || "");
if (!destination.startsWith(path.join(root, "supabase", "migrations") + path.sep) || !destination.endsWith(".sql")) throw new Error("Indica la migración generada por Supabase CLI.");
const pages = JSON.parse(await readFile(path.join(root, "content/service-pages.json"), "utf8"));
const digital = {
  title: "Derecho Digital y Protección de Datos", description: "Asesoría jurídica para empresas, proyectos de software y personas en entornos digitales.", icon: "digital",
  details: ["Protección de datos en software y sitios web", "Inscripción de software y titularidad", "Contratos y licencias tecnológicas", "Protección de la honra y vida privada en internet", "Delitos informáticos y evidencia digital"],
  showOnHome: false, clickable: true, pageSlug: "derecho-digital",
  topics: [{ label: "Ley de Protección de Datos", pageSlug: "proteccion-de-datos" }, { label: "Inscripción de Software", pageSlug: "inscripcion-de-software" }],
};
function updateItem(item) {
  const next = { ...item, showOnHome: item.showOnHome !== false, clickable: item.clickable === true, pageSlug: item.pageSlug || "", topics: item.topics || [] };
  if (item.icon === "humanos" || item.title.toLowerCase().includes("humanos")) Object.assign(next, { clickable: true, pageSlug: "derechos-humanos" });
  if (item.icon === "penal" || item.title.toLowerCase().includes("penal")) next.details = item.details.filter(v => v.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().trim() !== "delitos informaticos");
  return next;
}
const localPath = path.join(root, "content/site.json");
const local = JSON.parse(await readFile(localPath, "utf8"));
local.services.items = local.services.items.map(updateItem);
if (!local.services.items.some(i => i.icon === "digital")) local.services.items.push(digital);
await writeFile(localPath, JSON.stringify(local, null, 2) + "\n");
const quote = (value, tag) => { const json = JSON.stringify(value); if (json.includes(`$${tag}$`)) throw new Error("Delimitador inesperado"); return `$${tag}$${json}$${tag}$::jsonb`; };
const sql = `-- Generated from content/service-pages.json by scripts/build-service-seed.mjs.
-- Existing page edits and unrelated site configuration are preserved.
insert into public.service_pages (slug,title,status,noindex,seo_title,meta_description,focus_keyword,og_title,og_description,content)
select slug,title,status,noindex,seo_title,meta_description,focus_keyword,og_title,og_description,content
from jsonb_to_recordset(${quote(pages, "service_pages")}) as p(slug text,title text,status text,noindex boolean,seo_title text,meta_description text,focus_keyword text,og_title text,og_description text,content jsonb)
on conflict (slug) do nothing;

update public.site_content s
set content = jsonb_set(s.content, '{services,items}', (
  select jsonb_agg(
    (item || jsonb_build_object('showOnHome', coalesce(item->'showOnHome','true'::jsonb), 'clickable', coalesce(item->'clickable','false'::jsonb), 'pageSlug', coalesce(item->'pageSlug','""'::jsonb), 'topics', coalesce(item->'topics','[]'::jsonb)))
    || case when item->>'icon' = 'humanos' or lower(item->>'title') like '%humanos%' then '{"clickable":true,"pageSlug":"derechos-humanos"}'::jsonb else '{}'::jsonb end
    || case when item->>'icon' = 'penal' or lower(item->>'title') like '%penal%' then jsonb_build_object('details',coalesce((select jsonb_agg(detail.value) from jsonb_array_elements_text(item->'details') as detail(value) where translate(lower(trim(detail.value)),'áéíóú','aeiou') <> 'delitos informaticos'),'[]'::jsonb)) else '{}'::jsonb end
    order by position
  ) from jsonb_array_elements(s.content#>'{services,items}') with ordinality as v(item,position)
) || case when exists(select 1 from jsonb_array_elements(s.content#>'{services,items}') item where item->>'icon'='digital') then '[]'::jsonb else jsonb_build_array(${quote(digital, "digital_card")}) end), updated_at=now()
where s.id='main';
`;
await writeFile(destination, sql);
console.log(`Generated ${pages.length} service pages and the digital service card.`);
