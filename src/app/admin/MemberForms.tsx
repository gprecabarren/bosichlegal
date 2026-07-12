"use client";

import { useActionState } from "react";
import { ArrowDown, ArrowUp, GripVertical, Trash2, Upload } from "lucide-react";
import type { TeamMember } from "@/types/member";
import { createMemberAction, deleteMemberAction, moveMemberDownAction, moveMemberUpAction, updateMemberAction } from "./member-actions";
import { MemberPhotoField } from "./MemberPhotoField";

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
      <label className="checkbox-label">
        <input name="is_active" type="checkbox" defaultChecked />
        Visible en el sitio
      </label>
      <MemberPhotoField label="Foto" />
      <button className="button" type="submit" disabled={pending}>
        <Upload size={18} />
        {pending ? "Creando..." : "Crear miembro"}
      </button>
      <StatusMessage state={state} />
    </form>
  );
}

export function MemberOrderControls({ position, total }: { position: number; total: number }) {
  return (
    <div className="member-order-controls" aria-label="Orden del miembro">
      <span className="member-position">
        <GripVertical size={16} />
        {position} de {total}
      </span>
      <button formAction={moveMemberUpAction} type="submit" disabled={position <= 1} title="Subir miembro">
        <ArrowUp size={16} />
        Subir
      </button>
      <button formAction={moveMemberDownAction} type="submit" disabled={position >= total} title="Bajar miembro">
        <ArrowDown size={16} />
        Bajar
      </button>
    </div>
  );
}

export function MemberEditForm({ member, position, total }: { member: TeamMember; position: number; total: number }) {
  const [state, action, pending] = useActionState(updateMemberAction, null);

  return (
    <form className="member-form" action={action}>
      <input name="id" type="hidden" value={member.id} />
      <input name="sort_order" type="hidden" value={member.sort_order} />
      <MemberOrderControls position={position} total={total} />
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
      <label className="checkbox-label">
        <input name="is_active" type="checkbox" defaultChecked={member.is_active} />
        Visible en el sitio
      </label>
      <MemberPhotoField label="Reemplazar foto" />
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
