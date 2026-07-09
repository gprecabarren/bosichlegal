"use client";

import { useActionState, useEffect, useRef } from "react";
import { ImagePlus, Italic, LinkIcon, List, ListOrdered, Quote, Trash2, Type, Underline } from "lucide-react";
import type { NewsActionState, NewsFormValues, NewsPost } from "@/types/news";
import { createNewsAction, deleteNewsAction, updateNewsAction } from "./news-actions";
import { SubmitButton } from "./SubmitButton";

const editorPlaceholder = "Escribe la noticia aquí.";

function htmlText(html: string) {
  if (typeof document === "undefined") {
    return html.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
  }

  const div = document.createElement("div");
  div.innerHTML = html;
  return div.textContent?.replace(/\s+/g, " ").trim() || "";
}

function normalizeInitialHtml(value: string) {
  const trimmed = value.trim();
  return htmlText(trimmed) === editorPlaceholder ? "" : trimmed;
}

function RichTextEditor({
  name,
  defaultValue = "",
  placeholder = editorPlaceholder,
}: {
  name: string;
  defaultValue?: string;
  placeholder?: string;
}) {
  const editorRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const initialHtml = normalizeInitialHtml(defaultValue);

  function isEmpty(editor: HTMLDivElement) {
    return !editor.textContent?.trim() && editor.querySelectorAll("img").length === 0;
  }

  function refreshEmptyState() {
    const editor = editorRef.current;
    if (!editor) return;
    editor.dataset.empty = isEmpty(editor) ? "true" : "false";
  }

  function sync() {
    if (inputRef.current) {
      inputRef.current.value = editorRef.current?.innerHTML || "";
    }
    refreshEmptyState();
  }

  function command(action: string, value?: string) {
    editorRef.current?.focus();
    document.execCommand(action, false, value);
    sync();
  }

  function createLink() {
    const url = window.prompt("Pega el enlace completo");
    if (!url) return;
    command("createLink", url);
  }

  function insertImage() {
    const url = window.prompt("Pega la URL de la imagen");
    if (!url) return;
    command("insertImage", url);
  }

  function setFontSize(value: string) {
    if (!value) return;
    command("fontSize", value);
    const editor = editorRef.current;
    if (!editor) return;

    editor.querySelectorAll("font[size]").forEach((font) => {
      const size = font.getAttribute("size");
      const span = document.createElement("span");
      const rem = size === "5" ? "1.35rem" : size === "4" ? "1.15rem" : "1rem";
      span.setAttribute("style", `font-size: ${rem}`);
      span.innerHTML = font.innerHTML;
      font.replaceWith(span);
    });
    sync();
  }

  useEffect(() => {
    const editor = editorRef.current;
    if (!editor) return;
    editor.innerHTML = initialHtml;
    sync();
  }, [initialHtml]);

  return (
    <div className="rich-editor">
      <input ref={inputRef} type="hidden" name={name} defaultValue={initialHtml} />
      <div className="editor-toolbar" aria-label="Herramientas de edición">
        <select aria-label="Formato" onChange={(event) => command("formatBlock", event.target.value)} defaultValue="p">
          <option value="p">Párrafo</option>
          <option value="h1">H1</option>
          <option value="h2">H2</option>
          <option value="h3">H3</option>
        </select>
        <select aria-label="Tamaño" onChange={(event) => setFontSize(event.target.value)} defaultValue="">
          <option value="">Tamaño</option>
          <option value="3">Normal</option>
          <option value="4">Mediano</option>
          <option value="5">Grande</option>
        </select>
        <button type="button" title="Negrita" onClick={() => command("bold")}><Type size={16} /></button>
        <button type="button" title="Cursiva" onClick={() => command("italic")}><Italic size={16} /></button>
        <button type="button" title="Subrayado" onClick={() => command("underline")}><Underline size={16} /></button>
        <button type="button" title="Lista" onClick={() => command("insertUnorderedList")}><List size={16} /></button>
        <button type="button" title="Lista numerada" onClick={() => command("insertOrderedList")}><ListOrdered size={16} /></button>
        <button type="button" title="Cita" onClick={() => command("formatBlock", "blockquote")}><Quote size={16} /></button>
        <button type="button" title="Enlace" onClick={createLink}><LinkIcon size={16} /></button>
        <button type="button" title="Insertar imagen por URL" onClick={insertImage}><ImagePlus size={16} /></button>
      </div>
      <div
        ref={editorRef}
        className="editor-surface"
        contentEditable
        role="textbox"
        tabIndex={0}
        aria-label="Contenido de la noticia"
        data-empty={initialHtml ? "false" : "true"}
        data-placeholder={placeholder}
        spellCheck
        suppressContentEditableWarning
        onFocus={() => {
          const editor = editorRef.current;
          if (editor && htmlText(editor.innerHTML) === placeholder) {
            editor.innerHTML = "";
          }
          sync();
        }}
        onInput={sync}
        onBlur={sync}
      />
    </div>
  );
}

function valuesForForm(state: NewsActionState, post?: NewsPost): NewsFormValues {
  if (state?.values) return state.values;

  return {
    id: post?.id || "",
    title: post?.title || "",
    slug: post?.slug || "",
    excerpt: post?.excerpt || "",
    content_html: post?.content_html || "",
    cover_image_url: post?.cover_image_url || "",
    status: post?.status || "draft",
  };
}

function NewsForm({ post }: { post?: NewsPost }) {
  const action = post ? updateNewsAction : createNewsAction;
  const [state, formAction] = useActionState<NewsActionState, FormData>(action, null);
  const values = valuesForForm(state, post);
  const formKey = `${post?.id || "new"}-${state?.resetKey || "initial"}`;

  return (
    <form key={formKey} className="news-admin-form" action={formAction}>
      {post ? <input type="hidden" name="id" value={post.id} /> : null}
      <div className="form-grid">
        <label>
          Título
          <input name="title" defaultValue={values.title} required />
        </label>
        <label>
          Slug
          <input name="slug" defaultValue={values.slug} placeholder="se-genera-automático" />
        </label>
      </div>
      <label>
        Bajada o resumen
        <textarea name="excerpt" defaultValue={values.excerpt} rows={3} />
      </label>
      <div className="form-grid">
        <label>
          Imagen destacada
          <input name="cover_image" type="file" accept="image/*" />
        </label>
        <label>
          URL imagen actual
          <input name="cover_image_url" defaultValue={values.cover_image_url} placeholder="https://..." />
        </label>
      </div>
      <label>
        Estado
        <select name="status" defaultValue={values.status}>
          <option value="draft">Borrador</option>
          <option value="published">Publicado</option>
        </select>
      </label>
      <div className="field-label">
        <span>Contenido</span>
        <RichTextEditor name="content_html" defaultValue={values.content_html} />
      </div>
      <div className="admin-actions">
        <SubmitButton label={post ? "Actualizar noticia" : "Crear noticia"} />
        {state?.message ? <p className={state.ok ? "admin-success" : "admin-error"}>{state.message}</p> : null}
      </div>
    </form>
  );
}

export function AdminNews({ posts, supabaseReady }: { posts: NewsPost[]; supabaseReady: boolean }) {
  return (
    <section className="admin-news">
      <div className="section-heading compact">
        <div>
          <p className="eyebrow">Noticias</p>
          <h2>Blog jurídico</h2>
        </div>
      </div>
      {!supabaseReady ? (
        <div className="admin-warning">
          Supabase todavía no está conectado. La sección Noticias se activa cuando exista la tabla news_posts y el bucket news-images.
        </div>
      ) : (
        <NewsForm />
      )}
      <div className="news-admin-list">
        {posts.length === 0 ? <p className="admin-help">Todavía no hay noticias creadas.</p> : null}
        {posts.map((post) => (
          <article className="news-admin-card" key={post.id}>
            <div className="news-admin-card-heading">
              <div>
                <span className={`status-pill ${post.status === "published" ? "status-contacted" : ""}`}>
                  {post.status === "published" ? "Publicado" : "Borrador"}
                </span>
                <h3>{post.title}</h3>
                <p>{post.excerpt}</p>
              </div>
              <form action={deleteNewsAction}>
                <input type="hidden" name="id" value={post.id} />
                <button className="danger-button" type="submit" aria-label={`Eliminar ${post.title}`}>
                  <Trash2 size={16} />
                </button>
              </form>
            </div>
            <NewsForm post={post} />
          </article>
        ))}
      </div>
    </section>
  );
}
