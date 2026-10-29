import { test } from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { emptyServicePage, indexableServicePages, safeContentImage, safeSourceUrl, serviceLinks, serviceSlug, validateServicePage } from "../src/lib/service-fields.ts";
import { isNewsPlaceholder } from "../src/lib/news-placeholder.ts";

const pages = JSON.parse(await readFile(new URL("../content/service-pages.json", import.meta.url), "utf8"));
const site = JSON.parse(await readFile(new URL("../content/site.json", import.meta.url), "utf8"));

test("service pages are valid and indexing can be disabled per page", () => {
  pages.forEach(page => validateServicePage(page));
  assert.equal(indexableServicePages(pages).length, 4);
  const hidden = pages.map(p => p.slug === "inscripcion-de-software" ? { ...p, noindex: true } : p);
  assert.deepEqual(indexableServicePages(hidden).map(p => p.slug), ["derechos-humanos", "derecho-digital", "proteccion-de-datos"]);
});
test("disabled cards never expose primary or topic links", () => {
  const item = { title: "Test", details: [], clickable: false, pageSlug: "derechos-humanos", topics: [{ label: "Datos", pageSlug: "proteccion-de-datos" }] };
  assert.deepEqual(serviceLinks(item, pages), { primary: undefined, topics: [] });
  assert.equal(serviceLinks({ ...item, clickable: true }, pages).primary.slug, "derechos-humanos");
  assert.equal(serviceLinks({ ...item, clickable: true }, pages).topics.length, 1);
  assert.equal(serviceLinks({ ...item, clickable: true }, pages.map(p => ({ ...p, status: "draft" }))).primary, undefined);
});
test("digital is catalogue-only and computer crimes moved out of penal", () => {
  assert.equal(site.services.items.length, 9);
  assert.equal(site.services.items.filter(s => s.showOnHome !== false).length, 8);
  const digital = site.services.items.find(s => s.icon === "digital");
  assert.equal(digital.showOnHome, false);
  assert.equal(digital.topics.length, 2);
  assert.equal(site.services.items.find(s => s.icon === "penal").details.some(d => d.includes("Informáticos")), false);
});
test("content validation rejects unsafe images, sources and invalid dates", () => {
  assert.equal(safeContentImage("javascript:alert(1)"), false);
  assert.equal(safeContentImage("//other.example/picture.jpg"), false);
  assert.equal(safeContentImage("/assets/../../file.png"), false);
  assert.equal(safeSourceUrl("https://user:pass@example.com"), false);
  assert.equal(safeSourceUrl("http://example.com"), false);
  const page = structuredClone(pages[0]);
  page.content.heroImage = "data:text/html,test";
  assert.throws(() => validateServicePage(page));
  page.content.heroImage = "/assets/site/services-hero.png";
  page.content.reviewedAt = "2026-02-31";
  assert.throws(() => validateServicePage(page));
});
test("drafts can be saved without published content and slugs remain safe", () => {
  validateServicePage({ ...emptyServicePage(), title: "Borrador", slug: "borrador" });
  assert.equal(serviceSlug("Inscripción de Software"), "inscripcion-de-software");
  assert.equal(serviceSlug("a".repeat(119) + " --más"), "a".repeat(119));
});
test("news placeholders are hints, not article content", () => {
  for (const text of ["Escribe el contenido de la noticia aquí.", "<p>Escribe la noticia aquí.</p>", "Escribir noticia... aquí", "<h1>Escribir aquí</h1>"]) assert.equal(isNewsPlaceholder(text), true);
  assert.equal(isNewsPlaceholder("Escribe aquí tu historia, sin renunciar a tus derechos."), false);
  assert.equal(isNewsPlaceholder("<h1>Una noticia de verdad</h1>"), false);
});
