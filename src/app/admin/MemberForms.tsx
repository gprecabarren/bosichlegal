"use client";

import { startTransition, useActionState, useRef, useState } from "react";
import { ArrowDown, ArrowUp, GripVertical, RotateCcw, Trash2, Upload } from "lucide-react";
import type { TeamMember } from "@/types/member";
import { createMemberAction, deleteMemberAction, moveMemberDownAction, moveMemberUpAction, permanentlyDeleteMemberAction, restoreMemberAction, updateMemberAction } from "./member-actions";
import { MemberPhotoField } from "./MemberPhotoField";

function StatusMessage({ state }: { state: { ok: boolean; message: string } | null }) {
  return state?.message ? <p role={state.ok ? "status" : "alert"} className={state.ok ? "admin-success" : "admin-error"}>{state.message}</p> : null;
}

export function NewMemberForm() {
  const formRef = useRef<HTMLFormElement>(null);
  const [photoVersion, setPhotoVersion] = useState(0);
  const [state, action, pending] = useActionState(async (previous: unknown, data: FormData) => {
    const result = await createMemberAction(previous, data);
    if (result.ok) {
      formRef.current?.reset();
      setPhotoVersion((version) => version + 1);
    }
    return result;
  }, null);

  return (
    <form ref={formRef} className="member-form member-form-new" aria-busy={pending} onSubmit={(event) => {
      event.preventDefault();
      const data = new FormData(event.currentTarget);
      startTransition(() => action(data));
    }}>
      <h3>Nuevo miembro</h3>
      <label>
        Nombre
        <input name="name" maxLength={200} required />
      </label>
      <label>
        Cargo o formación
        <input name="role" maxLength={300} required />
      </label>
      <label>
        Especialidad
        <textarea name="focus" rows={3} maxLength={10000} required />
      </label>
      <label className="checkbox-label">
        <input name="is_active" type="checkbox" defaultChecked />
        Visible en el sitio
      </label>
      <MemberPhotoField key={photoVersion} label="Foto" />
      <button className="button" type="submit" disabled={pending}>
        <Upload size={18} />
        {pending ? "Creando..." : "Crear miembro"}
      </button>
      <StatusMessage state={state} />
    </form>
  );
}

export function MemberOrderControls({ memberId, position, total }: { memberId: string; position: number; total: number }) {
  const [upState, upAction, upPending] = useActionState(moveMemberUpAction, null);
  const [downState, downAction, downPending] = useActionState(moveMemberDownAction, null);
  const pending = upPending || downPending;
  return (
    <div>
      <form className="member-order-controls" aria-label="Orden del miembro" action={upAction}>
        <input name="id" type="hidden" value={memberId} />
        <span className="member-position"><GripVertical size={16} />{position} de {total}</span>
        <button type="submit" disabled={pending || position <= 1} title="Subir miembro" aria-label="Subir miembro">
          <ArrowUp size={16} />
        </button>
        <button formAction={downAction} type="submit" disabled={pending || position >= total} title="Bajar miembro" aria-label="Bajar miembro">
          <ArrowDown size={16} />
        </button>
      </form>
      <StatusMessage state={upState?.ok === false ? upState : downState?.ok === false ? downState : null} />
    </div>
  );
}

export function MemberEditForm({ member, position, total }: { member: TeamMember; position: number; total: number }) {
  const [state, action, pending] = useActionState(updateMemberAction, null);

  return (
    <>
      <MemberOrderControls memberId={member.id} position={position} total={total} />
      <form className="member-form" aria-busy={pending} onSubmit={(event) => {
        event.preventDefault();
        const data = new FormData(event.currentTarget);
        startTransition(() => action(data));
      }}>
        <input name="id" type="hidden" value={member.id} />
        <input name="sort_order" type="hidden" value={member.sort_order} />
        <div className="member-photo">
          {member.photo_url ? <img src={member.photo_url} alt={member.name} /> : <span>Sin foto</span>}
        </div>
        <label>
          Nombre
          <input name="name" defaultValue={member.name} maxLength={200} required />
        </label>
        <label>
          Cargo o formación
          <input name="role" defaultValue={member.role} maxLength={300} required />
        </label>
        <label>
          Especialidad
          <textarea name="focus" defaultValue={member.focus} rows={3} maxLength={10000} required />
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
    </>
  );
}

export function DeleteMemberButton({ memberId }: { memberId: string }) {
  const [state, action, pending] = useActionState(deleteMemberAction, null);
  return (
    <form action={action}>
      <input name="id" type="hidden" value={memberId} />
      <button className="danger-button" type="submit" disabled={pending}>
        <Trash2 size={16} />{pending ? "Enviando..." : "Enviar a papelera"}
      </button>
      <StatusMessage state={state} />
    </form>
  );
}

export function MemberTrashActions({ memberId }: { memberId: string }) {
  const [restoreState, restoreAction, restoring] = useActionState(restoreMemberAction, null);
  const [deleteState, deleteAction, deleting] = useActionState(permanentlyDeleteMemberAction, null);
  const [confirmation, setConfirmation] = useState("");
  const pending = restoring || deleting;
  return (
    <div className="admin-trash-actions">
      <form action={restoreAction}>
        <input name="id" type="hidden" value={memberId} />
        <button type="submit" disabled={pending}><RotateCcw size={16} />Restaurar como no visible</button>
        <StatusMessage state={restoreState} />
      </form>
      <details className="admin-delete-confirmation">
        <summary>Eliminar definitivamente</summary>
        <form onSubmit={(event) => {
          event.preventDefault();
          const data = new FormData(event.currentTarget);
          startTransition(() => deleteAction(data));
        }}>
          <input name="id" type="hidden" value={memberId} />
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
