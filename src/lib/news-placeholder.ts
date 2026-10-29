const placeholders = new Set([
  "escribe el contenido de la noticia aqui", "escribe la noticia aqui", "escribe noticia aqui",
  "escribir noticia aqui", "escribir aqui", "escribe aqui",
]);

export function isNewsPlaceholder(value: string) {
  const normalized = value.replace(/<[^>]*>/g, " ").replace(/&nbsp;|&#160;/gi, " ").normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/[.\u2026]/g, "").replace(/\s+/g, " ").trim();
  return placeholders.has(normalized);
}
