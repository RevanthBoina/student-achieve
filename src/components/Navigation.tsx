import { NavLink } from "@/components/NavLink";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Home, Clock, PlusCircle, Trophy, User, LogOut } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "@/hooks/use-toast";

export function Navigation() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    toast({ title: "Logged out successfully" });
    navigate("/");
  };

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center gap-6">
          <NavLink 
            to="/" 
            className="text-xl font-bold text-primary hover:text-primary-light transition-colors"
          >
            Student Records
          </NavLink>
          
          <div className="hidden md:flex items-center gap-1">
            <NavLink
              to="/"
              end
              className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-muted-foreground rounded-md hover:bg-secondary hover:text-foreground transition-colors"
              activeClassName="bg-secondary text-foreground"
            >
              <Home className="h-4 w-4" />
              Home
            </NavLink>
            
            <NavLink
              to="/pending-challenges"
              className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-muted-foreground rounded-md hover:bg-secondary hover:text-foreground transition-colors"
              activeClassName="bg-secondary text-foreground"
            >
              <Clock className="h-4 w-4" />
              Pending Challenges
            </NavLink>
            
            <NavLink
              to="/leaderboard"
              className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-muted-foreground rounded-md hover:bg-secondary hover:text-foreground transition-colors"
              activeClassName="bg-secondary text-foreground"
            >
              <Trophy className="h-4 w-4" />
              Leaderboard
            </NavLink>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {user ? (
            <>
              <NavLink to="/create-break">
                <Button variant="default" size="sm" className="gap-2">
                  <PlusCircle className="h-4 w-4" />
                  <span className="hidden sm:inline">Create/Break</span>
                </Button>
              </NavLink>
              
              <NavLink to={`/profile/${user.id}`}>
                <Button variant="ghost" size="sm" className="gap-2">
                  <User className="h-4 w-4" />
                  <span className="hidden sm:inline">Profile</span>
                </Button>
              </NavLink>
              
              <Button variant="ghost" size="sm" onClick={handleLogout} className="gap-2">
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
                <Button variant="default" size="sm">
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
