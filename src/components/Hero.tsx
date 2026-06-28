import type { ReactNode } from "react";

type HeroProps = {
  eyebrow?: string;
  title: string;
  text?: string;
  image: string;
  actions?: ReactNode;
};

export function Hero({ eyebrow, title, text, image, actions }: HeroProps) {
  return (
    <section className="hero" style={{ backgroundImage: `linear-gradient(90deg, rgba(7,18,31,.88), rgba(7,18,31,.48)), url(${image})` }}>
      <div className="hero-content">
        {eyebrow ? <p className="eyebrow">{eyebrow}</p> : null}
        <h1>{title}</h1>
        {text ? <p>{text}</p> : null}
        {actions ? <div className="hero-actions">{actions}</div> : null}
      </div>
    </section>
  );
}
