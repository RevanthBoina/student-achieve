import { Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';

const Index = () => {
  const { user } = useAuth();

  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <div className="text-center space-y-6 max-w-2xl px-4">
        <h1 className="text-5xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
          Student Book of World Records
        </h1>
        <p className="text-xl text-muted-foreground">
          Showcase your achievements and break new records
        </p>
        
        {user ? (
          <div className="flex gap-4 justify-center">
            <Button asChild size="lg">
              <Link to="/create-record">Submit a Record</Link>
            </Button>
            <Button asChild variant="outline" size="lg">
              <Link to="/profile">My Profile</Link>
            </Button>
          </div>
        ) : (
          <div className="flex gap-4 justify-center">
            <Button asChild size="lg">
              <Link to="/signup">Get Started</Link>
            </Button>
            <Button asChild variant="outline" size="lg">
              <Link to="/login">Login</Link>
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Index;
