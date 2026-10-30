import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import ts from "typescript";

const require = createRequire(import.meta.url);
const id = "11111111-1111-4111-8111-111111111111";
const content = "<p>Una noticia con contenido suficiente para probar su publicación y restauración.</p>";
const post = (overrides = {}) => ({
  id, title: "Noticia de prueba", slug: "noticia-de-prueba", excerpt: "Resumen",
  content_html: content, cover_image_url: "https://example.com/shared.jpg",
  status: "published", published_at: "2026-10-01T00:00:00.000Z", deleted_at: null,
  created_at: "2026-10-01T00:00:00.000Z", ...overrides,
});

function loadSource(path, mocks) {
  const source = readFileSync(new URL(`../${path}`, import.meta.url), "utf8");
  const { outputText } = ts.transpileModule(source, { compilerOptions: {
    module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, jsx: ts.JsxEmit.ReactJSX,
  } });
  const module = { exports: {} };
  new Function("require", "module", "exports", outputText)((name) => {
    if (Object.hasOwn(mocks, name)) return mocks[name];
    if (name === "server-only") return {};
    return require(name);
  }, module, module.exports);
  return module.exports;
}

// Exercise real news functions against an in-memory query builder, never a live database.
function setup(initial = [post()]) {
  const db = { rows: structuredClone(initial), calls: [], uploads: 0, authCalls: 0, paths: [], authError: null, failure: null, beforeMutation: null };
  class Query {
    constructor() { this.operation = "select"; this.filters = []; this.bounds = [0, Infinity]; }
    select() { return this; }
    eq(key, value) { this.filters.push(row => row[key] === value); return this; }
    neq(key, value) { this.filters.push(row => row[key] !== value); return this; }
    is(key, value) { this.filters.push(row => row[key] === value); return this; }
    not(key, operator, value) { assert.equal(operator, "is"); this.filters.push(row => row[key] !== value); return this; }
    order() { return this; }
    limit(value) { this.bounds[1] = value - 1; return this; }
    range(from, to) { this.bounds = [from, to]; return this; }
    insert(value) { this.operation = "insert"; this.value = value; return this; }
    update(value) { this.operation = "update"; this.value = value; return this; }
    delete() { this.operation = "delete"; return this; }
    async execute(single = false) {
      db.calls.push(this.operation);
      if (db.failure === this.operation) return { data: null, error: { message: "private database details", code: "XX000" } };
      if (this.operation !== "select") db.beforeMutation?.();
      let rows = db.rows.filter(row => this.filters.every(matches => matches(row))).slice(this.bounds[0], this.bounds[1] + 1);
      if (this.operation === "insert") { rows = [post(this.value)]; db.rows.push(...rows); }
      if (this.operation === "update") rows.forEach(row => Object.assign(row, this.value));
      if (this.operation === "delete") db.rows = db.rows.filter(row => !rows.includes(row));
      if (single && rows.length !== 1) return { data: null, error: { code: "PGRST116", message: "No rows returned" } };
      return { data: structuredClone(single ? rows[0] : rows), error: null };
    }
    single() { return this.execute(true); }
    then(resolve, reject) { return this.execute().then(resolve, reject); }
  }
  const auth = { requireAdmin: async () => { db.authCalls++; if (db.authError) throw db.authError; } };
  const supabase = {
    from: table => { assert.equal(table, "news_posts"); return new Query(); },
    storage: { from: bucket => {
      assert.equal(bucket, "news-images");
      return {
        upload: async () => { db.uploads++; return { error: null }; },
        getPublicUrl: () => ({ data: { publicUrl: "https://example.com/uploaded.jpg" } }),
        remove: () => assert.fail("News lifecycle mutations must never remove storage files"),
      };
    } },
  };
  const lib = loadSource("src/lib/news.ts", {
    "@/lib/auth": auth,
    "@/lib/supabase": { getSupabaseAdmin: () => supabase, newsPostsTable: "news_posts", newsImagesBucket: "news-images" },
  });
  const actions = loadSource("src/app/admin/news-actions.ts", {
    "@/lib/auth": auth, "@/lib/news": lib,
    "next/cache": { revalidatePath: (...args) => db.paths.push(args) },
  });
  return { db, lib, actions };
}

function form(overrides = {}) {
  const data = new FormData();
  Object.entries({
    id, title: "Título conservado", slug: "enlace-conservado", excerpt: "Resumen conservado", content_html: content,
    cover_image_url: "https://example.com/shared.jpg", seo_title: "SEO conservado", meta_description: "Descripción conservada",
    focus_keyword: "keyword", canonical_url: "https://example.com/noticia", og_title: "Social", og_description: "Social description",
    noindex: "on", status: "published", ...overrides,
  }).forEach(([key, value]) => data.set(key, value));
  return data;
}

test("all public list and slug queries exclude trash, including legacy published trash", async () => {
  const { lib } = setup([
    post(), post({ id: "draft", slug: "draft", status: "draft" }),
    post({ id: "trash", slug: "trash", deleted_at: "2026-10-02T00:00:00Z" }),
  ]);
  assert.deepEqual((await lib.listNewsPosts()).map(row => row.id), [id]);
  assert.deepEqual((await lib.listNewsPosts({ includeDrafts: true })).map(row => row.id), [id, "draft"]);
  assert.equal((await lib.listNewsPosts({ limit: 1 })).length, 1);
  assert.equal(await lib.getNewsPostBySlug("trash"), null);
  assert.equal(await lib.getNewsPostBySlug("trash", true), null);
  assert.equal(await lib.getNewsPostBySlug("draft"), null);
  assert.equal((await lib.getNewsPostBySlug("draft", true)).id, "draft");
  assert.equal((await lib.getNewsPostBySlug("noticia-de-prueba")).id, id);
});

test("admin lists active and trash, paginates counts, and requires authorization", async () => {
  const { db, lib } = setup(Array.from({ length: 1001 }, (_, index) => post({ id: String(index), deleted_at: index % 2 ? "2026-10-02" : null })));
  assert.equal((await lib.listAdminNewsPosts()).length, 1001);
  assert.deepEqual(db.calls, ["select", "select"]);
  db.authError = new Error("No autorizado");
  await assert.rejects(lib.listAdminNewsPosts(), /No autorizado/);
  db.authError = null;
  db.failure = "select";
  await assert.rejects(lib.listAdminNewsPosts(), /No se pudieron cargar las noticias/);
});

test("soft delete hides news; restoring always produces an unpublished draft with intact content and images", async () => {
  const { db, lib } = setup();
  await lib.deleteNewsPost(id);
  assert.equal(db.rows.length, 1);
  assert.ok(db.rows[0].deleted_at);
  assert.equal(db.rows[0].status, "draft");
  assert.equal(db.rows[0].published_at, null);
  assert.equal((await lib.listNewsPosts()).length, 0);
  await lib.restoreNewsPost(id);
  assert.equal(db.rows[0].deleted_at, null);
  assert.equal(db.rows[0].status, "draft");
  assert.equal(db.rows[0].published_at, null);
  assert.equal(db.rows[0].content_html, content);
  assert.equal(db.rows[0].cover_image_url, "https://example.com/shared.jpg");
  assert.equal((await lib.listNewsPosts()).length, 0);
  await lib.updateNewsPost(id, { title: "Publicación revisada", content_html: content, status: "published" });
  assert.equal((await lib.listNewsPosts()).length, 1);
  assert.ok(db.rows[0].published_at);
  assert.equal(db.uploads, 0);
});

test("restore also unpublishes legacy trash and cannot reset an active published post", async () => {
  const { db, lib } = setup();
  await assert.rejects(lib.restoreNewsPost(id), /siga en la papelera/);
  assert.equal(db.rows[0].status, "published");
  db.rows[0].deleted_at = "2026-10-02";
  await lib.restoreNewsPost(id);
  assert.equal(db.rows[0].status, "draft");
  assert.equal(db.rows[0].published_at, null);
});

test("permanent deletion is scoped to trash and never touches shared images", async () => {
  const { db, lib } = setup([post(), post({ id: "shared-image-reference", slug: "another" })]);
  await assert.rejects(lib.permanentlyDeleteNewsPost(id), /Solo puedes eliminar/);
  assert.equal(db.rows.length, 2);
  await lib.deleteNewsPost(id);
  const deletedAt = db.rows[0].deleted_at;
  await assert.rejects(lib.deleteNewsPost(id), /No se pudo enviar/);
  assert.equal(db.rows[0].deleted_at, deletedAt);
  await lib.permanentlyDeleteNewsPost(id);
  assert.equal(db.rows.length, 1);
  assert.equal(db.rows[0].cover_image_url, "https://example.com/shared.jpg");
  assert.equal(db.uploads, 0);
});

test("edits of trash, raced edits, raced permanent deletion and malformed IDs are rejected", async () => {
  const { db, lib } = setup();
  const input = { title: "Nuevo título", content_html: content, status: "published" };
  db.beforeMutation = () => { db.rows[0].deleted_at = "2026-10-02"; };
  await assert.rejects(lib.updateNewsPost(id, input), /No se pudo actualizar/);
  assert.equal(db.rows[0].title, "Noticia de prueba");
  await assert.rejects(lib.updateNewsPost(id, input), /papelera/);
  db.beforeMutation = () => { db.rows[0].deleted_at = null; };
  await assert.rejects(lib.permanentlyDeleteNewsPost(id), /Solo puedes eliminar/);
  assert.equal(db.rows.length, 1);
  for (const mutate of [lib.deleteNewsPost, lib.restoreNewsPost, lib.permanentlyDeleteNewsPost, value => lib.updateNewsPost(value, input)]) {
    await assert.rejects(mutate("bad-id"), /no es válida/);
    await assert.rejects(mutate("99999999-9999-4999-8999-999999999999"));
  }
});

test("every news action rejects unauthorized requests before database or storage mutation", async () => {
  const { db, actions } = setup();
  db.authError = new Error("No autorizado");
  const data = form({ confirm_permanent_delete: "true", cover_image: new File(["test"], "cover.jpg", { type: "image/jpeg" }) });
  for (const action of [actions.createNewsAction, actions.updateNewsAction, actions.deleteNewsAction, actions.restoreNewsAction, actions.permanentlyDeleteNewsAction]) {
    const result = await action(null, data);
    assert.equal(result.ok, false);
    assert.match(result.message, /sesión/);
  }
  assert.equal(db.authCalls, 5);
  assert.deepEqual(db.calls, []);
  assert.equal(db.uploads, 0);
});

test("permanent delete action requires explicit confirmation before deletion", async () => {
  const { db, actions } = setup([post({ deleted_at: "2026-10-02" })]);
  for (const value of ["", "false", "on"]) {
    const result = await actions.permanentlyDeleteNewsAction(null, form({ confirm_permanent_delete: value }));
    assert.equal(result.ok, false);
    assert.match(result.message, /Confirma/);
  }
  assert.deepEqual(db.calls, []);
  const result = await actions.permanentlyDeleteNewsAction(null, form({ confirm_permanent_delete: "true" }));
  assert.equal(result.ok, true);
  assert.equal(db.rows.length, 0);
});

test("lifecycle actions invalidate home, admin list, public list, all detail pages and sitemap", async () => {
  const { db, actions } = setup();
  for (const action of [actions.deleteNewsAction, actions.restoreNewsAction, actions.deleteNewsAction, actions.permanentlyDeleteNewsAction]) {
    db.paths = [];
    assert.equal((await action(null, form({ confirm_permanent_delete: "true" }))).ok, true);
    for (const path of ["/", "/admin", "/admin/crear-blog", "/noticias", "/sitemap.xml"]) assert.ok(db.paths.some(args => args[0] === path), path);
    assert.ok(db.paths.some(args => args[0] === "/noticias/[slug]" && args[1] === "page"));
  }
});

test("create and update errors preserve all submitted fields and any already-uploaded cover", async () => {
  for (const operation of ["create", "update"]) {
    const { db, actions } = setup();
    db.failure = operation === "create" ? "insert" : "update";
    const data = form({ cover_image: new File(["test"], "cover.jpg", { type: "image/jpeg" }) });
    const result = await actions[`${operation}NewsAction`](null, data);
    assert.equal(result.ok, false);
    assert.ok(!result.message.includes("private database details"));
    for (const [key, value] of data.entries()) {
      if (["cover_image", "cover_image_url", "noindex"].includes(key)) continue;
      assert.equal(result.values[key], value, key);
    }
    assert.equal(result.values.noindex, true);
    assert.equal(result.values.cover_image_url, "https://example.com/uploaded.jpg");
    assert.equal(db.uploads, 1);
  }
});

test("validation errors remain friendly and failed uploads preserve text and existing cover", async () => {
  const { actions } = setup();
  const invalidTitle = await actions.createNewsAction(null, form({ title: "a" }));
  assert.equal(invalidTitle.ok, false);
  assert.match(invalidTitle.message, /título/);
  assert.equal(invalidTitle.values.title, "a");
  const invalidFile = await actions.updateNewsAction(null, form({ cover_image: new File(["bad"], "cover.txt", { type: "text/plain" }) }));
  assert.equal(invalidFile.ok, false);
  assert.match(invalidFile.message, /JPG/);
  assert.equal(invalidFile.values.content_html, content);
  assert.equal(invalidFile.values.cover_image_url, "https://example.com/shared.jpg");
});

test("mutation failures return recoverable messages, never false success or raw database details", async () => {
  for (const [action, failure, deleted_at] of [
    ["deleteNewsAction", "update", null], ["restoreNewsAction", "update", "2026-10-02"],
    ["permanentlyDeleteNewsAction", "delete", "2026-10-02"],
  ]) {
    const { db, actions } = setup([post({ deleted_at })]);
    db.failure = failure;
    const result = await actions[action](null, form({ confirm_permanent_delete: "true" }));
    assert.equal(result.ok, false);
    assert.ok(!result.message.includes("private database details"));
    assert.equal(db.rows.length, 1);
    assert.deepEqual(db.paths, []);
  }
});

function elements(node) {
  if (Array.isArray(node)) return node.flatMap(elements);
  if (!node || typeof node !== "object" || !node.props) return [];
  return [node, ...elements(node.props.children)];
}

function textContent(node) {
  if (Array.isArray(node)) return node.map(textContent).join("");
  if (node === null || node === undefined || typeof node === "boolean") return "";
  return typeof node === "object" ? textContent(node.props?.children) : String(node);
}

function buttonFixture(operation, { confirming = false, pending = false, state = null, actions = {} } = {}) {
  let dispatch;
  const changes = [];
  const successes = [];
  const { NewsTrashButton } = loadSource("src/app/admin/NewsTrashButton.tsx", {
    react: {
      useState: () => [confirming, value => changes.push(value)],
      useActionState: callback => { dispatch = callback; return [state, undefined, pending]; },
    },
    "./news-actions": actions,
  });
  const tree = NewsTrashButton({ post: post(), operation, onSuccess: message => successes.push(message) });
  return { tree, nodes: elements(tree), changes, successes, dispatch };
}

test("permanent-delete UI requires a separate confirmation step and checked confirmation field", () => {
  const initial = buttonFixture("delete");
  assert.equal(initial.nodes.filter(node => node.type === "button" && node.props.type === "submit").length, 0);
  initial.nodes.find(node => node.type === "button").props.onClick();
  assert.deepEqual(initial.changes, [true]);

  const confirmation = buttonFixture("delete", { confirming: true });
  const checkbox = confirmation.nodes.find(node => node.type === "input" && node.props.name === "confirm_permanent_delete");
  assert.equal(checkbox.props.type, "checkbox");
  assert.equal(checkbox.props.required, true);
  assert.equal(checkbox.props.value, "true");
  assert.match(textContent(confirmation.tree), /no se puede deshacer/);
  assert.match(textContent(confirmation.tree), /Noticia de prueba/);
  confirmation.nodes.find(node => node.type === "button" && node.props.type === "button").props.onClick();
  assert.deepEqual(confirmation.changes, [false]);
});

test("trash UI can cancel submission; pending controls disable and failures remain visible", () => {
  const originalWindow = globalThis.window;
  let prevented = false;
  try {
    globalThis.window = { confirm: () => false };
    buttonFixture("trash").tree.props.onSubmit({ preventDefault: () => { prevented = true; } });
    assert.equal(prevented, true);
  } finally {
    if (originalWindow === undefined) delete globalThis.window;
    else globalThis.window = originalWindow;
  }
  const pending = buttonFixture("delete", { confirming: true, pending: true });
  assert.ok(pending.nodes.filter(node => node.type === "button").every(node => node.props.disabled));
  assert.match(textContent(pending.tree), /Procesando/);
  const failed = buttonFixture("restore", { state: { ok: false, message: "Error recuperable" } });
  assert.equal(failed.nodes.find(node => node.props.role === "alert").props.children, "Error recuperable");
});

test("successful lifecycle UI actions report feedback, while failures retain their confirmation", async () => {
  const { actions } = setup([post({ deleted_at: "2026-10-02" })]);
  const fixture = buttonFixture("delete", { confirming: true, actions });
  const failed = await fixture.dispatch(null, form());
  assert.equal(failed.ok, false);
  assert.deepEqual(fixture.changes, []);
  assert.deepEqual(fixture.successes, []);
  const success = await fixture.dispatch(null, form({ confirm_permanent_delete: "true" }));
  assert.equal(success.ok, true);
  assert.deepEqual(fixture.changes, [false]);
  assert.deepEqual(fixture.successes, [success.message]);
});

test("active/trash views count each group, retain active editors when hidden, and never edit trash", () => {
  const posts = [post(), post({ id: "trash", title: "Noticia eliminada", deleted_at: "2026-10-02" })];
  for (const view of ["active", "trash"]) {
    const changes = [];
    const { AdminNews } = loadSource("src/app/admin/AdminNews.tsx", {
      react: { useState: initial => [initial === "active" ? view : initial, value => changes.push(value)] },
      "./news-actions": {}, "./SubmitButton": { SubmitButton: () => null },
      "./NewsTrashButton": { NewsTrashButton: () => null },
      "@/lib/news-placeholder": {},
    });
    const tree = AdminNews({ posts, supabaseReady: true });
    const nodes = elements(tree);
    const views = nodes.filter(node => node.type === "button" && node.props["aria-pressed"] !== undefined);
    assert.equal(textContent(views[0]), "Activas (1)");
    assert.equal(textContent(views[1]), "Papelera (1)");
    assert.equal(views[view === "active" ? 0 : 1].props["aria-pressed"], true);
    views[1].props.onClick();
    assert.deepEqual(changes, ["trash"]);
    const wrappers = nodes.filter(node => node.type === "div" && node.props.hidden !== undefined);
    assert.equal(wrappers[0].props.hidden, view !== "active");
    assert.equal(wrappers[1].props.hidden, view !== "active");
    assert.equal(wrappers[2].props.hidden, view !== "trash");
    assert.equal(elements(wrappers[1]).filter(node => node.type?.name === "NewsForm").length, 1);
    assert.equal(elements(wrappers[2]).filter(node => node.type?.name === "NewsForm").length, 0);
    assert.deepEqual(elements(wrappers[2]).filter(node => node.props.operation).map(node => node.props.operation), ["restore", "delete"]);
  }
});
