import { NavLink } from "@/components/NavLink";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Home, Clock, PlusCircle, Trophy, User, LogOut } from "lucide-react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { useNavigate } from "react-router-dom";
import { toast } from "@/hooks/use-toast";

export function Navigation() {
  const { user, profile, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    toast({ title: "Logged out successfully" });
    navigate("/");
  };

  return (
    <nav className="sticky top-0 z-50 w-full bg-background border-b border-border shadow-sm">
      <div className="container flex h-16 items-center justify-between px-4">
        <div className="flex items-center gap-8">
          <NavLink
            to="/"
            className="flex items-center gap-2 text-xl font-bold font-poppins text-primary hover:text-primary-light transition-colors"
          >
            <Trophy className="h-7 w-7 text-gold" />
            <span className="hidden sm:inline">Student World Records</span>
          </NavLink>

          <div className="hidden md:flex items-center gap-1">
            <NavLink
              to="/"
              end
              className="relative flex items-center gap-2 px-3 py-2 text-sm font-medium text-muted-foreground rounded-md hover:text-foreground transition-colors"
              activeClassName="text-foreground after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-gold"
            >
              <Home className="h-4 w-4" />
              Home
            </NavLink>

            <NavLink
              to="/pending-challenges"
              className="relative flex items-center gap-2 px-3 py-2 text-sm font-medium text-muted-foreground rounded-md hover:text-foreground transition-colors"
              activeClassName="text-foreground after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-gold"
            >
              <Clock className="h-4 w-4" />
              Pending
            </NavLink>

            <NavLink
              to="/leaderboard"
              className="relative flex items-center gap-2 px-3 py-2 text-sm font-medium text-muted-foreground rounded-md hover:text-foreground transition-colors"
              activeClassName="text-foreground after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-gold"
            >
              <Trophy className="h-4 w-4" />
              Leaderboard
            </NavLink>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {user ? (
            <>
              <NavLink to="/create-break">
                <Button variant="gold" size="sm" className="gap-2">
                  <PlusCircle className="h-4 w-4" />
                  <span className="hidden sm:inline">Submit Record</span>
                </Button>
              </NavLink>

              <NavLink to={`/profile/${user.id}`}>
                <Button variant="ghost" size="sm" className="gap-2 hover:text-gold">
                  {profile?.avatar_url ? (
                    <Avatar className="h-5 w-5">
                      <AvatarImage src={profile.avatar_url} />
                      <AvatarFallback>{profile.full_name?.[0] ?? user.email?.[0]}</AvatarFallback>
                    </Avatar>
                  ) : (
                    <User className="h-4 w-4" />
                  )}
                  <span className="hidden sm:inline">{profile?.full_name ?? user.email}</span>
                </Button>
              </NavLink>

              <Button variant="ghost" size="sm" onClick={handleLogout} className="gap-2 hover:text-gold">
                <LogOut className="h-4 w-4" />
                <span className="hidden sm:inline">Logout</span>
              </Button>
            </>
          ) : (
            <>
              <NavLink to="/login">
                <Button variant="ghost" size="sm">
                  Login
                </Button>
              </NavLink>
              <NavLink to="/signup">
                <Button variant="gold" size="sm">
                  Sign Up
                </Button>
              </NavLink>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
