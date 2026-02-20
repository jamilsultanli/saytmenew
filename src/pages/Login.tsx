import { useEffect } from "react";
import { Auth } from "@supabase/auth-ui-react";
import { ThemeSupa } from "@supabase/auth-ui-shared";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { Navbar } from "@/components/Navbar";
import { SEO } from "@/components/SEO";
import { useTheme } from "@/components/theme-provider";
import { useSiteSettings } from "@/hooks/use-site-settings";

const Login = () => {
  const navigate = useNavigate();
  const { theme } = useTheme();

  // Handle Session
  useEffect(() => {
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) navigate("/admin");
    };
    checkSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (session) navigate("/admin");
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  // Use the new centralized hook
  const { data: settings } = useSiteSettings();

  const siteName = settings?.site_name || "Admin Panel";

  return (
    <div className="min-h-screen bg-background transition-colors duration-300">
      <SEO title="Giriş" />
      <Navbar />
      <div className="container mx-auto max-w-md pt-32 px-4">
        <div className="glass-panel p-8 rounded-2xl border border-border shadow-2xl">
          <h1 className="text-2xl font-bold text-foreground mb-2 text-center">{siteName}</h1>
          <p className="text-center text-muted-foreground mb-6 text-sm">İdarəetmə panelinə daxil olun</p>
          
          <Auth
            supabaseClient={supabase}
            appearance={{
              theme: ThemeSupa,
              variables: {
                default: {
                  colors: {
                    brand: 'hsl(var(--primary))',
                    brandAccent: 'hsl(var(--primary))',
                    inputBackground: 'transparent',
                    inputText: 'inherit',
                  },
                  borderWidths: {
                    buttonBorderWidth: '1px',
                    inputBorderWidth: '1px',
                  },
                  radii: {
                    borderRadiusButton: '0.75rem',
                    buttonBorderRadius: '0.75rem',
                    inputBorderRadius: '0.5rem',
                  },
                },
              },
              className: {
                container: 'text-foreground',
                label: 'text-foreground/70',
                button: 'bg-primary text-primary-foreground hover:bg-primary/90',
                input: 'bg-background border-input text-foreground',
              }
            }}
            providers={[]}
            theme={theme === 'dark' ? 'dark' : 'light'}
          />
        </div>
      </div>
    </div>
  );
};

export default Login;