import { DeleteMemberButton, MemberEditForm, NewMemberForm } from "../../MemberForms";
import { getSiteContent } from "@/lib/content";
import { listMembers } from "@/lib/members";
import { hasSupabaseAdminConfig } from "@/lib/supabase";

export const dynamic = "force-dynamic";

export default async function MembersPage() {
  const content = await getSiteContent();
  const members = await listMembers(content, true);
  const supabaseReady = hasSupabaseAdminConfig();

  return (
    <section className="admin-members">
      <div className="section-heading compact">
        <div>
          <p className="eyebrow">Equipo legal</p>
          <h2>Miembros</h2>
        </div>
      </div>
      {!supabaseReady ? (
        <div className="admin-warning">
          Supabase todavía no está conectado. El sitio muestra los miembros base, pero el CRUD con fotos se activa al configurar las variables del proyecto Bosich Legal.
        </div>
      ) : (
        <NewMemberForm />
      )}
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
    </section>
  );
}
