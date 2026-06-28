"use client";

import { useActionState } from "react";
import { LogIn } from "lucide-react";
import { loginAction } from "./actions";

export function LoginForm() {
  const [state, action, pending] = useActionState(loginAction, null);

  return (
    <form className="login-form" action={action}>
      <label>
        Usuario
        <input name="username" autoComplete="username" required />
      </label>
      <label>
        Clave
        <input name="password" type="password" autoComplete="current-password" required />
      </label>
      <button className="button" type="submit" disabled={pending}>
        <LogIn size={18} />
        {pending ? "Ingresando..." : "Ingresar"}
      </button>
      {state?.message ? <p className="admin-error">{state.message}</p> : null}
    </form>
  );
}

