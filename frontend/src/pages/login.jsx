import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useGoogleLogin } from "@react-oauth/google";
import { z } from "zod";
import { useAuth } from "@/context/auth-context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Eye, Loader2, LogIn } from "lucide-react";

const schema = z.object({
  email: z.string().trim().email("Enter a valid email"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export default function LoginPage() {
  const navigate = useNavigate();
  const { user, login, googleLogin } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);

  const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID || "";

  let googleLoginAction = () => {
    toast.error("Google login is not configured. Set VITE_GOOGLE_CLIENT_ID in your environment.");
  };

  if (googleClientId) {
    googleLoginAction = useGoogleLogin({
      onSuccess: async (tokenResponse) => {
        if (!tokenResponse.access_token) {
          return toast.error("Google login failed");
        }

        setBusy(true);
        try {
          await googleLogin(tokenResponse.access_token);
          toast.success("Signed in with Google");
          navigate("/home");
        } catch (error) {
          toast.error(error instanceof Error ? error.message : "Google login failed");
        } finally {
          setBusy(false);
        }
      },
      onError: () => {
        toast.error("Google login failed");
      },
      flow: "implicit",
      scope: "openid profile email",
    });
  }

  useEffect(() => {
    if (user) {
      navigate("/home");
    }
  }, [user, navigate]);

  async function handleLogin(event) {
    event.preventDefault();
    const parsed = schema.safeParse({ email, password });
    if (!parsed.success) {
      return toast.error(parsed.error.issues[0].message);
    }

    setBusy(true);
    try {
      await login(parsed.data.email, parsed.data.password);
      toast.success("Welcome back");
      navigate("/home");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Login failed");
    } finally {
      setBusy(false);
    }
  }

  function handleGoogleLogin() {
    googleLoginAction();
  }

  return (
    <div className="min-h-screen relative overflow-hidden flex items-center justify-center px-4 py-10">
      <div className="absolute inset-0 -z-10 bg-hero opacity-90" />
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top,rgba(255,255,255,0.4),transparent_60%)]" />

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <div className="bg-card-gradient rounded-2xl shadow-elegant border border-border p-8 backdrop-blur-xl">
          <div className="flex items-center gap-3 mb-6">
            <div className="h-11 w-11 rounded-xl bg-hero grid place-items-center text-primary-foreground shadow-soft">
              <Eye className="h-6 w-6" />
            </div>
            <div>
              <h1 className="font-display text-2xl font-bold">Welcome to OCTVision</h1>
              <p className="text-xs text-muted-foreground">AI-assisted retinal OCT classification</p>
            </div>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
              />
            </div>
            <div>
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
              />
            </div>
            <Button
              type="submit"
              className="w-full bg-hero text-primary-foreground hover:opacity-90"
              disabled={busy}
            >
              {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : "Sign in"}
            </Button>
          </form>

          <div className="mt-4 flex items-center gap-3">
            <span className="h-px flex-1 bg-border" />
            <span className="text-xs uppercase tracking-[0.3em] text-muted-foreground">or</span>
            <span className="h-px flex-1 bg-border" />
          </div>

          <Button variant="outline" className="mt-4 w-full" onClick={handleGoogleLogin}>
            <LogIn className="h-4 w-4" />
            Continue with Google
          </Button>

          <p className="mt-6 text-center text-sm text-muted-foreground">
            New here?{" "}
            <Link to="/signup" className="text-primary font-medium hover:underline">
              Create an account
            </Link>
          </p>
          <p className="mt-2 text-center text-xs text-muted-foreground">
            <Link to="/about" className="hover:underline">
              About OCTVision
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
}
