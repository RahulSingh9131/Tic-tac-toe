import { useState } from "react";
import { useAuthStore } from "@/store/authStore";
import { authenticateDevice } from "@/api/nakama";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Smartphone } from "lucide-react";

export default function Login() {
  const { setSession } = useAuthStore();
  const [loading, setLoading] = useState(false);

  const handleDeviceLogin = async () => {
    setLoading(true);
    try {
      let deviceId = localStorage.getItem("nakama_device_id");
      if (!deviceId) {
        deviceId = crypto.randomUUID();
        localStorage.setItem("nakama_device_id", deviceId);
      }
      const session = await authenticateDevice(deviceId);
      localStorage.setItem("nakama_session", session.token);
      localStorage.setItem("nakama_refresh", session.refresh_token);
      setSession(session);
    } catch (e) {
      console.error("Login failed", e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen p-4 bg-muted/30">
      <Card className="w-full max-w-md shadow-xl">
        <CardHeader className="text-center space-y-2">
          <CardTitle className="text-3xl font-bold">Multiplayer Tic-Tac-Toe</CardTitle>
          <p className="text-muted-foreground text-sm">Sign in to start playing with others</p>
        </CardHeader>
        <CardContent className="space-y-4 pt-4">
          <Button 
            className="w-full h-14 gap-3 text-lg font-black uppercase tracking-widest bg-primary hover:bg-primary/90 shadow-lg shadow-primary/20 rounded-2xl" 
            onClick={handleDeviceLogin} 
            disabled={loading}
          >
            <Smartphone className="w-5 h-5" />
            {loading ? "Initializing..." : "Engage Protocol"}
          </Button>
          
          <p className="text-[10px] text-center text-muted-foreground pt-4 uppercase tracking-[0.2em] font-black opacity-50">
            Secure Device Authentication Enabled
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
