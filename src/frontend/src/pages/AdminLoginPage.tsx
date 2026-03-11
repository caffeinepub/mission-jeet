import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createActorWithConfig } from "@/config";
import { Link, useNavigate } from "@tanstack/react-router";
import { Eye, EyeOff, Loader2, Lock, Shield } from "lucide-react";
import { motion } from "motion/react";
import { type FormEvent, useState } from "react";
import { toast } from "sonner";

export default function AdminLoginPage() {
  const navigate = useNavigate();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    let lastError = "";
    // Retry up to 3 times to handle transient connection issues
    for (let attempt = 0; attempt < 3; attempt++) {
      try {
        const actor = await createActorWithConfig();
        const result = await (actor.adminLogin(username, password) as Promise<
          { ok: string } | { err: string }
        >);

        if ("ok" in result) {
          localStorage.setItem("mj_admin_token", result.ok);
          toast.success("Welcome back, Admin!");
          navigate({ to: "/admin" });
          return;
          // biome-ignore lint/style/noUselessElse: intentional
        } else {
          // Credential error — no point retrying
          setError(result.err || "Invalid credentials");
          toast.error("Login failed");
          setIsLoading(false);
          return;
        }
      } catch (err) {
        lastError = err instanceof Error ? err.message : "Connection error";
        if (attempt < 2) {
          await new Promise((r) => setTimeout(r, 1000 * (attempt + 1)));
        }
      }
    }

    setError("Connection error. Please try again.");
    toast.error(lastError || "Connection error");
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <header className="border-b border-border py-4 px-6">
        <Link
          to="/"
          className="inline-flex items-center gap-2 group"
          data-ocid="nav.link"
        >
          <img
            src="/assets/generated/mission-jeet-logo-transparent.dim_200x200.png"
            alt="Mission Jeet"
            className="h-8 w-8"
          />
          <span className="font-display font-extrabold text-lg">
            <span className="text-primary">Mission</span>{" "}
            <span className="text-foreground">Jeet</span>
          </span>
        </Link>
      </header>

      <div className="flex-1 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md"
        >
          <div className="relative bg-card rounded-2xl border border-border p-8 shadow-[0_0_50px_oklch(0.46_0.22_27/0.08)]">
            <div className="absolute top-0 left-8 right-8 h-0.5 bg-gradient-to-r from-transparent via-primary to-transparent rounded-full" />

            <div className="flex justify-center mb-6">
              <div className="w-16 h-16 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center">
                <Shield className="h-8 w-8 text-primary" />
              </div>
            </div>

            <div className="text-center mb-8">
              <h1 className="font-display font-black text-2xl mb-1">
                Admin Access
              </h1>
              <p className="text-sm text-muted-foreground">
                Restricted area — authorized personnel only
              </p>
            </div>

            <form
              onSubmit={handleSubmit}
              data-ocid="admin.login_form"
              className="space-y-4"
            >
              <div className="space-y-1.5">
                <Label htmlFor="username" className="text-sm font-medium">
                  Username
                </Label>
                <Input
                  id="username"
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Enter username"
                  required
                  autoComplete="username"
                  disabled={isLoading}
                  className="bg-secondary/50 border-border focus:border-primary"
                  data-ocid="admin.input"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="password" className="text-sm font-medium">
                  Password
                </Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter password"
                    required
                    autoComplete="current-password"
                    disabled={isLoading}
                    className="bg-secondary/50 border-border focus:border-primary pr-10"
                    data-ocid="admin.input"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                    tabIndex={-1}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>

              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -5 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex items-center gap-2 p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-sm text-destructive"
                  data-ocid="admin.error_state"
                >
                  <Lock className="h-4 w-4 flex-shrink-0" />
                  {error}
                </motion.div>
              )}

              <Button
                type="submit"
                disabled={isLoading || !username || !password}
                className="w-full bg-primary hover:bg-primary/90 text-white font-display font-bold mt-2"
                data-ocid="admin.submit_button"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Connecting...
                  </>
                ) : (
                  <>
                    <Lock className="mr-2 h-4 w-4" />
                    Sign In
                  </>
                )}
              </Button>
            </form>
          </div>

          <p className="text-center text-xs text-muted-foreground mt-4">
            <Link
              to="/"
              className="hover:text-foreground transition-colors"
              data-ocid="nav.link"
            >
              Return to Mission Jeet
            </Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
}
