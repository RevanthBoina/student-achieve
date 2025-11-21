import { useEffect, useState, useCallback } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useAuth } from "@/contexts/AuthContext";
import { profileSchema, ProfileFormData } from "@/schemas/validation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from "@/components/ui/form";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { getOwnProfile, updateProfilePrivacy } from "@/services/profileService";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { BackButton } from "@/components/BackButton";

export default function Profile() {
  const { user, logout } = useAuth();
  const [isPublic, setIsPublic] = useState(true);
  const [loading, setLoading] = useState(true);
  const [pendingRecordsCount, setPendingRecordsCount] = useState(0);

  const form = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      bio: "",
      school: "",
    },
  });

  const loadProfile = useCallback(async () => {
    if (!user) return;

    const profile = await getOwnProfile();
    if (profile) {
      form.reset({
        bio: profile.bio || "",
        school: profile.school || "",
      });
      setIsPublic(profile.is_public);
    }
    setLoading(false);
  }, [user, form]);

  const loadPendingRecordsCount = useCallback(async () => {
    if (!user) return;

    const { count } = await supabase
      .from("records")
      .select("*", { count: "exact", head: true })
      .eq("status", "pending");

    setPendingRecordsCount(count || 0);
  }, [user]);

  useEffect(() => {
    loadProfile();
    loadPendingRecordsCount();
  }, [user, loadProfile, loadPendingRecordsCount]);

  // Real-time subscription for admin notifications
  useEffect(() => {
    if (!user) return;

    const channel = supabase
      .channel("admin-notifications")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "records",
          filter: "status=eq.pending",
        },
        () => {
          loadPendingRecordsCount();
          toast.info("New record awaiting verification");
        },
      )
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "record_breaks",
          filter: "status=eq.pending",
        },
        () => {
          toast.info("New break attempt awaiting verification");
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);
  

  const uploadAvatar = async (file: File): Promise<string | null> => {
    if (!user) return null;

    try {
      const fileExt = file.name.split(".").pop();
      const fileName = `${user.id}/avatar.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from("avatars")
        .upload(fileName, file, { upsert: true });

      if (uploadError) throw uploadError;

      const {
        data: { publicUrl },
      } = supabase.storage.from("avatars").getPublicUrl(fileName);

      return publicUrl;
    } catch (error) {
      console.error("Avatar upload error:", error);
      return null;
    }
  };

  const onSubmit = async (data: ProfileFormData) => {
    if (!user) return;

    try {

      let avatarUrl = null;
      if (data.profilePhoto) {
        avatarUrl = await uploadAvatar(data.profilePhoto);
      }

      const updates: Record<string, unknown> = {
        bio: data.bio,
        school: data.school,
      };

      if (avatarUrl) {
        updates.avatar_url = avatarUrl;
      }

      const { error } = await supabase
        .from("profiles")
        .update(updates)
        .eq("id", user.id);

      if (error) throw error;

      toast.success("Profile updated successfully!");
      await loadProfile();
    } catch (error) {
      console.error("Profile update error:", error);
      toast.error("Failed to update profile");
    }
  };

  const handlePrivacyToggle = async (checked: boolean) => {
    const success = await updateProfilePrivacy(checked);
    if (success) {
      setIsPublic(checked);
      toast.success(`Profile is now ${checked ? "public" : "private"}`);
    } else {
      toast.error("Failed to update privacy settings");
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="container max-w-2xl mx-auto py-8">
        <BackButton />
        <div className="flex justify-between items-center mb-6 mt-4">
          <div>
            <h1 className="text-3xl font-bold">Profile Settings</h1>
            <p className="text-muted-foreground">{user?.email}</p>
          </div>
          <Button variant="outline" onClick={logout}>
            Logout
          </Button>
        </div>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Privacy Settings</CardTitle>
            <CardDescription>
              Control who can see your profile information
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <Label htmlFor="public-profile" className="flex flex-col gap-1">
                <span className="font-medium">Public Profile</span>
                <span className="text-sm text-muted-foreground">
                  Make your profile visible to everyone
                </span>
              </Label>
              <Switch
                id="public-profile"
                checked={isPublic}
                onCheckedChange={handlePrivacyToggle}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Edit Profile</CardTitle>
            <CardDescription>
              Update your public profile information
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-6"
              >
                <FormField
                  control={form.control}
                  name="profilePhoto"
                  render={({ field: { value, onChange, ...field } }) => (
                    <FormItem>
                      <FormLabel>Profile Photo</FormLabel>
                      <FormControl>
                        <Input
                          type="file"
                          accept="image/jpeg,image/png,image/webp"
                          onChange={(e) => onChange(e.target.files?.[0])}
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>
                        Upload a profile picture (max 5MB)
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="school"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>School/University</FormLabel>
                      <FormControl>
                        <Input placeholder="Harvard University" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="bio"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Bio</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Tell us about yourself..."
                          className="min-h-[100px]"
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>
                        Brief description about yourself (max 500 characters)
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button
                  type="submit"
                  disabled={form.formState.isSubmitting}
                  className="w-full"
                >
                  {form.formState.isSubmitting ? "Saving..." : "Save Changes"}
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
