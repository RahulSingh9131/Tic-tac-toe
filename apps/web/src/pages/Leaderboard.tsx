import { useLeaderboard } from "@/hooks/queries/useLeaderboard";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft, RefreshCcw, Swords, Skull, Flame } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { cn } from "@/lib/utils";

const TABS = [
  { id: "wins", label: "Wins", icon: Swords, color: "text-blue-500", bg: "bg-blue-500/10" },
  { id: "losses", label: "Losses", icon: Skull, color: "text-rose-500", bg: "bg-rose-500/10" },
  { id: "win_streaks", label: "Streaks", icon: Flame, color: "text-orange-500", bg: "bg-orange-500/10" },
];

export default function Leaderboard() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("wins");
  const { data: records, isLoading, error, refetch } = useLeaderboard(activeTab, 10);

  const currentTab = TABS.find(t => t.id === activeTab)!;

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

      <header className="text-center space-y-2 pb-2">
        <div className={cn("inline-flex p-3 rounded-full mb-2 transition-colors", currentTab.bg)}>
          <currentTab.icon className={cn("w-8 h-8", currentTab.color)} />
        </div>
        <h1 className="text-3xl font-bold tracking-tight">Global Rankings</h1>
        <p className="text-muted-foreground">Top players by {currentTab.label.toLowerCase()}</p>
      </header>

      {/* Custom Tabs */}
      <div className="flex p-1 bg-muted rounded-xl gap-1">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={cn(
              "flex-1 flex items-center justify-center gap-2 py-2 text-sm font-bold rounded-lg transition-all",
              activeTab === tab.id 
                ? "bg-background text-foreground shadow-sm" 
                : "text-muted-foreground hover:bg-background/50"
            )}
          >
            <tab.icon className={cn("w-4 h-4", activeTab === tab.id && tab.color)} />
            {tab.label}
          </button>
        ))}
      </div>

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
                    <span className="text-[10px] font-bold text-muted-foreground uppercase pt-1">{activeTab.replace("win_streaks", "Streak").replace("wins", "Wins").replace("losses", "Losses")}</span>
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
