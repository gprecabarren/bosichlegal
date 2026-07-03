"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth";
import { updateContactStatus } from "@/lib/contact-submissions";
import type { ContactStatus } from "@/types/contact";

const allowedStatuses: ContactStatus[] = ["new", "reviewed", "contacted", "archived"];

export async function updateContactStatusAction(formData: FormData) {
  await requireAdmin();

  const id = String(formData.get("id") || "");
  const status = String(formData.get("status") || "") as ContactStatus;

  if (!id || !allowedStatuses.includes(status)) {
    throw new Error("Estado inválido.");
  }

  await updateContactStatus(id, status);
  revalidatePath("/admin");
}
