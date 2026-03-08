import { Button } from "@/components/ui/button";
import { useActor } from "@/hooks/useActor";
import { useLogoUrl } from "@/hooks/useQueries";
import { Link, useNavigate } from "@tanstack/react-router";
import { LogOut, Shield } from "lucide-react";
import { toast } from "sonner";

interface NavbarProps {
  showAdminLogout?: boolean;
}

export default function Navbar({ showAdminLogout = false }: NavbarProps) {
  const { data: logoUrl } = useLogoUrl();
  const { actor } = useActor();
  const navigate = useNavigate();

  const handleLogout = async () => {
    const token = localStorage.getItem("mj_admin_token");
    if (token && actor) {
      try {
        await actor.adminLogout(token);
      } catch {
        // silently ignore
      }
    }
    localStorage.removeItem("mj_admin_token");
    toast.success("Logged out successfully");
    navigate({ to: "/" });
  };

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-[oklch(0.07_0_0/0.95)] backdrop-blur-md">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        {/* Logo */}
        <Link
          to="/"
          className="flex items-center gap-3 group"
          data-ocid="nav.link"
        >
          {logoUrl && logoUrl.trim() !== "" ? (
            <img
              src={logoUrl}
              alt="Mission Jeet"
              className="h-10 w-auto object-contain"
            />
          ) : (
            <div className="flex items-center gap-2">
              <img
                src="/assets/generated/mission-jeet-logo-transparent.dim_200x200.png"
                alt="Mission Jeet Logo"
                className="h-10 w-10 object-contain"
              />
              <span className="font-display font-extrabold text-xl tracking-tight">
                <span className="text-primary">Mission</span>{" "}
                <span className="text-foreground">Jeet</span>
              </span>
            </div>
          )}
        </Link>

        {/* Nav Actions */}
        <nav className="flex items-center gap-2">
          {showAdminLogout ? (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleLogout}
              className="text-muted-foreground hover:text-foreground gap-2"
              data-ocid="admin.logout_button"
            >
              <LogOut className="h-4 w-4" />
              <span className="hidden sm:inline">Logout</span>
            </Button>
          ) : (
            <Link to="/admin/login" data-ocid="nav.link">
              <Button
                variant="ghost"
                size="sm"
                className="text-muted-foreground hover:text-foreground gap-2"
              >
                <Shield className="h-4 w-4" />
                <span className="hidden sm:inline">Admin</span>
              </Button>
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
}
