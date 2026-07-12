import "server-only";

import { NextRequest, NextResponse } from "next/server";
import { isAdminAuthenticated } from "@/lib/auth";
import { uploadNewsImage } from "@/lib/news";

function hasSameOrigin(request: NextRequest) {
  const origin = request.headers.get("origin");
  if (origin) return origin === request.nextUrl.origin;

  const referer = request.headers.get("referer");
  return Boolean(referer?.startsWith(`${request.nextUrl.origin}/`));
}

export async function uploadAdminNewsImage(request: NextRequest) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json(
      { error: "Tu sesión venció. Cierra sesión e ingresa nuevamente." },
      { status: 401 }
    );
  }

  if (!hasSameOrigin(request)) {
    return NextResponse.json({ error: "Solicitud bloqueada por seguridad." }, { status: 403 });
  }

  try {
    const formData = await request.formData();
    const file = formData.get("image");
    if (!(file instanceof File)) {
      return NextResponse.json({ error: "Selecciona una imagen válida." }, { status: 400 });
    }

    const url = await uploadNewsImage(file);
    return NextResponse.json({ url });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "No se pudo subir la imagen." },
      { status: 400 }
    );
  }
}
