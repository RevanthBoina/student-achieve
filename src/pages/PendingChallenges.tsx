import { useState, useEffect } from "react";
import { Navigation } from "@/components/Navigation";
import { BackButton } from "@/components/BackButton";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Clock, Search, Bell, BellOff } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

export default function PendingChallenges() {
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [refreshKey, setRefreshKey] = useState(0);

  // Real-time subscription for new break attempts
  useEffect(() => {
    const channel = supabase
      .channel("record-breaks-changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "record_breaks",
        },
        () => {
          setRefreshKey((prev) => prev + 1);
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      <main className="container py-8">
        <BackButton />
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Pending Break Attempts</h1>
          <p className="text-muted-foreground">
            See all ongoing attempts to break existing records
          </p>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search records..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className="w-full sm:w-[200px]">
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              <SelectItem value="sports">Sports</SelectItem>
              <SelectItem value="academic">Academic</SelectItem>
              <SelectItem value="creative">Creative</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Pending Challenges List */}
        <div className="space-y-6">
          {/* Example grouped by record */}
          <Card>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <CardTitle className="text-xl mb-1">
                    Most Push-ups in 1 Minute
                  </CardTitle>
                  <CardDescription>
                    Current Record: 75 push-ups by John Doe
                  </CardDescription>
                </div>
                <Badge variant="outline" className="gap-1">
                  <Clock className="h-3 w-3" />3 attempts
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Challenge Attempt 1 */}
                <div className="flex items-center justify-between p-4 bg-secondary rounded-lg">
                  <div className="flex-1">
                    <p className="font-medium">Jane Smith</p>
                    <p className="text-sm text-muted-foreground">
                      Claimed: 82 push-ups
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Submitted 2 hours ago
                    </p>
                  </div>
                  <Button variant="outline" size="sm" className="gap-2">
                    <Bell className="h-4 w-4" />
                    Subscribe
                  </Button>
                </div>

                {/* Challenge Attempt 2 */}
                <div className="flex items-center justify-between p-4 bg-secondary rounded-lg">
                  <div className="flex-1">
                    <p className="font-medium">Mike Johnson</p>
                    <p className="text-sm text-muted-foreground">
                      Claimed: 78 push-ups
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Submitted 5 hours ago
                    </p>
                  </div>
                  <Button variant="outline" size="sm" className="gap-2">
                    <BellOff className="h-4 w-4" />
                    Subscribed
                  </Button>
                </div>

                {/* Challenge Attempt 3 */}
                <div className="flex items-center justify-between p-4 bg-secondary rounded-lg">
                  <div className="flex-1">
                    <p className="font-medium">Sarah Williams</p>
                    <p className="text-sm text-muted-foreground">
                      Claimed: 76 push-ups
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Submitted 1 day ago
                    </p>
                  </div>
                  <Button variant="outline" size="sm" className="gap-2">
                    <Bell className="h-4 w-4" />
                    Subscribe
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Empty state */}
          <Card className="border-dashed">
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Clock className="h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-muted-foreground text-center">
                No pending break attempts found
              </p>
              <p className="text-sm text-muted-foreground text-center mt-2">
                Check back later for new challenge submissions
              </p>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
