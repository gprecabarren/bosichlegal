import test from "node:test";
import assert from "node:assert/strict";
import { emptyProperty, locationPath, propertyPrice, slugify, validateProperty } from "../src/lib/property-fields.ts";

const draft = () => ({ ...emptyProperty(), title: "Casa en Concepción", city: "Concepción", description: "Descripción de la propiedad." });

test("generates normalized URLs for property and location pages", () => {
  assert.equal(slugify("Casa Ñuble / 1"), "casa-nuble-1");
  assert.equal(validateProperty(draft()).slug, "casa-en-concepcion");
  assert.equal(locationPath("biobio", "San Pedro de la Paz"), "/propiedades/ubicacion/biobio/san-pedro-de-la-paz");
});

test("allows drafts but requires an image to publish", () => {
  assert.equal(validateProperty(draft()).status, "draft");
  assert.throws(() => validateProperty({ ...draft(), status: "published" }), /fotografía/);
});

test("rejects invalid region, status, quantities and oversized galleries", () => {
  assert.throws(() => validateProperty({ ...draft(), region: "inventada" }), /región/);
  assert.throws(() => validateProperty({ ...draft(), status: "public" }), /estado/);
  assert.throws(() => validateProperty({ ...draft(), price: -1 }), /precio/);
  assert.throws(() => validateProperty({ ...draft(), bathrooms: 1.3 }), /precio/);
  assert.throws(() => validateProperty({ ...draft(), images: Array(21).fill({ url: "x", alt: "", caption: "" }) }), /20 imágenes/);
  assert.throws(() => validateProperty({ ...draft(), slug: "ubicacion" }), /enlace/);
});

test("distinguishes unknown price, zero price and UF", () => {
  assert.equal(propertyPrice({ price: null, currency: "CLP" }), "Precio a consultar");
  assert.equal(propertyPrice({ price: 0, currency: "CLP" }), "$ 0");
  assert.equal(propertyPrice({ price: 1000.5, currency: "UF" }), "UF 1.000,5");
});

test("property indexing is opt-out and rejects malformed values", () => {
  assert.equal(validateProperty(draft()).noindex, false);
  assert.equal(validateProperty({ ...draft(), noindex: true }).noindex, true);
  assert.throws(() => validateProperty({ ...draft(), noindex: "false" }), /indexación/);
});
