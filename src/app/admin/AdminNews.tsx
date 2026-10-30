"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { AlignCenter, AlignLeft, AlignRight, Bold, Crop, FileText, ImagePlus, ImageUp, Italic, LinkIcon, List, ListOrdered, Quote, Trash2, Underline, X } from "lucide-react";
import type { NewsActionState, NewsFormValues, NewsPost } from "@/types/news";
import { createNewsAction, updateNewsAction } from "./news-actions";
import { SubmitButton } from "./SubmitButton";
import { NewsTrashButton } from "./NewsTrashButton";
import { isNewsPlaceholder } from "@/lib/news-placeholder";

const editorPlaceholder = "Escribe el contenido de la noticia aquí.";

type BlockFormat = "p" | "h1" | "h2" | "h3" | "blockquote";
type CropRatio = "original" | "landscape" | "square" | "portrait";

type PendingImage = {
  file: File;
  objectUrl: string;
};

function loadEditorImage(url: string) {
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error("No se pudo preparar la imagen."));
    image.src = url;
  });
}

function cropRatioValue(ratio: CropRatio, width: number, height: number) {
  if (ratio === "landscape") return 16 / 9;
  if (ratio === "square") return 1;
  if (ratio === "portrait") return 4 / 5;
  return width / height;
}

function cropRatioLabel(ratio: CropRatio) {
  if (ratio === "landscape") return "16:9 horizontal";
  if (ratio === "square") return "1:1 cuadrado";
  if (ratio === "portrait") return "4:5 vertical";
  return "Proporción original";
}

function slugFromTitle(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 88);
}

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
  return isNewsPlaceholder(trimmed) ? "" : trimmed;
}

export function RichTextEditor({
  name,
  defaultValue = "",
  placeholder = editorPlaceholder,
  onChange,
  ariaLabel = "Contenido de la noticia",
  allowH1 = true,
}: {
  name: string;
  defaultValue?: string;
  placeholder?: string;
  onChange?: (html: string) => void;
  ariaLabel?: string;
  allowH1?: boolean;
}) {
  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;
  const editorRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const initialHtml = normalizeInitialHtml(defaultValue);
  const [uploadError, setUploadError] = useState("");
  const [blockFormat, setBlockFormat] = useState<BlockFormat>("p");
  const [pendingImage, setPendingImage] = useState<PendingImage | null>(null);
  const [cropRatio, setCropRatio] = useState<CropRatio>("original");
  const [cropZoom, setCropZoom] = useState(1);
  const [cropOffsetX, setCropOffsetX] = useState(0);
  const [cropOffsetY, setCropOffsetY] = useState(0);
  const [activeImage, setActiveImage] = useState<HTMLImageElement | null>(null);
  const [imageAlt, setImageAlt] = useState("");
  const [imageTitle, setImageTitle] = useState("");
  const [imageCaption, setImageCaption] = useState("");

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
    onChangeRef.current?.(editorRef.current?.innerHTML || "");
  }

  function command(action: string, value?: string) {
    editorRef.current?.focus();
    document.execCommand(action, false, value);
    sync();
  }

  function updateBlockFormat() {
    const editor = editorRef.current;
    const selection = window.getSelection();
    if (!editor || !selection?.rangeCount) return;

    let node: Node | null = selection.anchorNode;
    while (node && node !== editor) {
      if (node instanceof HTMLElement) {
        const tag = node.tagName.toLowerCase();
        if (["p", "h1", "h2", "h3", "blockquote"].includes(tag)) {
          setBlockFormat(tag as BlockFormat);
          return;
        }
      }
      node = node.parentNode;
    }
    setBlockFormat("p");
  }

  function changeBlockFormat(value: BlockFormat) {
    editorRef.current?.focus();
    document.execCommand("formatBlock", false, `<${value}>`);
    sync();
    updateBlockFormat();
  }

  function createLink() {
    const url = window.prompt("Pega el enlace completo");
    if (!url) return;
    command("createLink", url);
  }

  function selectedImage() {
    const editor = editorRef.current;
    if (!editor) return null;
    if (activeImage?.isConnected && editor.contains(activeImage)) return activeImage;
    return editor.querySelector<HTMLImageElement>("img[data-editor-selected='true']") || editor.querySelector<HTMLImageElement>("img:last-of-type");
  }

  function selectImage(image: HTMLImageElement) {
    const editor = editorRef.current;
    if (!editor) return;
    editor.querySelectorAll<HTMLImageElement>("img[data-editor-selected]").forEach((item) => delete item.dataset.editorSelected);
    image.dataset.editorSelected = "true";
    const figure = image.closest("figure");
    setActiveImage(image);
    setImageAlt(image.alt || "");
    setImageTitle(image.title || "");
    setImageCaption(figure?.querySelector("figcaption")?.textContent || "");
  }

  function insertImageNode(url: string, alt: string, title = "", caption = "") {
    const editor = editorRef.current;
    if (!editor) return;

    const figure = document.createElement("figure");
    figure.className = "news-image-align-center";
    const image = document.createElement("img");
    image.src = url;
    image.alt = alt;
    if (title.trim()) image.title = title.trim();
    image.className = "news-image-size-large";
    figure.appendChild(image);
    if (caption.trim()) {
      const figcaption = document.createElement("figcaption");
      figcaption.textContent = caption.trim();
      figure.appendChild(figcaption);
    }

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
    selectImage(image);
    sync();
  }

  function insertImageFromUrl() {
    const url = window.prompt("Pega la URL de la imagen");
    if (!url) return;
    const alt = window.prompt("Texto alternativo de la imagen") || "Imagen de la noticia";
    insertImageNode(url, alt);
  }

  function resetPendingImage() {
    if (pendingImage) URL.revokeObjectURL(pendingImage.objectUrl);
    setPendingImage(null);
    setCropRatio("original");
    setCropZoom(1);
    setCropOffsetX(0);
    setCropOffsetY(0);
  }

  function queueInlineImage(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;

    if (!file.type.match(/^image\/(jpeg|png|webp)$/)) {
      setUploadError("La imagen debe ser JPG, PNG o WebP.");
      return;
    }
    if (file.size > 4 * 1024 * 1024) {
      setUploadError("La imagen no puede superar 4 MB.");
      return;
    }

    if (pendingImage) URL.revokeObjectURL(pendingImage.objectUrl);
    setUploadError("");
    setPendingImage({ file, objectUrl: URL.createObjectURL(file) });
    setImageAlt(file.name.replace(/\.[^.]+$/, "").replaceAll(/[-_]+/g, " "));
    setImageTitle("");
    setImageCaption("");
    setCropRatio("original");
    setCropZoom(1);
    setCropOffsetX(0);
    setCropOffsetY(0);
  }

  async function croppedPendingFile() {
    if (!pendingImage) throw new Error("Selecciona una imagen primero.");
    const source = await loadEditorImage(pendingImage.objectUrl);
    const targetRatio = cropRatioValue(cropRatio, source.naturalWidth, source.naturalHeight);
    const sourceRatio = source.naturalWidth / source.naturalHeight;
    const baseWidth = sourceRatio > targetRatio ? source.naturalHeight * targetRatio : source.naturalWidth;
    const baseHeight = baseWidth / targetRatio;
    const cropWidth = baseWidth / cropZoom;
    const cropHeight = baseHeight / cropZoom;
    const maxX = Math.max(0, source.naturalWidth - cropWidth);
    const maxY = Math.max(0, source.naturalHeight - cropHeight);
    const sourceX = Math.min(maxX, Math.max(0, maxX / 2 + (cropOffsetX / 100) * (maxX / 2)));
    const sourceY = Math.min(maxY, Math.max(0, maxY / 2 + (cropOffsetY / 100) * (maxY / 2)));
    const canvas = document.createElement("canvas");
    canvas.width = Math.round(cropWidth);
    canvas.height = Math.round(cropHeight);
    const context = canvas.getContext("2d");
    if (!context) throw new Error("El navegador no permite recortar esta imagen.");
    context.drawImage(source, sourceX, sourceY, cropWidth, cropHeight, 0, 0, canvas.width, canvas.height);
    const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, pendingImage.file.type, 0.95));
    if (!blob) throw new Error("No se pudo crear el recorte.");
    return new File([blob], pendingImage.file.name, { type: blob.type || pendingImage.file.type });
  }

  async function uploadPendingImage(crop = false) {
    if (!pendingImage) return;
    try {
      const body = new FormData();
      body.set("image", crop ? await croppedPendingFile() : pendingImage.file);
      const response = await fetch("/admin/api/news-images", { method: "POST", body });
      const result = (await response.json()) as { url?: string; error?: string };
      if (!response.ok || !result.url) throw new Error(result.error || "No se pudo subir la imagen.");
      insertImageNode(result.url, imageAlt.trim() || "Imagen de la noticia", imageTitle, imageCaption);
      resetPendingImage();
    } catch (error) {
      setUploadError(error instanceof Error ? error.message : "No se pudo subir la imagen.");
    }
  }

  function updateImageDetails(next: { alt?: string; title?: string; caption?: string }) {
    const image = selectedImage();
    if (!image) return;
    const figure = image.closest("figure");
    if (!figure) return;
    if (next.alt !== undefined) image.alt = next.alt.trim();
    if (next.title !== undefined) {
      if (next.title.trim()) image.title = next.title.trim();
      else image.removeAttribute("title");
    }
    if (next.caption !== undefined) {
      const existingCaption = figure.querySelector("figcaption");
      if (next.caption.trim()) {
        const caption = existingCaption || document.createElement("figcaption");
        caption.textContent = next.caption.trim();
        if (!existingCaption) figure.appendChild(caption);
      } else {
        existingCaption?.remove();
      }
    }
    sync();
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
    selectImage(image);
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
    selectImage(image);
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
    if (editor.innerHTML === initialHtml) return;
    editor.innerHTML = initialHtml;
    const first = editor.firstChild;
    if (first && isNewsPlaceholder(first.textContent || "") && !(first instanceof Element && first.querySelector("img"))) first.remove();
    sync();
  }, [initialHtml]);

  useEffect(() => {
    const handleSelectionChange = () => updateBlockFormat();
    document.addEventListener("selectionchange", handleSelectionChange);
    return () => document.removeEventListener("selectionchange", handleSelectionChange);
  }, []);

  useEffect(() => () => {
    if (pendingImage) URL.revokeObjectURL(pendingImage.objectUrl);
  }, [pendingImage]);

  return (
    <div className="rich-editor">
      <input ref={inputRef} type="hidden" name={name} defaultValue={initialHtml} />
      <div className="editor-toolbar" aria-label="Herramientas de edición">
        <select
          aria-label="Formato de bloque"
          value={blockFormat}
          onChange={(event) => changeBlockFormat(event.target.value as BlockFormat)}
        >
          <option value="p">Párrafo</option>
          {allowH1 ? <option value="h1">H1</option> : null}
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
        <button type="button" title="Cita" aria-label="Cita" onClick={() => changeBlockFormat("blockquote")}><Quote size={16} /></button>
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
      <input ref={imageInputRef} className="sr-only" type="file" accept="image/jpeg,image/png,image/webp" onChange={queueInlineImage} />
      {pendingImage ? (
        <section className="editor-image-cropper" aria-label="Preparar imagen para la noticia">
          <div className="editor-image-crop-preview" style={{ aspectRatio: cropRatio === "original" ? undefined : cropRatioValue(cropRatio, 16, 9) }}>
            <img
              src={pendingImage.objectUrl}
              alt="Vista previa del recorte"
              style={{ transform: `translate(${cropOffsetX}%, ${cropOffsetY}%) scale(${cropZoom})` }}
            />
          </div>
          <div className="editor-image-crop-controls">
            <div className="editor-image-crop-heading">
              <strong>Preparar imagen</strong>
              <button type="button" className="icon-button" title="Cancelar imagen" aria-label="Cancelar imagen" onClick={resetPendingImage}><X size={16} /></button>
            </div>
            <label>
              Proporción
              <select value={cropRatio} onChange={(event) => setCropRatio(event.target.value as CropRatio)}>
                {(["original", "landscape", "square", "portrait"] as CropRatio[]).map((ratio) => <option key={ratio} value={ratio}>{cropRatioLabel(ratio)}</option>)}
              </select>
            </label>
            <label>
              Zoom
              <input type="range" min="1" max="2.4" step="0.05" value={cropZoom} onChange={(event) => setCropZoom(Number(event.target.value))} />
            </label>
            <label>
              Mover horizontalmente
              <input type="range" min="-100" max="100" step="1" value={cropOffsetX} onChange={(event) => setCropOffsetX(Number(event.target.value))} />
            </label>
            <label>
              Mover verticalmente
              <input type="range" min="-100" max="100" step="1" value={cropOffsetY} onChange={(event) => setCropOffsetY(Number(event.target.value))} />
            </label>
            <label>
              Texto alternativo
              <input value={imageAlt} maxLength={160} onChange={(event) => setImageAlt(event.target.value)} placeholder="Describe la imagen" />
            </label>
            <label>
              Título de imagen
              <input value={imageTitle} maxLength={160} onChange={(event) => setImageTitle(event.target.value)} placeholder="Opcional" />
            </label>
            <label>
              Pie de foto
              <input value={imageCaption} maxLength={240} onChange={(event) => setImageCaption(event.target.value)} placeholder="Opcional" />
            </label>
            <div className="editor-image-crop-actions">
              <button className="button button-small" type="button" onClick={() => uploadPendingImage(false)}>Usar original</button>
              <button className="button button-small" type="button" onClick={() => uploadPendingImage(true)}><Crop size={16} /> Recortar e insertar</button>
            </div>
          </div>
        </section>
      ) : null}
      <div
        ref={editorRef}
        className="editor-surface"
        contentEditable
        role="textbox"
        tabIndex={0}
        aria-label={ariaLabel}
        data-empty={initialHtml ? "false" : "true"}
        data-placeholder={placeholder}
        spellCheck
        suppressContentEditableWarning
        onInput={sync}
        onFocus={() => {
          const editor = editorRef.current;
          if (editor && isNewsPlaceholder(editor.textContent || "") && !editor.querySelector("img")) {
            editor.replaceChildren();
          }
          sync();
        }}
        onBlur={() => {
          sync();
          updateBlockFormat();
        }}
        onKeyUp={updateBlockFormat}
        onClick={(event) => {
          const image = event.target instanceof HTMLImageElement ? event.target : null;
          if (!image) { updateBlockFormat(); return; }
          selectImage(image);
        }}
      />
      {activeImage?.isConnected ? (
        <section className="editor-image-inspector" aria-label="Opciones de imagen seleccionada">
          <div className="editor-image-crop-heading">
            <strong>Imagen seleccionada</strong>
            <button type="button" className="icon-button" title="Quitar imagen" aria-label="Quitar imagen" onClick={() => {
              activeImage.closest("figure")?.remove();
              setActiveImage(null);
              setImageAlt("");
              setImageTitle("");
              setImageCaption("");
              sync();
            }}><Trash2 size={16} /></button>
          </div>
          <label>
            Texto alternativo
            <input value={imageAlt} maxLength={160} onChange={(event) => {
              setImageAlt(event.target.value);
              updateImageDetails({ alt: event.target.value });
            }} />
          </label>
          <label>
            Título de imagen
            <input value={imageTitle} maxLength={160} onChange={(event) => {
              setImageTitle(event.target.value);
              updateImageDetails({ title: event.target.value });
            }} />
          </label>
          <label>
            Pie de foto
            <input value={imageCaption} maxLength={240} onChange={(event) => {
              setImageCaption(event.target.value);
              updateImageDetails({ caption: event.target.value });
            }} />
          </label>
          <div className="editor-image-inspector-actions">
            <span>Alineación</span>
            <button type="button" title="Alinear a la izquierda" aria-label="Alinear a la izquierda" onClick={() => setImageAlignment("left")}><AlignLeft size={16} /></button>
            <button type="button" title="Centrar imagen" aria-label="Centrar imagen" onClick={() => setImageAlignment("center")}><AlignCenter size={16} /></button>
            <button type="button" title="Alinear a la derecha" aria-label="Alinear a la derecha" onClick={() => setImageAlignment("right")}><AlignRight size={16} /></button>
            <select aria-label="Tamaño de imagen" defaultValue="" onChange={(event) => {
              const value = event.target.value as "small" | "medium" | "large" | "full" | "";
              if (value) setImageSize(value);
              event.currentTarget.value = "";
            }}>
              <option value="">Tamaño</option>
              <option value="small">Pequeña</option>
              <option value="medium">Mediana</option>
              <option value="large">Grande</option>
              <option value="full">Ancho completo</option>
            </select>
          </div>
        </section>
      ) : null}
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
    seo_title: post?.seo_title || "",
    meta_description: post?.meta_description || "",
    focus_keyword: post?.focus_keyword || "",
    canonical_url: post?.canonical_url || "",
    og_title: post?.og_title || "",
    og_description: post?.og_description || "",
    noindex: post?.noindex || false,
    status: post?.status || "draft",
  };
}

function SeoFields({ values }: { values: NewsFormValues }) {
  const [hint, setHint] = useState("");

  function autoCompleteSeo(event: React.MouseEvent<HTMLButtonElement>) {
    const form = event.currentTarget.form;
    if (!form) return;
    const value = (name: string) => (form.elements.namedItem(name) as HTMLInputElement | HTMLTextAreaElement | null)?.value.trim() || "";
    const setValue = (name: string, next: string) => {
      const field = form.elements.namedItem(name) as HTMLInputElement | HTMLTextAreaElement | null;
      if (field && !field.value.trim()) field.value = next;
    };
    const title = value("title");
    const excerpt = value("excerpt");
    const text = htmlText(value("content_html"));
    const keyword = title.split(/[|:\u2013\u2014-]/)[0]?.trim() || "abogados en Concepción";
    const description = (excerpt || text).replace(/\s+/g, " ").trim().slice(0, 155);
    const seoTitle = title ? `${title.slice(0, 54)} | Bosich Legal` : "Bosich Legal | Abogados en Concepción";
    const slug = value("slug") || slugFromTitle(title);

    setValue("seo_title", seoTitle.slice(0, 60));
    setValue("meta_description", description);
    setValue("focus_keyword", keyword.slice(0, 80));
    setValue("canonical_url", slug ? `https://www.bosichlegal.cl/noticias/${slug}` : "");
    setValue("og_title", seoTitle.slice(0, 60));
    setValue("og_description", description);
    setHint("Propuesta generada. Puedes editar cada campo antes de guardar.");
  }

  return (
    <details className="news-seo-panel">
      <summary>SEO de esta noticia</summary>
      <div className="news-seo-grid">
        <div className="news-seo-heading">
          <p className="admin-help">Completa estos campos manualmente o genera una propuesta basada en el título y el contenido.</p>
          <button type="button" className="button button-small" onClick={autoCompleteSeo}>Generar SEO automático</button>
        </div>
        <label>
          Título SEO
          <input name="seo_title" defaultValue={values.seo_title} maxLength={60} placeholder="Hasta 60 caracteres" />
        </label>
        <label>
          Descripción SEO
          <textarea name="meta_description" defaultValue={values.meta_description} rows={3} maxLength={160} placeholder="Hasta 160 caracteres" />
        </label>
        <label>
          Palabra clave principal
          <input name="focus_keyword" defaultValue={values.focus_keyword} maxLength={80} placeholder="Ej.: abogados penalistas en Concepción" />
        </label>
        <label>
          URL canónica
          <input name="canonical_url" type="url" defaultValue={values.canonical_url} placeholder="https://bosichlegal.cl/noticias/..." />
        </label>
        <label>
          Título para compartir
          <input name="og_title" defaultValue={values.og_title} maxLength={60} placeholder="Opcional: se usa el título SEO" />
        </label>
        <label>
          Descripción para compartir
          <textarea name="og_description" defaultValue={values.og_description} rows={3} maxLength={160} placeholder="Opcional: se usa la descripción SEO" />
        </label>
        <label className="checkbox-label">
          <input name="noindex" type="checkbox" defaultChecked={values.noindex} />
          No indexar esta noticia en Google
        </label>
        {hint ? <p className="admin-success">{hint}</p> : null}
      </div>
    </details>
  );
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
      <SeoFields values={values} />
      <div className="field-label">
        <span>Contenido</span>
        <RichTextEditor name="content_html" defaultValue={values.content_html} />
      </div>
      <div className="admin-actions">
        <SubmitButton label={post ? "Actualizar noticia" : "Crear noticia"} />
        {state?.message ? <p className={state.ok ? "admin-success" : "admin-error"} role={state.ok ? "status" : "alert"}>{state.message}</p> : null}
      </div>
    </form>
  );
}

export function AdminNews({ posts, supabaseReady, loadError = "" }: { posts: NewsPost[]; supabaseReady: boolean; loadError?: string }) {
  const [view, setView] = useState<"active" | "trash">("active");
  const [feedback, setFeedback] = useState("");
  const active = posts.filter((post) => !post.deleted_at);
  const trash = posts.filter((post) => post.deleted_at);

  return (
    <section className="admin-news">
      <div className="section-heading compact">
        <div>
          <p className="eyebrow">Noticias</p>
          <h2>Blog jurídico</h2>
        </div>
      </div>
      <div className="admin-actions news-view-switcher" role="group" aria-label="Vista de noticias">
        <button className={`button${view === "active" ? "" : " button-secondary"}`} type="button" aria-pressed={view === "active"} onClick={() => setView("active")}>
          <FileText size={16} />Activas ({active.length})
        </button>
        <button className={`button${view === "trash" ? "" : " button-secondary"}`} type="button" aria-pressed={view === "trash"} onClick={() => setView("trash")}>
          <Trash2 size={16} />Papelera ({trash.length})
        </button>
      </div>
      {!supabaseReady ? (
        <div className="admin-warning">
          Supabase todavía no está conectado. La sección Noticias se activa cuando exista la tabla news_posts y el bucket news-images.
        </div>
      ) : (
        <div hidden={view !== "active"}><NewsForm /></div>
      )}
      {loadError ? <p className="admin-warning" role="alert">{loadError}</p> : null}
      {feedback ? <p className="admin-success" role="status">{feedback}</p> : null}
      <div hidden={view !== "active"}>
        <div className="news-admin-list">
          {!loadError && active.length === 0 ? <p className="admin-help">No hay noticias activas.</p> : null}
          {active.map((post) => (
            <article className="news-admin-card" key={post.id}>
              <div className="news-admin-card-heading">
                <div>
                  <span className={`status-pill ${post.status === "published" ? "status-contacted" : ""}`}>
                    {post.status === "published" ? "Publicado" : "Borrador"}
                  </span>
                  <h3>{post.title}</h3>
                  <p>{post.excerpt}</p>
                </div>
                <NewsTrashButton post={post} operation="trash" onSuccess={setFeedback} />
              </div>
              <NewsForm post={post} />
            </article>
          ))}
        </div>
      </div>
      <div hidden={view !== "trash"}>
        <div className="news-admin-list">
          {!loadError && trash.length === 0 ? <p className="admin-help">La papelera está vacía.</p> : null}
          {trash.map((post) => (
            <article className="news-admin-card" key={post.id}>
              <div className="news-admin-card-heading">
                <div>
                  <span className="status-pill">En la papelera</span>
                  <h3>{post.title}</h3>
                  <p>{post.excerpt}</p>
                </div>
              </div>
              <div className="admin-actions news-trash-actions">
                <NewsTrashButton post={post} operation="restore" onSuccess={setFeedback} />
                <NewsTrashButton post={post} operation="delete" onSuccess={setFeedback} />
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
