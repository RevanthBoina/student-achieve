import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export default function AuthCallback() {
  const navigate = useNavigate();

  useEffect(() => {
    const handleAuth = async () => {
      try {
        // Exchange code for a session using the current URL
        const { data, error } = await supabase.auth.exchangeCodeForSession(window.location.href);
        if (error) {
          console.error("exchangeCodeForSession error:", error);
          toast.error("Authentication failed");
          navigate("/login");
          return;
        }

        // Successfully authenticated - redirect to homepage
        toast.success("Successfully signed in with Google!");
        navigate("/");
      } catch (err) {
        console.error("Auth callback handling error:", err);
        toast.error("Authentication error");
        navigate("/login");
      }
    };

    handleAuth();
  }, [navigate]);

  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="text-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto" />
        <p className="mt-4">Finalizing sign-in…</p>
      </div>
    </div>
  );
}
