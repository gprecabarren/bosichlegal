"use client";

import { useActionState } from "react";
import { LogIn } from "lucide-react";
import { loginAction } from "./actions";

export function LoginForm() {
  const [state, action, pending] = useActionState(loginAction, null);

  return (
    <form className="login-form" action={action} autoComplete="on">
      <label htmlFor="admin-username">
        Usuario
        <input
          id="admin-username"
          name="username"
          type="text"
          autoComplete="username"
          autoCapitalize="none"
          autoCorrect="off"
          spellCheck={false}
          inputMode="text"
          required
        />
      </label>
      <label htmlFor="admin-password">
        Clave
        <input
          id="admin-password"
          name="password"
          type="password"
          autoComplete="current-password"
          required
        />
      </label>
      <button className="button" type="submit" disabled={pending}>
        <LogIn size={18} />
        {pending ? "Ingresando..." : "Ingresar"}
      </button>
      {state?.message ? <p className="admin-error">{state.message}</p> : null}
    </form>
  );
}
