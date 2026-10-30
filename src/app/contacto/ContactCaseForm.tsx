"use client";

import Script from "next/script";
import { useActionState, useEffect, useMemo } from "react";
import { Send } from "lucide-react";
import { submitContactCase } from "./actions";
import type { PageFieldValue } from "@/types/site";

declare global {
  interface Window {
    dataLayer?: Array<Record<string, unknown>>;
  }
}

export function ContactCaseForm({ turnstileSiteKey, copy }: { turnstileSiteKey?: string; copy: Record<string, PageFieldValue> }) {
  const text = (key: string) => typeof copy[key] === "string" ? copy[key] as string : "";
  const subjects = Array.isArray(copy.subjects) ? copy.subjects : [];
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
          <p className="eyebrow">{text("formEyebrow")}</p>
          <h2>{text("formTitle")}</h2>
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
          {text("nameLabel")}
          <input name="name" autoComplete="name" required maxLength={90} />
        </label>
        <label>
          {text("emailLabel")}
          <input name="email" type="email" autoComplete="email" required maxLength={160} />
        </label>
        <label>
          {text("phoneLabel")}
          <input name="phone" type="tel" autoComplete="tel" maxLength={40} />
        </label>
        <label>
          {text("subjectLabel")}
          <select name="subject" defaultValue="" required>
            <option value="" disabled>{text("subjectPlaceholder")}</option>
            {subjects.map((subject) => (
              <option key={subject} value={subject}>{subject}</option>
            ))}
          </select>
        </label>
      </div>

      <label>
        {text("messageLabel")}
        <textarea
          name="message"
          rows={7}
          required
          minLength={20}
          maxLength={2800}
          placeholder={text("messagePlaceholder")}
        />
      </label>

      <label className="checkbox-label contact-consent">
        <input name="privacy" type="checkbox" required />
        {text("consentLabel")}
      </label>

      {siteKey ? (
        <>
          <Script src="https://challenges.cloudflare.com/turnstile/v0/api.js" async defer />
          <div className="cf-turnstile" data-sitekey={siteKey} />
        </>
      ) : null}

      <button className="button" type="submit" disabled={pending}>
        <Send size={18} />
        {pending ? text("pendingButton") : text("submitButton")}
      </button>

      {state?.message ? (
        <p className={state.ok ? "admin-success" : "admin-error"}>{state.message}</p>
      ) : null}
    </form>
  );
}
