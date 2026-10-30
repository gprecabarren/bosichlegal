import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { getPageContent, getPageSeo, patchPageContent, patchPageSeo, staticPages, validatePageContent, validatePageSeo } from "../src/lib/page-content.ts";

const original = () => JSON.parse(readFileSync(new URL("../content/site.json", import.meta.url), "utf8"));

test("all seven main pages expose nonempty current titles and SEO without changing content", () => {
  const content = original();
  const before = structuredClone(content);
  assert.equal(staticPages.length, 7);
  for (const page of staticPages) {
    assert.ok(getPageContent(content, page.path).text("title"));
    assert.ok(getPageSeo(content, page.path).title);
    assert.ok(getPageSeo(content, page.path).description);
  }
  assert.deepEqual(content, before);
});

test("page edits patch only owned fields and round-trip legacy home values", () => {
  const content = original();
  const next = patchPageContent(content, "/", { fields: { title: "Nuevo título", whatsappButton: "Conversar" } });
  assert.equal(next.home.heroTitle, "Nuevo título");
  assert.equal(getPageContent(next, "/").text("title"), "Nuevo título");
  assert.equal(getPageContent(next, "/").text("whatsappButton"), "Conversar");
  assert.deepEqual(next.services, content.services);
  assert.deepEqual(next.contact, content.contact);
  assert.notEqual(content.home.heroTitle, "Nuevo título");
});

test("offices update the location catalogue and footer addresses together", () => {
  const offices = [{ city: "Concepción", address: "Dirección de ejemplo", mapQuery: "Dirección de ejemplo, Concepción" }];
  const next = patchPageContent(original(), "/ubicacion", { fields: {}, offices });
  assert.deepEqual(next.locations.items, offices);
  assert.deepEqual(next.contact.addresses, ["Dirección de ejemplo"]);
  assert.throws(() => patchPageContent(original(), "/contacto", { fields: {}, offices }), /Oficinas/);
});

test("per-page SEO and indexing do not affect other pages or contact configuration", () => {
  const content = original();
  const next = patchPageSeo(content, "/contacto", { title: "Consulta jurídica", noindex: true, ogTitle: "Hablemos" });
  assert.equal(getPageSeo(next, "/contacto").title, "Consulta jurídica");
  assert.equal(getPageSeo(next, "/contacto").ogTitle, "Hablemos");
  assert.equal(getPageSeo(next, "/contacto").noindex, true);
  assert.deepEqual(next.contact, content.contact);
  const restored = patchPageSeo(next, "/contacto", { noindex: false });
  assert.equal(getPageSeo(restored, "/contacto").noindex, false);
});

test("home SEO continues to match general settings, canonical and social metadata are editable", () => {
  const next = patchPageSeo(original(), "/", { title: "Título actualizado", description: "Descripción actualizada", canonical: "https://www.bosichlegal.cl/", ogImage: "/assets/site/home-hero.png" });
  assert.equal(next.seo.title, "Título actualizado");
  assert.equal(getPageSeo(next, "/").description, "Descripción actualizada");
  assert.equal(getPageSeo(next, "/").canonical, "https://www.bosichlegal.cl/");
});

test("editors reject unknown fields, invalid URLs, oversized content and malformed SEO", () => {
  assert.throws(() => validatePageContent("/", { fields: { injectedField: "x" } }), /Campo/);
  assert.throws(() => validatePageContent("/", { fields: { title: "" } }), /válido/);
  assert.throws(() => validatePageContent("/", { fields: { heroImage: "javascript:alert(1)" } }), /válido/);
  assert.throws(() => validatePageContent("/contacto", { fields: { subjects: ["Materia", "Materia"] } }), /únicas/);
  assert.throws(() => validatePageSeo({ noindex: "false" }), /Indexación/);
  assert.throws(() => validatePageSeo({ canonical: "//malicious.test" }), /válido/);
  assert.throws(() => validatePageSeo({ ogImage: "data:image/png;base64,AA" }), /válido/);
});
