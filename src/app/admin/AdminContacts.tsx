import type { ContactSubmission, ContactStatus } from "@/types/contact";
import { updateContactStatusAction } from "./contact-actions";

const statusLabels: Record<ContactStatus, string> = {
  new: "Nuevo",
  reviewed: "Revisado",
  contacted: "Contactado",
  archived: "Archivado",
};

function dateLabel(value: string) {
  return new Intl.DateTimeFormat("es-CL", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

export function AdminContacts({ submissions }: { submissions: ContactSubmission[] }) {
  return (
    <section className="admin-contacts">
      <div className="section-heading compact">
        <div>
          <p className="eyebrow">Casos recibidos</p>
          <h2>Solicitudes de contacto</h2>
        </div>
      </div>

      {submissions.length === 0 ? (
        <div className="admin-warning">Todavía no hay casos recibidos desde el formulario.</div>
      ) : (
        <div className="contact-submission-list">
          {submissions.map((submission) => (
            <article className="contact-submission-card" key={submission.id}>
              <div>
                <div className="submission-meta">
                  <span className={`status-pill status-${submission.status}`}>{statusLabels[submission.status]}</span>
                  <span>{dateLabel(submission.created_at)}</span>
                  <span>{submission.email_sent ? "Correo enviado" : "Correo pendiente"}</span>
                </div>
                <h3>{submission.subject}</h3>
                <p><strong>{submission.name}</strong> · <a href={`mailto:${submission.email}`}>{submission.email}</a>{submission.phone ? ` · ${submission.phone}` : ""}</p>
                <p className="submission-message">{submission.message}</p>
                {submission.email_error ? <p className="admin-error">Correo: {submission.email_error}</p> : null}
              </div>
              <form className="submission-actions" action={updateContactStatusAction}>
                <input type="hidden" name="id" value={submission.id} />
                <button name="status" value="reviewed" type="submit">Revisado</button>
                <button name="status" value="contacted" type="submit">Contactado</button>
                <button name="status" value="archived" type="submit">Archivar</button>
              </form>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
