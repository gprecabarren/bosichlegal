import { NextRequest, NextResponse } from "next/server";
import { isAdminAuthenticated } from "@/lib/auth";
import { uploadPropertyImage } from "@/lib/properties";

export async function POST(request: NextRequest) {
  if (!(await isAdminAuthenticated())) return NextResponse.json({ error: "Inicia sesión nuevamente para cargar imágenes." }, { status: 401 });
  const origin = request.headers.get("origin");
  if (!origin || origin !== request.nextUrl.origin) return NextResponse.json({ error: "Origen no autorizado." }, { status: 403 });
  if (Number(request.headers.get("content-length") || 0) > 4 * 1024 * 1024 + 10000) return NextResponse.json({ error: "La imagen supera los 4 MB." }, { status: 413 });
  try {
    const formData = await request.formData();
    const file = formData.get("image");
    if (!(file instanceof File)) return NextResponse.json({ error: "Selecciona una imagen." }, { status: 400 });
    const url = await uploadPropertyImage(file);
    return NextResponse.json({ url }, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "No se pudo cargar la imagen." }, { status: 400 });
  }
}
