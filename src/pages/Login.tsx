import { Auth } from "@supabase/auth-ui-react";
import { ThemeSupa } from "@supabase/auth-ui-shared";
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const Login = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Handle the initial auth state
    supabase.auth.onAuthStateChange((event, session) => {
      if (session) {
        navigate("/");
      }
    });

    // Handle the hash fragment from email links
    const hashFragment = window.location.hash;
    if (hashFragment) {
      const { access_token, refresh_token } = Object.fromEntries(
        hashFragment
          .substring(1)
          .split("&")
          .map(param => param.split("="))
      );

      if (access_token) {
        supabase.auth.setSession({
          access_token,
          refresh_token: refresh_token || "",
        });
      }
    }
  }, [navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl text-center">Welcome to HabitLoom</CardTitle>
        </CardHeader>
        <CardContent>
          <Auth
            supabaseClient={supabase}
            appearance={{ theme: ThemeSupa }}
            theme="light"
            providers={[]}
          />
        </CardContent>
      </Card>
    </div>
  );
};

export default Login;