import { Link } from "react-router-dom";
import { useAuthStore } from "@/store/authStore";
import { Button } from "@/components/ui/button";
import { Trophy, Swords, Timer, UserCircle } from "lucide-react";
import { useMatch } from "@/hooks/useMatch";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function Lobby() {
  const { session } = useAuthStore();
  const { joinMatchmaker, match } = useMatch();
  const [searching, setSearching] = useState(false);
  const navigate = useNavigate();

  const handleQuickPlay = async (mode: string) => {
    setSearching(true);
    try {
      await joinMatchmaker(mode);
    } catch (e) {
      setSearching(false);
      console.error(e);
    }
  };

  if (match) {
    navigate("/game");
  }

  return (
    <div className="min-h-screen bg-muted/20 flex flex-col">
      <nav className="border-b bg-background px-6 py-4 flex items-center justify-between">
        <div className="text-xl font-black tracking-tighter uppercase">Tic-Tac-Toe</div>
        <div className="flex items-center gap-4">
          <div className="text-right hidden sm:block">
            <div className="text-xs font-bold uppercase text-muted-foreground tracking-widest">Player</div>
            <div className="text-sm font-black">{session?.username}</div>
          </div>
          <UserCircle className="w-8 h-8 text-primary" />
        </div>
      </nav>

      <main className="flex-1 container mx-auto max-w-6xl px-4 py-12 space-y-12">
        <header className="space-y-4 text-center max-w-2xl mx-auto">
          <h1 className="text-6xl font-black tracking-tighter uppercase italic text-primary/10">Battlefield</h1>
          <p className="text-muted-foreground text-xl font-medium tracking-tight">
            Choose your protocol and start dominating the global rankings.
          </p>
        </header>

        <div className="grid gap-8 grid-cols-1 md:grid-cols-3">
          {/* Classic Mode */}
          <div className="relative group overflow-hidden border-2 border-primary rounded-[40px] bg-background p-8 space-y-6 transition-all hover:shadow-[0_20px_50px_rgba(0,0,0,0.1)] hover:-translate-y-2">
            <div className="p-5 bg-primary text-primary-foreground rounded-[24px] w-fit shadow-lg">
              <Swords className="w-8 h-8" />
            </div>
            <div className="space-y-2">
              <h2 className="text-2xl font-black uppercase tracking-tight">Classic</h2>
              <p className="text-muted-foreground text-sm leading-relaxed">The traditional protocol. 3x3 grid, infinite patience, pure strategy.</p>
            </div>
            <Button 
              className="w-full h-16 rounded-2xl text-lg font-black uppercase tracking-widest shadow-lg"
              onClick={() => handleQuickPlay("classic")}
              disabled={searching}
            >
              {searching ? "Initializing..." : "Engage"}
            </Button>
          </div>

          {/* Blitz Mode */}
          <div className="relative group overflow-hidden border-2 border-muted-foreground/10 rounded-[40px] bg-background p-8 space-y-6 transition-all hover:shadow-[0_20px_50px_rgba(0,0,0,0.1)] hover:-translate-y-2 hover:border-primary/40">
            <div className="p-5 bg-muted text-muted-foreground rounded-[24px] w-fit group-hover:bg-primary/10 group-hover:text-primary transition-colors">
              <Timer className="w-8 h-8" />
            </div>
            <div className="space-y-2">
              <h2 className="text-2xl font-black uppercase tracking-tight text-muted-foreground group-hover:text-primary transition-colors">Blitz</h2>
              <p className="text-muted-foreground text-sm leading-relaxed">High-frequency combat. 30s turn limits. Maximum pressure.</p>
            </div>
            <Button 
              variant="outline" 
              className="w-full h-16 rounded-2xl text-lg font-black uppercase tracking-widest border-2 hover:bg-primary hover:text-primary-foreground transition-all"
              onClick={() => handleQuickPlay("timed")}
              disabled={searching}
            >
              {searching ? "Scanning..." : "Sync"}
            </Button>
          </div>

          {/* Rankings */}
          <div className="relative group overflow-hidden border-2 border-dashed border-muted-foreground/20 rounded-[40px] bg-muted/5 p-8 space-y-6 transition-all hover:border-yellow-500/40 hover:-translate-y-2">
            <div className="p-5 bg-yellow-500/10 text-yellow-600 rounded-[24px] w-fit">
              <Trophy className="w-8 h-8" />
            </div>
            <div className="space-y-2">
              <h2 className="text-2xl font-black uppercase tracking-tight">Elite</h2>
              <p className="text-muted-foreground text-sm leading-relaxed">The wall of fame. Analyze the top performing combatants.</p>
            </div>
            <Button 
              variant="secondary" 
              className="w-full h-16 rounded-2xl text-lg font-black uppercase tracking-widest bg-yellow-500/5 hover:bg-yellow-500/10 text-yellow-700" 
              asChild
            >
              <Link to="/leaderboard">Leaderboard</Link>
            </Button>
          </div>
        </div>

        {searching && (
          <div className="max-w-md mx-auto p-6 bg-primary/5 border-2 border-primary/20 rounded-[30px] flex flex-col items-center justify-center gap-4 animate-in fade-in zoom-in duration-300">
             <div className="flex gap-2">
                <span className="w-3 h-3 rounded-full bg-primary animate-bounce [animation-delay:-0.3s]" />
                <span className="w-3 h-3 rounded-full bg-primary animate-bounce [animation-delay:-0.15s]" />
                <span className="w-3 h-3 rounded-full bg-primary animate-bounce" />
             </div>
             <span className="font-black text-xs tracking-[0.3em] uppercase text-primary">Searching for Opponent...</span>
          </div>
        )}
      </main>
    </div>
  );
}
