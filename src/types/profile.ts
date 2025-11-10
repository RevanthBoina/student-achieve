// Profile type definitions for safe data access

// Public profile fields that can be shown to anyone
export interface PublicProfile {
  id: string;
  full_name: string | null;
  avatar_url: string | null;
  bio: string | null;
  is_verified: boolean;
  followers_count: number;
  following_count: number;
  records_count: number;
  broken_records_count: number;
  created_at: string;
}

// Private profile fields only visible to profile owner and admins
export interface PrivateProfile extends PublicProfile {
  email: string;
  school_email: string | null;
  school: string | null;
  education_info: string | null;
  school_email_verified: boolean;
  id_card_verified: boolean;
  id_card_url: string | null;
  is_public: boolean;
  updated_at: string;
}
