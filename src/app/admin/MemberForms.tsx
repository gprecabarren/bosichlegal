"use client";

import { useActionState } from "react";
import { Trash2, Upload } from "lucide-react";
import type { TeamMember } from "@/types/member";
import { createMemberAction, deleteMemberAction, updateMemberAction } from "./member-actions";

function StatusMessage({ state }: { state: { ok: boolean; message: string } | null }) {
  return state?.message ? <p className={state.ok ? "admin-success" : "admin-error"}>{state.message}</p> : null;
}

export function NewMemberForm() {
  const [state, action, pending] = useActionState(createMemberAction, null);

  return (
    <form className="member-form member-form-new" action={action}>
      <h3>Nuevo miembro</h3>
      <label>
        Nombre
        <input name="name" required />
      </label>
      <label>
        Cargo o formación
        <input name="role" required />
      </label>
      <label>
        Especialidad
        <textarea name="focus" rows={3} required />
      </label>
      <label>
        Orden
        <input name="sort_order" type="number" defaultValue={100} min={1} />
      </label>
      <label className="checkbox-label">
        <input name="is_active" type="checkbox" defaultChecked />
        Visible en el sitio
      </label>
      <label>
        Foto
        <input name="photo" type="file" accept="image/*" />
      </label>
      <button className="button" type="submit" disabled={pending}>
        <Upload size={18} />
        {pending ? "Creando..." : "Crear miembro"}
      </button>
      <StatusMessage state={state} />
    </form>
  );
}

export function MemberEditForm({ member }: { member: TeamMember }) {
  const [state, action, pending] = useActionState(updateMemberAction, null);

  return (
    <form className="member-form" action={action}>
      <input name="id" type="hidden" value={member.id} />
      <div className="member-photo">
        {member.photo_url ? <img src={member.photo_url} alt={member.name} /> : <span>Sin foto</span>}
      </div>
      <label>
        Nombre
        <input name="name" defaultValue={member.name} required />
      </label>
      <label>
        Cargo o formación
        <input name="role" defaultValue={member.role} required />
      </label>
      <label>
        Especialidad
        <textarea name="focus" defaultValue={member.focus} rows={3} required />
      </label>
      <label>
        Orden
        <input name="sort_order" type="number" defaultValue={member.sort_order} min={1} />
      </label>
      <label className="checkbox-label">
        <input name="is_active" type="checkbox" defaultChecked={member.is_active} />
        Visible en el sitio
      </label>
      <label>
        Reemplazar foto
        <input name="photo" type="file" accept="image/*" />
      </label>
      <button className="button" type="submit" disabled={pending}>
        {pending ? "Guardando..." : "Guardar miembro"}
      </button>
      <StatusMessage state={state} />
    </form>
  );
}

export function DeleteMemberButton({ memberId }: { memberId: string }) {
  return (
    <form action={deleteMemberAction}>
      <input name="id" type="hidden" value={memberId} />
      <button className="danger-button" type="submit">
        <Trash2 size={16} />
        Borrar
      </button>
    </form>
  );
}
