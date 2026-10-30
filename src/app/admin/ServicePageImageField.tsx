"use client";

import { useState } from "react";
import { safeContentImage } from "@/lib/service-fields";

export function ServicePageImageField({ value, alt, uploading, onChange, onUploading }: {
  value: string; alt: string; uploading: boolean; onChange: (url: string) => void; onUploading: (busy: boolean) => void;
}) {
  const [message, setMessage] = useState<{ ok: boolean; text: string } | null>(null);
  return <>
    <label>Imagen principal (URL o ruta /assets/)<input required maxLength={2000} value={value} disabled={uploading} onChange={event => onChange(event.target.value)} /></label>
    <label>Subir imagen (JPG, PNG o WebP, máximo 4 MB)<input type="file" accept="image/jpeg,image/png,image/webp" disabled={uploading} onChange={async event => {
      const input = event.currentTarget;
      const file = input.files?.[0];
      if (!file) return;
      setMessage(null);
      onUploading(true);
      try {
        if (!["image/jpeg", "image/png", "image/webp"].includes(file.type) || !file.size || file.size > 4 * 1024 * 1024) throw new Error("Selecciona una imagen JPG, PNG o WebP de hasta 4 MB.");
        const body = new FormData();
        body.set("image", file);
        const response = await fetch("/admin/api/news-images", { method: "POST", body });
        const result = await response.json();
        if (!response.ok || typeof result.url !== "string" || !safeContentImage(result.url)) throw new Error(typeof result.error === "string" ? result.error : "No se pudo subir la imagen.");
        onChange(result.url);
        setMessage({ ok: true, text: "Imagen subida. Guarda la página para aplicar el cambio." });
      } catch (error) {
        setMessage({ ok: false, text: error instanceof Error ? error.message : "No se pudo subir la imagen. Intenta nuevamente." });
      } finally {
        input.value = "";
        onUploading(false);
      }
    }} /></label>
    {uploading ? <p role="status">Subiendo imagen...</p> : null}
    {message ? <p role="status" className={message.ok ? "admin-success" : "admin-error"}>{message.text}</p> : null}
    {safeContentImage(value) ? <img src={value} alt={alt} style={{ display: "block", width: "100%", maxWidth: 480, aspectRatio: "16 / 9", objectFit: "cover" }} /> : null}
  </>;
}
