import { NextRequest } from "next/server";
import { uploadAdminNewsImage } from "@/lib/admin-news-image-upload";

export async function POST(request: NextRequest) {
  return uploadAdminNewsImage(request);
}
