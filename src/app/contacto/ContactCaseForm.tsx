"use client";

import Script from "next/script";
import { useActionState, useEffect, useMemo } from "react";
import { Send } from "lucide-react";
import { submitContactCase } from "./actions";

declare global {
  interface Window {
    dataLayer?: Array<Record<string, unknown>>;
  }
}

const subjects = [
  "Derecho penal",
  "Derecho civil",
  "Derecho corporativo",
  "Derecho laboral",
  "Derecho de familia",
  "Derecho administrativo",
  "Derecho ambiental",
  "Derechos humanos",
  "Derecho digital y protección de datos",
  "Inscripción de software",
  "Otra materia",
];

export function ContactCaseForm({ turnstileSiteKey }: { turnstileSiteKey?: string }) {
  const [state, action, pending] = useActionState(submitContactCase, null);
  const startedAt = useMemo(() => Date.now(), []);
  const siteKey = turnstileSiteKey || process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;

  useEffect(() => {
    if (!state?.ok) return;

    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push({
      event: "generate_lead",
      lead_type: "contact_form",
    });
  }, [state]);

  return (
    <form className="contact-form" action={action}>
      <div className="section-heading compact">
        <div>
          <p className="eyebrow">Formulario seguro</p>
          <h2>Cuéntanos tu caso</h2>
        </div>
      </div>

      <input type="hidden" name="startedAt" value={startedAt} />
      <input type="hidden" name="sourcePath" value="/contacto" />
      <label className="sr-only" aria-hidden="true">
        Empresa
        <input name="company" tabIndex={-1} autoComplete="off" />
      </label>

      <div className="form-grid">
        <label>
          Nombre completo
          <input name="name" autoComplete="name" required maxLength={90} />
        </label>
        <label>
          Correo electrónico
          <input name="email" type="email" autoComplete="email" required maxLength={160} />
        </label>
        <label>
          Teléfono
          <input name="phone" type="tel" autoComplete="tel" maxLength={40} />
        </label>
        <label>
          Materia
          <select name="subject" defaultValue="" required>
            <option value="" disabled>Selecciona una materia</option>
            {subjects.map((subject) => (
              <option key={subject} value={subject}>{subject}</option>
            ))}
          </select>
        </label>
      </div>

      <label>
        Breve descripción del caso
        <textarea
          name="message"
          rows={7}
          required
          minLength={20}
          maxLength={2800}
          placeholder="Incluye ciudad, materia y cualquier plazo o audiencia relevante. No ingreses claves ni información bancaria."
        />
      </label>

      <label className="checkbox-label contact-consent">
        <input name="privacy" type="checkbox" required />
        Autorizo a Bosich Legal a contactarme por este caso. Este formulario no constituye patrocinio ni representación legal hasta que exista una aceptación expresa del estudio.
      </label>

      {siteKey ? (
        <>
          <Script src="https://challenges.cloudflare.com/turnstile/v0/api.js" async defer />
          <div className="cf-turnstile" data-sitekey={siteKey} />
        </>
      ) : null}

      <button className="button" type="submit" disabled={pending}>
        <Send size={18} />
        {pending ? "Enviando..." : "Enviar caso"}
      </button>

      {state?.message ? (
        <p className={state.ok ? "admin-success" : "admin-error"}>{state.message}</p>
      ) : null}
    </form>
  );
}
