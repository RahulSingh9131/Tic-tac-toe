import { create } from "zustand";
import { Session } from "@heroiclabs/nakama-js";

interface AuthState {
    session: Session | null;
    isAuthenticated: boolean;
    setSession: (session: Session | null) => void;
    logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
    session: null,
    isAuthenticated: false,
    setSession: (session) => set({
        session,
        isAuthenticated: !!session && !session.isexpired(Math.floor(Date.now() / 1000))
    }),
    logout: () => {
        localStorage.removeItem("nakama_session");
        set({ session: null, isAuthenticated: false });
    },
}));
