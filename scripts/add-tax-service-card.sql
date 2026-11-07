-- Adds only the missing tax card. Existing cards and other settings are preserved.
-- The service page must already have been published through the administrator.
update public.site_content s
set content = jsonb_set(s.content, '{services,items}', jsonb_insert(
  s.content #> '{services,items}',
  array[coalesce(
    (select (position - 1)::integer from jsonb_array_elements(s.content #> '{services,items}') with ordinality as existing(item, position) where item ->> 'icon' = 'digital' limit 1),
    jsonb_array_length(s.content #> '{services,items}')
  )::text],
  '{"title":"Derecho Tributario","icon":"tributario","description":"Defensa tributaria y asesoría preventiva para empresas, personas y patrimonios familiares.","details":["Defensa y Litigación Tributaria (SII y TTA)","Reorganización Empresarial y Planificación Tributaria","Planificación Patrimonial y Regularización Sucesoria","Tax Compliance: Auditoría Preventiva y Cumplimiento Tributario"],"showOnHome":true,"clickable":true,"pageSlug":"derecho-tributario","topics":[]}'::jsonb
)), updated_at = now()
where s.id = 'main'
  and jsonb_typeof(s.content #> '{services,items}') = 'array'
  and exists (select 1 from public.service_pages where slug = 'derecho-tributario' and status = 'published' and deleted_at is null)
  and not exists (select 1 from jsonb_array_elements(s.content #> '{services,items}') item where item ->> 'icon' = 'tributario' or item ->> 'pageSlug' = 'derecho-tributario')
returning jsonb_array_length(content #> '{services,items}') as total_services;
