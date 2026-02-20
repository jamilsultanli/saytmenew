import { useEffect } from "react";
import { Auth } from "@supabase/auth-ui-react";
import { ThemeSupa } from "@supabase/auth-ui-shared";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { Navbar } from "@/components/Navbar";

const Login = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (session) {
        navigate("/admin");
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  return (
    <div className="min-h-screen bg-[#050505]">
      <Navbar />
      <div className="container mx-auto max-w-md pt-32 px-4">
        <div className="glass-panel p-8 rounded-2xl border border-white/10">
          <h1 className="text-2xl font-bold text-white mb-6 text-center">Admin Girişi</h1>
          <Auth
            supabaseClient={supabase}
            appearance={{
              theme: ThemeSupa,
              variables: {
                default: {
                  colors: {
                    brand: '#06b6d4',
                    brandAccent: '#0891b2',
                    inputText: 'white',
                    inputBackground: 'rgba(255,255,255,0.05)',
                  }
                }
              },
              className: {
                container: 'text-white',
                label: 'text-gray-400',
                button: 'bg-cyan-600 hover:bg-cyan-700 text-white rounded-full',
                input: 'rounded-xl border-white/10 bg-white/5',
              }
            }}
            providers={[]}
            theme="dark"
          />
        </div>
      </div>
    </div>
  );
};

export default Login;