import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "./hooks/useAuth";
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
      <Routes>
        <Route 
          path="/" 
          element={isAuthenticated ? <Navigate to="/lobby" /> : <Login />} 
        />
        <Route 
          path="/lobby" 
          element={isAuthenticated ? <Lobby /> : <Navigate to="/" />} 
        />
        <Route 
          path="/game" 
          element={isAuthenticated ? <Game /> : <Navigate to="/" />} 
        />
        <Route 
          path="/leaderboard" 
          element={isAuthenticated ? <Leaderboard /> : <Navigate to="/" />} 
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
