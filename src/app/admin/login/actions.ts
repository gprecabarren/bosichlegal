"use server";

import { redirect } from "next/navigation";
import { createSession, verifyPassword } from "@/lib/auth";

export async function loginAction(_: unknown, formData: FormData) {
  const username = String(formData.get("username") || "").trim();
  const password = String(formData.get("password") || "");

  if (username !== process.env.ADMIN_USERNAME || !verifyPassword(password)) {
    return { ok: false, message: "Usuario o clave incorrectos." };
  }

  await createSession(username);
  redirect("/admin/crear-blog");
}
