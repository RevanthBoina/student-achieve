import React from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export default function GoogleLoginButton() {
  const { signInWithGoogle } = useAuth();

  const handleGoogle = async () => {
    try {
      const { error } = await signInWithGoogle();
      if (error) throw error;
      toast.success("Redirecting to Google...");
    } catch (err) {
      toast.error("Failed to start Google sign-in");
      console.error("Google sign-in error:", err);
    }
  };

  return (
    <Button onClick={handleGoogle} variant="default">
      Sign in with Google
    </Button>
  );
}
