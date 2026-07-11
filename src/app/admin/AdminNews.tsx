"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { AlignCenter, AlignLeft, AlignRight, Bold, ImagePlus, ImageUp, Italic, LinkIcon, List, ListOrdered, Quote, Trash2, Underline } from "lucide-react";
import type { NewsActionState, NewsFormValues, NewsPost } from "@/types/news";
import { createNewsAction, deleteNewsAction, updateNewsAction } from "./news-actions";
import { SubmitButton } from "./SubmitButton";

const editorPlaceholder = "Escribe el contenido de la noticia aquí.";

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
  const imageInputRef = useRef<HTMLInputElement>(null);
  const initialHtml = normalizeInitialHtml(defaultValue);
  const [uploadError, setUploadError] = useState("");

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

  function selectedImage() {
    const editor = editorRef.current;
    if (!editor) return null;
    return editor.querySelector<HTMLImageElement>("img[data-editor-selected='true']") || editor.querySelector<HTMLImageElement>("img:last-of-type");
  }

  function insertImageNode(url: string, alt: string) {
    const editor = editorRef.current;
    if (!editor) return;

    const figure = document.createElement("figure");
    figure.className = "news-image-align-center";
    const image = document.createElement("img");
    image.src = url;
    image.alt = alt;
    image.className = "news-image-size-large";
    image.dataset.editorSelected = "true";
    figure.appendChild(image);

    editor.querySelectorAll<HTMLImageElement>("img[data-editor-selected]").forEach((item) => delete item.dataset.editorSelected);
    const selection = window.getSelection();
    const range = selection?.rangeCount ? selection.getRangeAt(0) : null;
    if (range && editor.contains(range.commonAncestorContainer)) {
      range.deleteContents();
      range.insertNode(figure);
      range.setStartAfter(figure);
      range.collapse(true);
      selection?.removeAllRanges();
      selection?.addRange(range);
    } else {
      editor.appendChild(figure);
    }
    sync();
  }

  function insertImageFromUrl() {
    const url = window.prompt("Pega la URL de la imagen");
    if (!url) return;
    const alt = window.prompt("Texto alternativo de la imagen") || "Imagen de la noticia";
    insertImageNode(url, alt);
  }

  async function uploadInlineImage(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;

    setUploadError("");
    const body = new FormData();
    body.set("image", file);

    try {
      const response = await fetch("/api/admin/news-images", { method: "POST", body });
      const result = (await response.json()) as { url?: string; error?: string };
      if (!response.ok || !result.url) throw new Error(result.error || "No se pudo subir la imagen.");
      insertImageNode(result.url, file.name.replace(/\.[^.]+$/, "") || "Imagen de la noticia");
    } catch (error) {
      setUploadError(error instanceof Error ? error.message : "No se pudo subir la imagen.");
    }
  }

  function setImageAlignment(value: "left" | "center" | "right") {
    const image = selectedImage();
    if (!image) {
      setUploadError("Primero selecciona una imagen del contenido.");
      return;
    }
    const figure = image.closest("figure") || image.parentElement;
    figure?.classList.remove("news-image-align-left", "news-image-align-center", "news-image-align-right");
    figure?.classList.add(`news-image-align-${value}`);
    setUploadError("");
    sync();
  }

  function setImageSize(value: "small" | "medium" | "large" | "full") {
    const image = selectedImage();
    if (!image) {
      setUploadError("Primero selecciona una imagen del contenido.");
      return;
    }
    image.classList.remove("news-image-size-small", "news-image-size-medium", "news-image-size-large", "news-image-size-full");
    image.classList.add(`news-image-size-${value}`);
    setUploadError("");
    sync();
  }

  function setFontSize(value: string) {
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
        <select aria-label="Formato de bloque" onChange={(event) => command("formatBlock", event.target.value)} defaultValue="p">
          <option value="p">Párrafo</option>
          <option value="h1">H1</option>
          <option value="h2">H2</option>
          <option value="h3">H3</option>
        </select>
        <select aria-label="Tamaño de texto" onChange={(event) => setFontSize(event.target.value)} defaultValue="3">
          <option value="3">Normal</option>
          <option value="4">Mediano</option>
          <option value="5">Grande</option>
        </select>
        <button type="button" title="Negrita" aria-label="Negrita" onClick={() => command("bold")}><Bold size={16} /></button>
        <button type="button" title="Cursiva" aria-label="Cursiva" onClick={() => command("italic")}><Italic size={16} /></button>
        <button type="button" title="Subrayado" aria-label="Subrayado" onClick={() => command("underline")}><Underline size={16} /></button>
        <button type="button" title="Lista" aria-label="Lista" onClick={() => command("insertUnorderedList")}><List size={16} /></button>
        <button type="button" title="Lista numerada" aria-label="Lista numerada" onClick={() => command("insertOrderedList")}><ListOrdered size={16} /></button>
        <button type="button" title="Cita" aria-label="Cita" onClick={() => command("formatBlock", "blockquote")}><Quote size={16} /></button>
        <button type="button" title="Enlace" aria-label="Enlace" onClick={createLink}><LinkIcon size={16} /></button>
        <button type="button" title="Subir imagen" aria-label="Subir imagen" onClick={() => imageInputRef.current?.click()}><ImageUp size={16} /></button>
        <button type="button" title="Insertar imagen por URL" aria-label="Insertar imagen por URL" onClick={insertImageFromUrl}><ImagePlus size={16} /></button>
        <button type="button" title="Alinear imagen a la izquierda" aria-label="Alinear imagen a la izquierda" onClick={() => setImageAlignment("left")}><AlignLeft size={16} /></button>
        <button type="button" title="Centrar imagen" aria-label="Centrar imagen" onClick={() => setImageAlignment("center")}><AlignCenter size={16} /></button>
        <button type="button" title="Alinear imagen a la derecha" aria-label="Alinear imagen a la derecha" onClick={() => setImageAlignment("right")}><AlignRight size={16} /></button>
        <select aria-label="Tamaño de imagen" defaultValue="" onChange={(event) => {
          const value = event.target.value as "small" | "medium" | "large" | "full" | "";
          if (value) setImageSize(value);
          event.currentTarget.value = "";
        }}>
          <option value="">Imagen: tamaño</option>
          <option value="small">Pequeña</option>
          <option value="medium">Mediana</option>
          <option value="large">Grande</option>
          <option value="full">Ancho completo</option>
        </select>
      </div>
      <input ref={imageInputRef} className="sr-only" type="file" accept="image/jpeg,image/png,image/webp" onChange={uploadInlineImage} />
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
        onInput={sync}
        onBlur={sync}
        onClick={(event) => {
          const image = event.target instanceof HTMLImageElement ? event.target : null;
          if (!image) return;
          editorRef.current?.querySelectorAll<HTMLImageElement>("img[data-editor-selected]").forEach((item) => delete item.dataset.editorSelected);
          image.dataset.editorSelected = "true";
        }}
      />
      {uploadError ? <p className="editor-inline-error">{uploadError}</p> : null}
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
          <input name="slug" defaultValue={values.slug} placeholder="se-genera-automatico" />
        </label>
      </div>
      <label>
        Bajada o resumen
        <textarea name="excerpt" defaultValue={values.excerpt} rows={3} />
      </label>
      <div className="form-grid">
        <label>
          Imagen destacada
          <input name="cover_image" type="file" accept="image/jpeg,image/png,image/webp" />
        </label>
        <label>
          URL de imagen actual
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
