-- Update only services, preserving contact details, analytics and other settings.
update public.site_content
set content = jsonb_set(content, '{services,items}', $services$[
  {"title":"Derecho Civil de Alta Complejidad","icon":"civil","description":"","details":["Responsabilidad Civil","Estatutos especiales de responsabilidad Civil","Contratos de Alta Complejidad","Acuerdos extrajudiciales","Arbitrajes"]},
  {"title":"Derechos Humanos y Derechos Internacionales","icon":"humanos","description":"","details":["Sistema internacional e intercambio de derechos humanos","Acciones constitucionales","Informes en derecho"]},
  {"title":"Derecho Penal de Alta Complejidad","icon":"penal","description":"","details":["Homicidios, hurtos, lesiones","Delitos Económicos","Delitos Informáticos","Querellas y Defensas"]},
  {"title":"Derecho Público: Administrativo Sancionador","icon":"publico","description":"","details":["Defensa en Sumarios Administrativos","Reclamos y recursos ante la C.G.R.","Responsabilidad del Estado"]},
  {"title":"Protección al Derecho de Propiedad","icon":"propiedad","description":"","details":["Querellas Posesorias y Acciones del Dominio","Estudio de Título de Alta Complejidad","Asesoría en compras y ventas de propiedades","Saneamiento de la Pequeña Propiedad Raíz"]},
  {"title":"Derecho Corporativo-Empresa","icon":"corporativo","description":"","details":["Fusiones y Adquisiciones de Empresas","Gobierno Corporativo","Joint Venture","Private Equity","Mercado de Capitales"]},
  {"title":"Derecho Concursal","icon":"concursal","description":"","details":["Quiebra de personas y empresas","Renegociación de personas","Reorganización de empresas","Impugnación de créditos"]},
  {"title":"Derecho Ambiental","icon":"ambiental","description":"","details":["Evaluación de Impacto Ambiental","Defensa ante la SMA","Litigación ante Tribunales Ambientales"]}
]$services$::jsonb), updated_at = now()
where id = 'main';
