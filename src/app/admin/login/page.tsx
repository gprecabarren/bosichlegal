import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { isAdminAuthenticated } from "@/lib/auth";
import { LoginForm } from "./LoginForm";

export const metadata: Metadata = {
  title: "Login admin",
  robots: { index: false, follow: false },
};

export default async function LoginPage() {
  if (await isAdminAuthenticated()) {
    redirect("/admin/crear-blog");
  }

  return (
    <section className="login-page">
      <div>
        <p className="eyebrow">Panel privado</p>
        <h1>Acceso administrador</h1>
        <p>Ingresa con tus credenciales para administrar los miembros del equipo legal.</p>
      </div>
      <LoginForm />
    </section>
  );
}
