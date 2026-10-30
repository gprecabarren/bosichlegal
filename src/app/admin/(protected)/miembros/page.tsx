import { DeleteMemberButton, MemberEditForm, MemberTrashActions, NewMemberForm } from "../../MemberForms";
import { getSiteContent } from "@/lib/content";
import { listMembers, listTrashedMembers } from "@/lib/members";
import type { TeamMember } from "@/types/member";
import { hasSupabaseAdminConfig } from "@/lib/supabase";

export const dynamic = "force-dynamic";

export default async function MembersPage() {
  const content = await getSiteContent();
  const supabaseReady = hasSupabaseAdminConfig();
  let members: TeamMember[] = [];
  let trash: TeamMember[] = [];
  let loadError = false;
  try {
    [members, trash] = await Promise.all([listMembers(content, true), listTrashedMembers()]);
  } catch {
    loadError = true;
  }

  return (
    <section className="admin-members">
      <div className="section-heading compact">
        <div>
          <p className="eyebrow">Equipo legal</p>
          <h2>Miembros</h2>
        </div>
      </div>
      {loadError ? <p className="admin-warning" role="alert">No se pudieron cargar los miembros y su papelera. Revisa la conexión y la migración de la papelera antes de continuar.</p> : null}
      {!supabaseReady ? (
        <div className="admin-warning">
          Supabase todavía no está conectado. El sitio muestra los miembros base, pero el CRUD con fotos se activa al configurar las variables del proyecto Bosich Legal.
        </div>
      ) : (
        <NewMemberForm />
      )}
      {!loadError && members.length === 0 ? <p className="empty-state">No hay miembros fuera de la papelera.</p> : null}
      <div className="member-list">
        {members.map((member, index) => (
          <article className="member-admin-card" key={member.id}>
            {supabaseReady ? (
              <MemberEditForm member={member} position={index + 1} total={members.length} />
            ) : (
              <div className="member-form">
                <h3>{member.name}</h3>
                <p className="role">{member.role}</p>
                <p>{member.focus}</p>
              </div>
            )}
            {!member.id.startsWith("fallback-") ? <DeleteMemberButton memberId={member.id} /> : null}
          </article>
        ))}
      </div>
      <section className="admin-trash member-trash" aria-labelledby="member-trash-heading">
        <h3 id="member-trash-heading">Papelera ({loadError ? "sin datos" : trash.length})</h3>
        {!loadError && trash.length === 0 ? <p>La papelera está vacía.</p> : null}
        <div className="member-list">
          {trash.map((member) => (
            <article className="member-admin-card admin-trash-row" key={member.id}>
              <div className="member-form">
                <div className="member-photo">{member.photo_url ? <img src={member.photo_url} alt={member.name} /> : <span>Sin foto</span>}</div>
                <h4>{member.name}</h4>
                <p className="role">{member.role}</p>
                <p>{member.focus}</p>
                <p>En papelera desde {new Intl.DateTimeFormat("es-CL", { dateStyle: "medium", timeStyle: "short", timeZone: "America/Santiago" }).format(new Date(member.deleted_at!))}</p>
              </div>
              <MemberTrashActions memberId={member.id} />
            </article>
          ))}
        </div>
      </section>
    </section>
  );
}
