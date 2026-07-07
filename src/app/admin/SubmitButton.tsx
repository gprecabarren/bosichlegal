"use client";

import { Save } from "lucide-react";
import { useFormStatus } from "react-dom";

export function SubmitButton({ label = "Guardar cambios" }: { label?: string }) {
  const { pending } = useFormStatus();

  return (
    <button className="button admin-submit" type="submit" disabled={pending}>
      <Save size={18} />
      {pending ? "Guardando..." : label}
    </button>
  );
}
