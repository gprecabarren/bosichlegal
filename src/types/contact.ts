export type ContactStatus = "new" | "reviewed" | "contacted" | "archived";

export type ContactSubmission = {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  subject: string;
  message: string;
  status: ContactStatus;
  deleted_at: string | null;
  source_path: string | null;
  ip_hash: string | null;
  user_agent: string | null;
  email_sent: boolean;
  email_error: string | null;
  created_at: string;
  updated_at: string;
};
