import { useQuery } from "@tanstack/react-query";
import { nakamaClient } from "@/api/nakama";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft, Trophy, RefreshCcw } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "@/store/authStore";

export default function Leaderboard() {
  const navigate = useNavigate();
  const { session } = useAuthStore();

  const { data: records, isLoading, error, refetch } = useQuery({
    queryKey: ["leaderboard", "wins"],
    queryFn: async () => {
      if (!session) throw new Error("No session");
      const result = await nakamaClient.listLeaderboardRecords(
        session,
        "wins",
        undefined,
        10
      );
      return result.records || [];
    },
    enabled: !!session,
  });

  return (
    <div className="container mx-auto max-w-2xl px-4 py-8 space-y-6">
      <div className="flex items-center justify-between">
        <Button variant="ghost" size="sm" onClick={() => navigate("/lobby")} className="gap-2">
          <ArrowLeft className="w-4 h-4" />
          Back to Lobby
        </Button>
        <Button 
          variant="outline" 
          size="icon" 
          onClick={() => refetch()} 
          disabled={isLoading}
        >
          <RefreshCcw className={`w-4 h-4 ${isLoading ? "animate-spin" : ""}`} />
        </Button>
      </div>

      <header className="text-center space-y-2 pb-4">
        <div className="inline-flex p-3 rounded-full bg-yellow-500/10 mb-2">
          <Trophy className="w-8 h-8 text-yellow-500" />
        </div>
        <h1 className="text-3xl font-bold tracking-tight">Global Rankings</h1>
        <p className="text-muted-foreground">Top players by total wins</p>
      </header>

      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-8 text-center text-muted-foreground animate-pulse font-medium">
              Fetching latest rankings...
            </div>
          ) : error ? (
            <div className="p-8 text-center text-rose-500 font-medium">
              Failed to load leaderboard. Please try again.
            </div>
          ) : records?.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground">
              No records found yet. Be the first to win!
            </div>
          ) : (
            <div className="divide-y divide-border">
              {records?.map((record: any, index: number) => (
                <div key={record.owner_id} className="flex items-center justify-between p-4 hover:bg-muted/50 transition-colors">
                  <div className="flex items-center gap-4">
                    <div className="w-8 text-center font-bold text-muted-foreground/60">
                      {index + 1}
                    </div>
                    <div>
                      <div className="font-bold">{record.username || "Anonymous"}</div>
                      <div className="text-[10px] text-muted-foreground font-mono opacity-50 uppercase tracking-tighter">
                        ID: {record.owner_id.slice(0, 8)}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-2xl font-black text-primary">{record.score}</span>
                    <span className="text-[10px] font-bold text-muted-foreground uppercase pt-1">Wins</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
      
      <div className="text-center pt-4">
        <p className="text-[10px] text-muted-foreground bg-muted inline-block px-2 py-1 rounded uppercase tracking-widest font-bold">
          Updated in real-time
        </p>
      </div>
    </div>
  );
}
