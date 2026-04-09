import { useMatch } from "@/hooks/logic/MatchProvider";
import { useAuthStore } from "@/store/authStore";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import GameBoard from "@/components/GameBoard";
import { ArrowLeft, User, Swords } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";

export default function Game() {
  const { session } = useAuthStore();
  const { matchState, makeMove, match } = useMatch();
  const navigate = useNavigate();

  if (!matchState) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen space-y-6 bg-muted/20">
        <div className="relative">
          <div className="w-20 h-20 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
          <Swords className="absolute inset-0 m-auto w-8 h-8 text-primary animate-pulse" />
        </div>
        <div className="text-2xl font-black tracking-tighter uppercase animate-pulse">Initializing Match</div>
        <Button variant="ghost" onClick={() => navigate("/lobby")} className="font-bold uppercase tracking-widest text-xs">Abandom Mission</Button>
      </div>
    );
  }

  const { board, turn, players, game_over, winner, turn_timer } = matchState;
  
  if (!board || !Array.isArray(board)) {
    console.error("Board is invalid:", board);
    return (
      <div className="flex flex-col items-center justify-center min-h-screen space-y-4">
        <div className="text-xl font-bold">Invalid Board Data Received</div>
        <pre className="p-4 bg-muted rounded">{JSON.stringify(matchState, null, 2)}</pre>
      </div>
    );
  }
  const isMyTurn = turn === session?.user_id;
  const myMark = players[session?.user_id || ""]?.mark;
  
  // Find opponent
  const opponent = Object.values(players).find((p: any) => p.user_id !== session?.user_id) as any;

  return (
    <div className="min-h-screen bg-muted/10 pb-12">
      <nav className="bg-background border-b px-6 py-4 flex items-center justify-between sticky top-0 z-40 backdrop-blur-md bg-background/80">
        <Button variant="ghost" size="sm" onClick={() => navigate("/lobby")} className="gap-2 font-bold uppercase tracking-wide">
          <ArrowLeft className="w-4 h-4" />
          Forfeit
        </Button>
        <div className="flex items-center gap-3">
          <div className={cn(
            "px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest transition-all duration-500",
            isMyTurn 
              ? "bg-primary text-primary-foreground ring-4 ring-primary/20" 
              : "bg-muted text-muted-foreground"
          )}>
            {isMyTurn ? "Your Action" : "Waiting for Opponent"}
          </div>
        </div>
        <div className="text-xs font-mono font-bold opacity-30 hidden sm:block">
          MATCH_ID: {match?.match_id.slice(0, 12)}
        </div>
      </nav>

      <main className="container mx-auto max-w-4xl px-4 pt-12 space-y-8">
        <div className="grid sm:grid-cols-2 gap-6">
          <Card className={cn(
            "transition-all duration-500 rounded-3xl overflow-hidden border-2",
            isMyTurn ? "border-primary shadow-2xl scale-[1.02]" : "border-transparent opacity-60"
          )}>
            <div className="px-6 py-4 bg-muted/50 border-b flex items-center justify-between">
              <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Local Player</span>
              <span className="text-xl font-black">{myMark === 1 ? "X" : "O"}</span>
            </div>
            <CardContent className="p-6 flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center">
                <User className="w-6 h-6 text-primary" />
              </div>
              <div className="flex-1 truncate">
                <div className="text-xs font-bold text-muted-foreground uppercase tracking-tighter">Username</div>
                <div className="text-xl font-black truncate">{session?.username}</div>
              </div>
            </CardContent>
          </Card>

          <Card className={cn(
            "transition-all duration-500 rounded-3xl overflow-hidden border-2",
            !isMyTurn && !game_over ? "border-primary shadow-2xl scale-[1.02]" : "border-transparent opacity-60"
          )}>
            <div className="px-6 py-4 bg-muted/50 border-b flex items-center justify-between">
              <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Opponent</span>
              <span className="text-xl font-black">{myMark === 1 ? "O" : "X"}</span>
            </div>
            <CardContent className="p-6 flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-muted flex items-center justify-center">
                <User className="w-6 h-6 text-muted-foreground" />
              </div>
              <div className="flex-1 truncate">
                <div className="text-xs font-bold text-muted-foreground uppercase tracking-tighter">Status</div>
                <div className="text-xl font-black truncate">{opponent?.username || "Joining..."}</div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="flex flex-col items-center justify-center space-y-8 py-4">
          {matchState.mode === "timed" && !game_over && (
            <div className="relative flex items-center justify-center w-24 h-24">
              <svg className="absolute w-full h-full -rotate-90">
                <circle
                  cx="48"
                  cy="48"
                  r="40"
                  fill="transparent"
                  stroke="currentColor"
                  strokeWidth="8"
                  className="text-muted/20"
                />
                <circle
                  cx="48"
                  cy="48"
                  r="40"
                  fill="transparent"
                  stroke="currentColor"
                  strokeWidth="8"
                  strokeDasharray={251.2}
                  strokeDashoffset={251.2 * (1 - turn_timer / 30)}
                  className="text-primary transition-all duration-1000 ease-linear"
                />
              </svg>
              <div className="text-3xl font-black font-mono">{turn_timer}</div>
            </div>
          )}

          <div className="p-8 rounded-[40px] bg-background shadow-2xl border-4 border-muted/20">
            <GameBoard 
              board={board} 
              onMove={makeMove} 
              disabled={game_over || !isMyTurn} 
            />
          </div>
        </div>
      </main>

      {game_over && (
        <div className="fixed inset-0 bg-background/90 backdrop-blur-xl flex items-center justify-center p-4 z-50 animate-in fade-in duration-500">
          <Card className="w-full max-w-md shadow-[0_0_100px_rgba(0,0,0,0.5)] border-4 border-primary/20 rounded-[40px] overflow-hidden">
            <div className="h-2 bg-primary animate-pulse" />
            <CardContent className="p-12 text-center space-y-8">
              <div className="space-y-2">
                <h2 className="text-sm font-black uppercase tracking-[0.3em] text-muted-foreground">Match Result</h2>
                <div className="text-6xl font-black tracking-tighter uppercase italic">
                  {winner === "draw" ? (
                    "Stalemate"
                  ) : winner === session?.user_id ? (
                    "Victory"
                  ) : (
                    "Defeat"
                  )}
                </div>
              </div>
              
              <div className="py-8 text-7xl">
                {winner === "draw" ? "🤝" : winner === session?.user_id ? "🏆" : "💀"}
              </div>

              <Button className="w-full h-16 rounded-3xl text-xl font-black uppercase tracking-widest shadow-xl" onClick={() => navigate("/lobby")}>
                Return to Base
              </Button>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
