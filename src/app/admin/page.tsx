import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { LogOut } from "lucide-react";
import { isAdminAuthenticated } from "@/lib/auth";
import { getSiteContent } from "@/lib/content";
import { listContactSubmissions } from "@/lib/contact-submissions";
import { listMembers } from "@/lib/members";
import { listNewsPosts } from "@/lib/news";
import { hasSupabaseAdminConfig } from "@/lib/supabase";
import { AdminContacts } from "./AdminContacts";
import { AdminForm } from "./AdminForm";
import { AdminNews } from "./AdminNews";
import { AdminTabs } from "./AdminTabs";
import { DeleteMemberButton, MemberEditForm, NewMemberForm } from "./MemberForms";
import { logoutAction } from "./actions";

export const metadata: Metadata = {
  title: "Admin",
  robots: { index: false, follow: false },
};

export default async function AdminPage() {
  if (!(await isAdminAuthenticated())) {
    redirect("/admin/login");
  }

  const content = await getSiteContent();
  const members = await listMembers(content, true);
  const contactSubmissions = await listContactSubmissions();
  const newsPosts = await listNewsPosts({ includeDrafts: true });
  const supabaseReady = hasSupabaseAdminConfig();

  const membersPanel = (
    <section className="admin-members">
      <div className="section-heading compact">
        <div>
          <p className="eyebrow">Equipo legal</p>
          <h2>Miembros</h2>
        </div>
      </div>
      {!supabaseReady ? (
        <div className="admin-warning">
          Supabase todavía no está conectado. El sitio muestra los miembros base, pero el CRUD con fotos se activa cuando se configuren las variables del proyecto Bosich Legal.
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

  return (
    <section className="admin-page">
      <div className="admin-heading">
        <div>
          <p className="eyebrow">Panel privado</p>
          <h1>Administrar Bosich Legal</h1>
          <p>Edita campos principales, noticias, solicitudes y miembros del equipo legal.</p>
        </div>
        <form action={logoutAction}>
          <button className="logout-button" type="submit">
            <LogOut size={16} />
            Salir
          </button>
        </form>
      </div>
      <AdminTabs
        members={membersPanel}
        news={<AdminNews posts={newsPosts} supabaseReady={supabaseReady} />}
        contacts={<AdminContacts submissions={contactSubmissions} />}
        content={<AdminForm content={content} />}
      />
    </section>
  );
}
