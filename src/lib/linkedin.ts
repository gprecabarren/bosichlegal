export const DEFAULT_LINKEDIN_PROFILE_URL = "https://www.linkedin.com/in/nicolas-bosich/";

export function normalizeLinkedInProfileUrl(value: string | null | undefined) {
  const raw = String(value || "").trim();
  if (!raw) return "";

  const candidate = /^https?:\/\//i.test(raw) ? raw : `https://${raw}`;

  try {
    const url = new URL(candidate);
    const hostname = url.hostname.toLowerCase().replace(/^www\./, "");
    const match = url.pathname.match(/^\/in\/([^/?#]+)\/?$/i);

    if (hostname !== "linkedin.com" || !match) return "";

    return `https://www.linkedin.com/in/${match[1]}/`;
  } catch {
    return "";
  }
}

export function resolveLinkedInProfileUrl(value: string | null | undefined) {
  return normalizeLinkedInProfileUrl(value) || DEFAULT_LINKEDIN_PROFILE_URL;
}
