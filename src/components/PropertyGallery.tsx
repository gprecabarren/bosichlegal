"use client";

import { useState } from "react";
import { ChevronLeft, ChevronRight, Expand } from "lucide-react";
import type { PropertyImage } from "@/types/property";

export function PropertyGallery({ images, title }: { images: PropertyImage[]; title: string }) {
  const [index, setIndex] = useState(0);
  const image = images[index];
  if (!image) return null;
  return <div className="property-gallery">
    <figure>
      <div className="property-main-photo"><img src={image.url} alt={image.alt || title} fetchPriority="high" />
        {images.length > 1 ? <><button type="button" className="gallery-previous" title="Foto anterior" aria-label="Foto anterior" onClick={() => setIndex((index + images.length - 1) % images.length)}><ChevronLeft /></button><button type="button" className="gallery-next" title="Foto siguiente" aria-label="Foto siguiente" onClick={() => setIndex((index + 1) % images.length)}><ChevronRight /></button></> : null}
        <a className="gallery-expand" href={image.url} target="_blank" rel="noreferrer" aria-label="Abrir fotografía completa" title="Abrir fotografía completa"><Expand size={18} /></a>
        <span className="gallery-count" aria-live="polite">{index + 1} / {images.length}</span>
      </div>
      {image.caption ? <figcaption>{image.caption}</figcaption> : null}
    </figure>
    {images.length > 1 ? <div className="property-thumbnails" aria-label="Fotografías de la propiedad">{images.map((photo, position) => <button key={photo.url} type="button" aria-label={`Ver fotografía ${position + 1}`} aria-pressed={index === position} onClick={() => setIndex(position)}><img src={photo.url} alt={photo.alt || `Fotografía ${position + 1}`} loading="lazy" /></button>)}</div> : null}
  </div>;
}
