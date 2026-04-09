import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "./hooks/logic/useAuth";
import { MatchProvider } from "./hooks/logic/MatchProvider";
import Lobby from "./pages/Lobby";
import Leaderboard from "./pages/Leaderboard";
import Game from "./pages/Game";
import Login from "./pages/Login";

function App() {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <BrowserRouter>
      <MatchProvider>
        <Routes>
          <Route 
            path="/" 
            element={isAuthenticated ? <Navigate to="/lobby" replace /> : <Login />} 
          />
          <Route 
            path="/lobby" 
            element={isAuthenticated ? <Lobby /> : <Navigate to="/" replace />} 
          />
          <Route 
            path="/game" 
            element={isAuthenticated ? <Game /> : <Navigate to="/" replace />} 
          />
          <Route 
            path="/leaderboard" 
            element={isAuthenticated ? <Leaderboard /> : <Navigate to="/" replace />} 
          />
        </Routes>
      </MatchProvider>
    </BrowserRouter>
  );
}

export default App;
