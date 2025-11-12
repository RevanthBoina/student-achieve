import { useState } from "react";
import { Navigation } from "@/components/Navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Trophy, Medal, Award, TrendingUp } from "lucide-react";

type TimeFilter = "daily" | "weekly" | "monthly" | "all-time";

export default function Leaderboard() {
  const [timeFilter, setTimeFilter] = useState<TimeFilter>("all-time");

  // Mock data - replace with actual data from database
  const leaderboardData = [
    {
      rank: 1,
      userId: "1",
      name: "Sarah Johnson",
      avatar: null,
      totalReactions: 1247,
      recordsCount: 12,
      isVerified: true,
    },
    {
      rank: 2,
      userId: "2",
      name: "Michael Chen",
      avatar: null,
      totalReactions: 1089,
      recordsCount: 8,
      isVerified: true,
    },
    {
      rank: 3,
      userId: "3",
      name: "Emma Williams",
      avatar: null,
      totalReactions: 956,
      recordsCount: 15,
      isVerified: true,
    },
  ];

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Trophy className="h-6 w-6 text-yellow-500" />;
      case 2:
        return <Medal className="h-6 w-6 text-gray-400" />;
      case 3:
        return <Award className="h-6 w-6 text-amber-700" />;
      default:
        return <span className="text-2xl font-bold text-muted-foreground">#{rank}</span>;
    }
  };

  const getRankBadgeColor = (rank: number) => {
    switch (rank) {
      case 1:
        return "bg-gradient-to-r from-yellow-400 to-yellow-600 text-white border-0";
      case 2:
        return "bg-gradient-to-r from-gray-300 to-gray-500 text-white border-0";
      case 3:
        return "bg-gradient-to-r from-amber-600 to-amber-800 text-white border-0";
      default:
        return "";
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <main className="container py-8 max-w-4xl">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Leaderboard</h1>
          <p className="text-muted-foreground">
            Top students ranked by total reactions on verified records
          </p>
        </div>

        {/* Time Filter Tabs */}
        <Tabs value={timeFilter} onValueChange={(v) => setTimeFilter(v as TimeFilter)} className="mb-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="daily">Daily</TabsTrigger>
            <TabsTrigger value="weekly">Weekly</TabsTrigger>
            <TabsTrigger value="monthly">Monthly</TabsTrigger>
            <TabsTrigger value="all-time">All Time</TabsTrigger>
          </TabsList>
        </Tabs>

        {/* Top 3 Podium */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          {/* 2nd Place */}
          <div className="flex flex-col items-center pt-12">
            <div className="relative">
              <Avatar className="h-20 w-20 border-4 border-gray-300">
                <AvatarImage src={leaderboardData[1].avatar || undefined} />
                <AvatarFallback>{leaderboardData[1].name[0]}</AvatarFallback>
              </Avatar>
              <div className="absolute -top-2 -right-2 bg-gray-300 rounded-full p-2">
                <Medal className="h-4 w-4 text-white" />
              </div>
            </div>
            <p className="font-semibold mt-3 text-center">{leaderboardData[1].name}</p>
            <Badge variant="secondary" className="mt-2">
              {leaderboardData[1].totalReactions} reactions
            </Badge>
          </div>

          {/* 1st Place */}
          <div className="flex flex-col items-center">
            <div className="relative">
              <Avatar className="h-24 w-24 border-4 border-yellow-400">
                <AvatarImage src={leaderboardData[0].avatar || undefined} />
                <AvatarFallback>{leaderboardData[0].name[0]}</AvatarFallback>
              </Avatar>
              <div className="absolute -top-3 -right-3 bg-yellow-400 rounded-full p-2">
                <Trophy className="h-5 w-5 text-white" />
              </div>
            </div>
            <p className="font-bold text-lg mt-3 text-center">{leaderboardData[0].name}</p>
            <Badge className="mt-2 bg-gradient-to-r from-yellow-400 to-yellow-600 text-white border-0">
              {leaderboardData[0].totalReactions} reactions
            </Badge>
          </div>

          {/* 3rd Place */}
          <div className="flex flex-col items-center pt-12">
            <div className="relative">
              <Avatar className="h-20 w-20 border-4 border-amber-700">
                <AvatarImage src={leaderboardData[2].avatar || undefined} />
                <AvatarFallback>{leaderboardData[2].name[0]}</AvatarFallback>
              </Avatar>
              <div className="absolute -top-2 -right-2 bg-amber-700 rounded-full p-2">
                <Award className="h-4 w-4 text-white" />
              </div>
            </div>
            <p className="font-semibold mt-3 text-center">{leaderboardData[2].name}</p>
            <Badge variant="secondary" className="mt-2">
              {leaderboardData[2].totalReactions} reactions
            </Badge>
          </div>
        </div>

        {/* Full Leaderboard List */}
        <div className="space-y-3">
          {leaderboardData.map((entry) => (
            <Card key={entry.userId} className={entry.rank <= 3 ? "border-2" : ""}>
              <CardContent className="p-4">
                <div className="flex items-center gap-4">
                  {/* Rank */}
                  <div className="flex items-center justify-center w-12">
                    {getRankIcon(entry.rank)}
                  </div>

                  {/* Avatar */}
                  <Avatar className="h-12 w-12">
                    <AvatarImage src={entry.avatar || undefined} />
                    <AvatarFallback>{entry.name[0]}</AvatarFallback>
                  </Avatar>

                  {/* User Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="font-semibold truncate">{entry.name}</p>
                      {entry.isVerified && (
                        <Badge variant="outline" className="gap-1 text-success border-success">
                          <svg className="h-3 w-3 fill-current" viewBox="0 0 24 24">
                            <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          Verified
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {entry.recordsCount} {entry.recordsCount === 1 ? "record" : "records"}
                    </p>
                  </div>

                  {/* Stats */}
                  <div className="text-right">
                    <Badge 
                      className={entry.rank <= 3 ? getRankBadgeColor(entry.rank) : ""}
                      variant={entry.rank <= 3 ? "default" : "secondary"}
                    >
                      <TrendingUp className="h-3 w-3 mr-1" />
                      {entry.totalReactions}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}

          {/* More entries... */}
          <Card className="border-dashed">
            <CardContent className="p-8 text-center">
              <p className="text-muted-foreground">More rankings coming soon...</p>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
