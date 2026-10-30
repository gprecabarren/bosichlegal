"use client";

import Link from "next/link";
import { startTransition, useActionState, useState } from "react";
import { Archive, Check, Phone, RotateCcw, Trash2 } from "lucide-react";
import type { ContactSubmission, ContactStatus } from "@/types/contact";
import { deleteContactAction, permanentlyDeleteContactAction, restoreContactAction, updateContactStatusAction } from "./contact-actions";

const statusLabels: Record<ContactStatus, string> = {
  new: "Nuevo",
  reviewed: "Revisado",
  contacted: "Contactado",
  archived: "Archivado",
};

type ContactPage = { submissions: ContactSubmission[]; total: number; page: number; pageSize: number };

function dateLabel(value: string) {
  return new Intl.DateTimeFormat("es-CL", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "America/Santiago",
  }).format(new Date(value));
}

function StatusMessage({ state }: { state: { ok: boolean; message: string } | null }) {
  return state?.message ? <p role={state.ok ? "status" : "alert"} className={state.ok ? "admin-success" : "admin-error"}>{state.message}</p> : null;
}

function ContactActions({ submission }: { submission: ContactSubmission }) {
  const [state, action, updating] = useActionState(updateContactStatusAction, null);
  const [trashState, trashAction, trashing] = useActionState(deleteContactAction, null);
  const pending = updating || trashing;
  return (
    <div className="submission-actions">
      <form action={action}>
        <input type="hidden" name="id" value={submission.id} />
        <button name="status" value="reviewed" type="submit" disabled={pending || submission.status === "reviewed"}><Check size={16} />Revisado</button>
        <button name="status" value="contacted" type="submit" disabled={pending || submission.status === "contacted"}><Phone size={16} />Contactado</button>
        <button name="status" value="archived" type="submit" disabled={pending || submission.status === "archived"}><Archive size={16} />Archivar</button>
        <button name="status" value="new" type="submit" disabled={pending || submission.status === "new"}><RotateCcw size={16} />Marcar nuevo</button>
        <StatusMessage state={state} />
      </form>
      <form action={trashAction}>
        <input type="hidden" name="id" value={submission.id} />
        <button className="danger-button" type="submit" disabled={pending}><Trash2 size={16} />{trashing ? "Enviando..." : "Enviar a papelera"}</button>
        <StatusMessage state={trashState} />
      </form>
    </div>
  );
}

function ContactTrashActions({ id }: { id: string }) {
  const [restoreState, restoreAction, restoring] = useActionState(restoreContactAction, null);
  const [deleteState, deleteAction, deleting] = useActionState(permanentlyDeleteContactAction, null);
  const [confirmation, setConfirmation] = useState("");
  const pending = restoring || deleting;
  return (
    <div className="admin-trash-actions">
      <form action={restoreAction}>
        <input name="id" type="hidden" value={id} />
        <button type="submit" disabled={pending}><RotateCcw size={16} />Restaurar</button>
        <StatusMessage state={restoreState} />
      </form>
      <details className="admin-delete-confirmation">
        <summary>Eliminar definitivamente</summary>
        <form onSubmit={(event) => {
          event.preventDefault();
          const data = new FormData(event.currentTarget);
          startTransition(() => deleteAction(data));
        }}>
          <input name="id" type="hidden" value={id} />
          <label>Confirmación: escribe ELIMINAR
            <input name="confirmation" value={confirmation} onChange={(event) => setConfirmation(event.target.value)} autoComplete="off" spellCheck={false} required />
          </label>
          <button className="danger-button" type="submit" disabled={pending || confirmation !== "ELIMINAR"}>
            <Trash2 size={16} />{deleting ? "Eliminando..." : "Eliminar definitivamente"}
          </button>
          <StatusMessage state={deleteState} />
        </form>
      </details>
    </div>
  );
}

function ContactCard({ submission }: { submission: ContactSubmission }) {
  return (
    <article className={submission.deleted_at ? "contact-submission-card admin-trash-row" : "contact-submission-card"}>
      <div>
        <div className="submission-meta">
          <span className={`status-pill status-${submission.status}`}>{statusLabels[submission.status]}</span>
          <span>{dateLabel(submission.created_at)}</span>
          <span>{submission.email_sent ? "Correo enviado" : "Correo pendiente"}</span>
          {submission.deleted_at ? <span>En papelera: {dateLabel(submission.deleted_at)}</span> : null}
        </div>
        <h3>{submission.subject}</h3>
        <p><strong>{submission.name}</strong> · <a href={`mailto:${submission.email}`}>{submission.email}</a>{submission.phone ? ` · ${submission.phone}` : ""}</p>
        <p className="submission-message">{submission.message}</p>
        {!submission.email_sent && submission.email_error ? <p className="admin-error">No se pudo enviar la notificación por correo. La solicitud está guardada.</p> : null}
      </div>
      {submission.deleted_at ? <ContactTrashActions id={submission.id} /> : <ContactActions submission={submission} />}
    </article>
  );
}

function Pagination({ current, otherPage, trash = false }: { current: ContactPage; otherPage: number; trash?: boolean }) {
  const pages = Math.max(1, Math.ceil(current.total / current.pageSize));
  if (pages <= 1) return null;
  const href = (page: number) => `/admin/solicitudes-contacto?page=${trash ? otherPage : page}&trashPage=${trash ? page : otherPage}${trash ? "#contact-trash" : ""}`;
  return <nav className="admin-pagination" aria-label={trash ? "Páginas de la papelera" : "Páginas de solicitudes"}>
    {current.page > 1 ? <Link href={href(current.page - 1)}>Anterior</Link> : null}
    <span>Página {current.page} de {pages}</span>
    {current.page < pages ? <Link href={href(current.page + 1)}>Siguiente</Link> : null}
  </nav>;
}

export function AdminContacts({ active, trash }: { active: ContactPage; trash: ContactPage }) {
  return (
    <section className="admin-contacts">
      <div className="section-heading compact">
        <div><p className="eyebrow">Casos recibidos</p><h2>Solicitudes de contacto ({active.total})</h2></div>
      </div>
      {active.total === 0 ? <div className="empty-state">No hay solicitudes fuera de la papelera.</div> : null}
      <div className="contact-submission-list">
        {active.submissions.map((submission) => <ContactCard key={submission.id} submission={submission} />)}
      </div>
      <Pagination current={active} otherPage={trash.page} />
      <section className="admin-trash contact-trash" id="contact-trash" aria-labelledby="contact-trash-heading">
        <h3 id="contact-trash-heading">Papelera ({trash.total})</h3>
        {trash.total === 0 ? <p>La papelera está vacía.</p> : null}
        <div className="contact-submission-list">
          {trash.submissions.map((submission) => <ContactCard key={submission.id} submission={submission} />)}
        </div>
        <Pagination current={trash} otherPage={active.page} trash />
      </section>
    </section>
  );
}
