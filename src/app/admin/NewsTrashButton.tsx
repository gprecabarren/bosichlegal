"use client";

import { useActionState, useState } from "react";
import { RotateCcw, Trash2, X } from "lucide-react";
import type { NewsMutationState } from "@/types/news";
import { deleteNewsAction, permanentlyDeleteNewsAction, restoreNewsAction } from "./news-actions";

const actions = { trash: deleteNewsAction, restore: restoreNewsAction, delete: permanentlyDeleteNewsAction };
const labels = { trash: "Enviar a la papelera", restore: "Restaurar como borrador", delete: "Eliminar definitivamente" };

export function NewsTrashButton({ post, operation, onSuccess }: {
  post: { id: string; title: string };
  operation: keyof typeof actions;
  onSuccess: (message: string) => void;
}) {
  const [confirming, setConfirming] = useState(false);
  const [state, action, pending] = useActionState<NewsMutationState, FormData>(async (previous, formData) => {
    const result = await actions[operation](previous, formData);
    if (result?.ok) {
      setConfirming(false);
      onSuccess(result.message);
    }
    return result;
  }, null);

  return (
    <form action={action} className="news-trash-action" onSubmit={(event) => {
      if (operation === "trash" && !window.confirm(`¿Enviar "${post.title}" a la papelera? Dejará de mostrarse en el sitio y podrás restaurarla como borrador.`)) {
        event.preventDefault();
      }
    }}>
      <input type="hidden" name="id" value={post.id} />
      {operation === "delete" && !confirming ? (
        <button className="danger-button" type="button" title={`${labels[operation]}: ${post.title}`} disabled={pending} onClick={() => setConfirming(true)}>
          <Trash2 size={16} />{labels[operation]}
        </button>
      ) : (
        <>
          {operation === "delete" ? (
            <div className="news-trash-confirmation">
              <p>Eliminar definitivamente "{post.title}" no se puede deshacer. Las imágenes compartidas se conservarán.</p>
              <label className="checkbox-label">
                <input type="checkbox" name="confirm_permanent_delete" value="true" required disabled={pending} />
                Confirmo la eliminación definitiva de esta noticia.
              </label>
            </div>
          ) : null}
          <button className="danger-button" type="submit" title={`${labels[operation]}: ${post.title}`} disabled={pending}>
            {operation === "restore" ? <RotateCcw size={16} /> : <Trash2 size={16} />}
            {pending ? "Procesando..." : labels[operation]}
          </button>
          {operation === "delete" ? (
            <button className="button button-secondary" type="button" disabled={pending} onClick={() => setConfirming(false)}><X size={16} />Cancelar</button>
          ) : null}
        </>
      )}
      {state && !state.ok ? <p className="admin-error" role="alert">{state.message}</p> : null}
    </form>
  );
}
