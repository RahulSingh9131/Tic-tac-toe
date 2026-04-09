import { useLeaderboard } from "@/hooks/queries/useLeaderboard";
import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Trophy, Swords, Timer, UserCircle, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/store/authStore";
import { useMatch } from "@/hooks/logic/MatchProvider";
import { useAccount } from "@/hooks/queries/useAccount";

export default function Lobby() {
  const { session, logout } = useAuthStore();
  const { joinMatchmaker, match } = useMatch();
  const { data: account } = useAccount();
  const { data: winsRecords } = useLeaderboard("wins", 1, session?.user_id ? [session.user_id] : undefined);
  const myWins = winsRecords?.[0]?.score || 0;
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
      <nav className="bg-background border-b px-6 py-4 flex items-center justify-between sticky top-0 z-40 backdrop-blur-md bg-background/80">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center">
            <Swords className="w-5 h-5 text-primary" />
          </div>
          <div className="text-xl font-black tracking-tighter uppercase italic">Tic-Tac-Toe</div>
        </div>
        <div className="flex items-center gap-6">
          <div className="text-right hidden sm:block">
            <div className="text-[10px] font-black uppercase text-muted-foreground tracking-widest opacity-60">Combatant</div>
            <div className="text-sm font-black flex items-center gap-2">
              {session?.username}
              {account?.custom_id && (
                <span className="text-[10px] bg-yellow-500/10 text-yellow-600 px-2 py-0.5 rounded-full border border-yellow-500/20">
                  {myWins} Wins
                </span>
              )}
            </div>
          </div>
          <UserCircle className="w-10 h-10 text-primary p-2 bg-primary/5 rounded-2xl" />
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => logout()}
            className="text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-xl"
          >
            <LogOut className="w-5 h-5" />
          </Button>
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
          <div className="fixed inset-0 bg-background/80 backdrop-blur-md flex items-center justify-center p-4 z-50 animate-in fade-in duration-500">
            <div className="max-w-md w-full bg-background border-4 border-primary/20 rounded-[40px] p-12 text-center space-y-8 shadow-[0_0_100px_rgba(0,0,0,0.2)]">
               <div className="relative flex items-center justify-center">
                  <div className="w-32 h-32 border-4 border-primary/10 border-t-primary rounded-full animate-spin" />
                  <Swords className="absolute w-12 h-12 text-primary animate-pulse" />
               </div>
               
               <div className="space-y-2">
                 <h2 className="text-3xl font-black uppercase italic tracking-tighter">Searching</h2>
                 <p className="text-muted-foreground font-medium">Quantizing battlefield parameters...</p>
               </div>

               <div className="flex justify-center gap-3">
                  <span className="w-2 h-2 rounded-full bg-primary animate-bounce [animation-delay:-0.3s]" />
                  <span className="w-2 h-2 rounded-full bg-primary animate-bounce [animation-delay:-0.15s]" />
                  <span className="w-2 h-2 rounded-full bg-primary animate-bounce" />
               </div>

               <Button 
                variant="ghost" 
                onClick={() => setSearching(false)} 
                className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground hover:text-destructive"
               >
                 Abort Sequence
               </Button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
