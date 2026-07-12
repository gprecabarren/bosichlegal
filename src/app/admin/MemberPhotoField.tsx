"use client";

import { useEffect, useId, useRef, useState } from "react";
import { Crop, ImageUp } from "lucide-react";

type MemberPhotoFieldProps = {
  label: string;
};

function loadImage(url: string) {
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error("No se pudo abrir la imagen."));
    image.src = url;
  });
}

export function MemberPhotoField({ label }: MemberPhotoFieldProps) {
  const id = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const objectUrlRef = useRef("");
  const [source, setSource] = useState("");
  const [zoom, setZoom] = useState(1);
  const [offsetX, setOffsetX] = useState(0);
  const [offsetY, setOffsetY] = useState(0);
  const [outputSize, setOutputSize] = useState("1000");
  const [message, setMessage] = useState("");

  useEffect(() => () => {
    if (objectUrlRef.current) URL.revokeObjectURL(objectUrlRef.current);
  }, []);

  function onSelect(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
      setMessage("Usa una foto JPG, PNG o WebP.");
      event.target.value = "";
      return;
    }
    if (file.size > 4 * 1024 * 1024) {
      setMessage("La foto original no puede superar 4 MB.");
      event.target.value = "";
      return;
    }
    if (objectUrlRef.current) URL.revokeObjectURL(objectUrlRef.current);
    objectUrlRef.current = URL.createObjectURL(file);
    setSource(objectUrlRef.current);
    setZoom(1);
    setOffsetX(0);
    setOffsetY(0);
    setMessage("Ajusta el encuadre y aplica el recorte antes de guardar.");
  }

  async function applyCrop() {
    if (!source || !inputRef.current) return;
    try {
      const image = await loadImage(source);
      const size = Number(outputSize);
      const canvas = document.createElement("canvas");
      canvas.width = size;
      canvas.height = size;
      const context = canvas.getContext("2d");
      if (!context) throw new Error("El navegador no permite preparar el recorte.");

      const scale = Math.max(size / image.naturalWidth, size / image.naturalHeight) * zoom;
      const width = image.naturalWidth * scale;
      const height = image.naturalHeight * scale;
      const x = (size - width) / 2 + (offsetX / 100) * size;
      const y = (size - height) / 2 + (offsetY / 100) * size;
      context.fillStyle = "#f0eee8";
      context.fillRect(0, 0, size, size);
      context.drawImage(image, x, y, width, height);

      const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/jpeg", 0.9));
      if (!blob) throw new Error("No se pudo crear la foto optimizada.");
      const file = new File([blob], "miembro-bosich-legal.jpg", { type: "image/jpeg" });
      const transfer = new DataTransfer();
      transfer.items.add(file);
      inputRef.current.files = transfer.files;
      setMessage(`Recorte listo: JPG cuadrado de ${size} x ${size} px.`);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "No se pudo preparar la foto.");
    }
  }

  return (
    <div className="member-photo-field">
      <label htmlFor={id}>{label}</label>
      <input
        ref={inputRef}
        id={id}
        name="photo"
        type="file"
        accept="image/jpeg,image/png,image/webp"
        onChange={onSelect}
      />
      <p className="admin-help">JPG, PNG o WebP. MÃ¡ximo 4 MB. La foto se guardarÃ¡ cuadrada y optimizada.</p>
      {source ? (
        <div className="member-cropper">
          <div className="member-crop-preview" aria-label="Vista previa del recorte">
            <img
              src={source}
              alt="Vista previa del recorte"
              style={{ transform: `translate(${offsetX}%, ${offsetY}%) scale(${zoom})` }}
            />
          </div>
          <div className="member-crop-controls">
            <label>
              Zoom
              <input type="range" min="1" max="2.4" step="0.05" value={zoom} onChange={(event) => setZoom(Number(event.target.value))} />
            </label>
            <label>
              Horizontal
              <input type="range" min="-40" max="40" step="1" value={offsetX} onChange={(event) => setOffsetX(Number(event.target.value))} />
            </label>
            <label>
              Vertical
              <input type="range" min="-40" max="40" step="1" value={offsetY} onChange={(event) => setOffsetY(Number(event.target.value))} />
            </label>
            <label>
              TamaÃ±o final
              <select value={outputSize} onChange={(event) => setOutputSize(event.target.value)}>
                <option value="800">800 x 800 px</option>
                <option value="1000">1000 x 1000 px</option>
                <option value="1200">1200 x 1200 px</option>
              </select>
            </label>
            <button className="button button-small" type="button" onClick={applyCrop}>
              <Crop size={16} /> Aplicar recorte
            </button>
          </div>
        </div>
      ) : (
        <p className="admin-help"><ImageUp size={16} /> Sube una imagen y aparecerÃ¡ la herramienta de encuadre.</p>
      )}
      {message ? <p className="admin-help">{message}</p> : null}
    </div>
  );
}
