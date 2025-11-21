import React from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export default function GoogleLoginButton() {
  const handleGoogle = async () => {
    try {
      const { error } = await fetch("/api/auth/google-redirect", { method: "POST" }).then((r) => r.json());
      // In this project we keep the redirect client-side. If server returns an error, show it.
      if (error) throw new Error(error.message || "Failed to start Google OAuth");
    } catch (err) {
      toast.error("Failed to start Google sign-in");
      console.error("Google redirect error:", err);
      // Fallback: directly call Supabase client-side
      const redirectTo = "http://127.0.0.1:8082/auth/callback";
      const { error: oauthErr } = await (await import("@/integrations/supabase/client")).supabase.auth.signInWithOAuth({ provider: "google", options: { redirectTo } });
      if (oauthErr) {
        toast.error("Failed to start Google sign-in");
        console.error(oauthErr);
      }
    }
  };

  return (
    <Button onClick={handleGoogle} variant={"default"}>
      Sign in with Google
    </Button>
  );
}
import React from "react";
import { GoogleLogin, CredentialResponse } from "@react-oauth/google";
import jwt_decode from "jwt-decode";
import { useAuth } from "@/contexts/AuthContext";

type GoogleIdToken = {
  sub: string;
  name?: string;
  email?: string;
  picture?: string;
};

export default function GoogleLoginButton() {
  const { setUser } = useAuth();

  const handleSuccess = (credentialResponse: CredentialResponse) => {
    const idToken = credentialResponse.credential;
    if (!idToken) {
      console.error("Google: no credential returned");
      return;
    }

    try {
      const decoded = jwt_decode<GoogleIdToken>(idToken);
      const user = {
        sub: decoded.sub,
        name: decoded.name,
        email: decoded.email,
        picture: decoded.picture,
      };

      // Update app state with public profile
      setUser(user);

      // TODO: Send idToken to your backend to verify and create a secure session
      // await fetch('/api/auth/google', { method: 'POST', body: JSON.stringify({ idToken }) })
    } catch (err) {
      console.error("Failed to decode ID token", err);
    }
  };

  const handleError = () => {
    console.error("Google login failed or cancelled");
  };

  return <GoogleLogin onSuccess={handleSuccess} onError={handleError} />;
}
