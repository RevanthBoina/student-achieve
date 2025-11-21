import { supabase } from "@/integrations/supabase/client";
import type { PublicProfile, PrivateProfile } from "@/types/profile";

// Column selections for different access levels
// SECURITY: Limited columns to prevent exposure of sensitive data (email, school_email, id_card_url)
const PUBLIC_PROFILE_COLUMNS = `
  id,
  full_name,
  avatar_url,
  bio,
  school,
  is_verified,
  followers_count,
  following_count,
  records_count,
  broken_records_count,
  created_at
`;

const PRIVATE_PROFILE_COLUMNS = `
  id,
  full_name,
  avatar_url,
  bio,
  is_verified,
  followers_count,
  following_count,
  records_count,
  broken_records_count,
  created_at,
  email,
  school_email,
  school,
  education_info,
  school_email_verified,
  id_card_verified,
  id_card_url,
  is_public,
  updated_at
`;

/**
 * Get public profile data (safe for anyone to view)
 */
export async function getPublicProfile(
  userId: string,
): Promise<PublicProfile | null> {
  const { data, error } = await supabase
    .from("profiles")
    .select(PUBLIC_PROFILE_COLUMNS)
    .eq("id", userId)
    .eq("is_public", true)
    .single();

  if (error) {
    console.error("Error fetching public profile:", error);
    return null;
  }

  return data as PublicProfile;
}

/**
 * Get own complete profile (includes sensitive data)
 */
export async function getOwnProfile(): Promise<PrivateProfile | null> {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const { data, error } = await supabase
    .from("profiles")
    .select(PRIVATE_PROFILE_COLUMNS)
    .eq("id", user.id)
    .single();

  if (error) {
    console.error("Error fetching own profile:", error);
    return null;
  }

  return data as PrivateProfile;
}

/**
 * Update profile privacy setting
 */
export async function updateProfilePrivacy(
  isPublic: boolean,
): Promise<boolean> {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return false;

  const { error } = await supabase
    .from("profiles")
    .update({ is_public: isPublic })
    .eq("id", user.id);

  if (error) {
    console.error("Error updating profile privacy:", error);
    return false;
  }

  return true;
}

/**
 * Search public profiles (returns only public fields)
 */
export async function searchPublicProfiles(
  query: string,
): Promise<PublicProfile[]> {
  const { data, error } = await supabase
    .from("profiles")
    .select(PUBLIC_PROFILE_COLUMNS)
    .eq("is_public", true)
    .or(`full_name.ilike.%${query}%,bio.ilike.%${query}%`)
    .limit(20);

  if (error) {
    console.error("Error searching profiles:", error);
    return [];
  }

  return (data || []) as PublicProfile[];
}
