import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { canonicalUrl, jsonLd, pageSeo } from "../src/lib/page-seo.ts";
import { organizationSchema } from "../src/lib/seo.ts";

test("canonical URLs converge on www without tracking parameters", () => {
  assert.equal(canonicalUrl("http://bosichlegal.cl/noticias/ejemplo?utm_source=ig#texto"), "https://www.bosichlegal.cl/noticias/ejemplo");
  assert.equal(canonicalUrl("/contacto"), "https://www.bosichlegal.cl/contacto");
  assert.equal(canonicalUrl("https://example.org/articulo"), "https://example.org/articulo");
});
test("each page has its own social metadata and indexing controls", () => {
  const metadata = pageSeo({ title: "Servicios", description: "Descripción", path: "/servicios", noindex: true });
  assert.equal(metadata.title.absolute, "Servicios | Bosich Legal");
  assert.equal(metadata.openGraph.url, "https://www.bosichlegal.cl/servicios");
  assert.equal(metadata.twitter.card, "summary_large_image");
  assert.equal(metadata.robots.index, false);
  assert.equal(pageSeo({ title: "Abogados | Bosich Legal", description: "Texto", path: "/" }).title.absolute, "Abogados | Bosich Legal");
});
test("structured data uses resolved organization references and addressed offices", () => {
  const content = JSON.parse(readFileSync(new URL("../content/site.json", import.meta.url), "utf8"));
  const graph = organizationSchema(content)["@graph"];
  assert.equal(graph.filter(entity => entity["@type"] === "LegalService").length, content.locations.items.length);
  for (const office of graph.filter(entity => entity["@type"] === "LegalService")) {
    assert.ok(office.address.streetAddress);
    assert.ok(office.address.addressLocality);
    assert.equal(office.address.addressCountry, "CL");
    assert.ok(graph.some(entity => entity["@id"] === office.parentOrganization["@id"]));
  }
});
test("JSON-LD cannot terminate its containing script", () => {
  const value = { name: "</script><script>alert(1)</script>" };
  assert.ok(!jsonLd(value).includes("<"));
  assert.deepEqual(JSON.parse(jsonLd(value)), value);
});
