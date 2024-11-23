import { Auth } from "@supabase/auth-ui-react";
import { ThemeSupa } from "@supabase/auth-ui-shared";
import { useNavigate, Link } from "react-router-dom";
import React, { useEffect } from "react";
import { supabase } from '@/lib/supabase';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import loginImage from '../assets/BeBalancedBg.jpg';

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
      <div className="flex">
        <Card className="w-full max-w-lg border-opacity-0">
          <CardHeader>
            <CardTitle className="text-2xl text-center">   <img 
            src={loginImage} 
            alt="BeBalanced" 
            className="h-140 w-140 object-cover rounded-full pr-3" 
          />
       <h2 className="text-1xl font-bold text-center font-poppins pb-3 pt-3">Your Life, Your Balance.<br/> Track Habits That Matter.</h2></CardTitle>
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