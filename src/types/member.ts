export type TeamMember = {
  id: string;
  name: string;
  role: string;
  focus: string;
  photo_url: string | null;
  sort_order: number;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
};

