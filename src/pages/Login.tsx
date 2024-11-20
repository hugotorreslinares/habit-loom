import { Auth } from "@supabase/auth-ui-react";
import { ThemeSupa } from "@supabase/auth-ui-shared";
import { useNavigate, Link } from "react-router-dom";
import { useEffect } from "react";
import { supabase } from '@/lib/supabase';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import loginImage from '../assets/happy.png';

const Login = () => {
  const navigate = useNavigate();

  useEffect(() => {
    supabase.auth.onAuthStateChange((event, session) => {
      if (session) {
        navigate("/");
      }
    });
  }, [navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="flex w-full max-w-4xl">
        <div className="hidden md:block w-1/2 h-1/2 items-center justify-center">
          <img 
            src={loginImage} 
            alt="Balanced" 
            className="h-140 w-140 object-cover rounded-full pr-3" 
          />
          <h1 className="text-4xl font-bold text-center font-poppins bg-clip-text text-transparent bg-gradient-to-r from-pink-500 to-violet-500">Balanced</h1>
          <h2 className="text-1xl font-bold text-center font-poppins pb-3">Your Life, Your Balance: Track Habits That Matter.</h2>
        </div>
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-2xl text-center">Welcome</CardTitle>
            <Link to={`/description`} className="calendar-icon hover:text-primary transition-colors" title="habit tracker"></Link>
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
    </div>
  );
};

export default Login;