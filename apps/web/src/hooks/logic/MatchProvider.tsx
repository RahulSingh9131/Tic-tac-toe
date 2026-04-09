import { createContext, useContext, useEffect, useState, useCallback, ReactNode } from "react";
import { nakamaClient } from "../../api/nakama";
import { Match, Socket } from "@heroiclabs/nakama-js";
import { useAuthStore } from "../../store/authStore";

interface MatchContextType {
    socket: Socket | null;
    match: Match | null;
    matchState: any;
    joinMatchmaker: (mode?: string) => Promise<void>;
    makeMove: (row: number, col: number) => Promise<void>;
}

const MatchContext = createContext<MatchContextType | undefined>(undefined);

export function MatchProvider({ children }: { children: ReactNode }) {
    const { session } = useAuthStore();
    const [socket, setSocket] = useState<Socket | null>(null);
    const [match, setMatch] = useState<Match | null>(null);
    const [matchState, setMatchState] = useState<any>(null);

    // Initialize Socket
    useEffect(() => {
        if (!session || socket) return;

        const useSSL = (import.meta as any).env.VITE_NAKAMA_USE_SSL === "true";
        const s = nakamaClient.createSocket(useSSL, false);
        
        const initSocket = async () => {
            try {
                await s.connect(session, true);
                setSocket(s);
            } catch (e) {
                console.error("Socket connection failed", e);
            }
        };
        initSocket();

        return () => {
            if (s) {
                s.disconnect(true);
                setSocket(null);
            }
        };
    }, [session]);

    // Handle Match Events
    useEffect(() => {
        if (!socket) return;

        socket.onmatchdata = (result) => {
            console.log("MATCH DATA RECEIVED", result.op_code);
            const payload = JSON.parse(new TextDecoder().decode(result.data));
            console.log("SYNCED STATE:", payload);
            setMatchState((prev: any) => ({
                ...prev,
                ...payload,
                lastOpCode: result.op_code
            }));
        };

        socket.onmatchpresence = (presence: any) => {
            console.log("PRESENCE UPDATE", presence);
        };

        socket.onmatchmakermatched = async (matched) => {
            console.log("MATCHMAKER MATCHED", matched);
            try {
                const m = await socket.joinMatch(matched.match_id, matched.token);
                console.log("JOINED MATCH", m.match_id);
                setMatch(m);
            } catch (e) {
                console.error("Failed to join match after matching", e);
            }
        };
    }, [socket]);

    const joinMatchmaker = useCallback(async (mode: string = "classic") => {
        if (!socket) return;
        console.log("JOINING MATCHMAKER", mode);

        const query = `+properties.mode:${mode}`;
        const minCount = 2;
        const maxCount = 2;
        const stringProperties = { mode };

        try {
            const ticket = await socket.addMatchmaker(query, minCount, maxCount, stringProperties);
            console.log("MATCHMAKER TICKET RECEIVED", ticket);
        } catch (e) {
            console.error("Failed to add matchmaker", e);
        }
    }, [socket]);

    const makeMove = useCallback(async (row: number, col: number) => {
        if (!socket || !match) return;
        const OpCodePlayerMove = 4;
        const data = JSON.stringify({ row, col });
        try {
            await socket.sendMatchState(match.match_id, OpCodePlayerMove, data);
        } catch (e) {
            console.error("Failed to send match data", e);
        }
    }, [socket, match]);

    return (
        <MatchContext.Provider value={{ socket, match, matchState, joinMatchmaker, makeMove }}>
            {children}
        </MatchContext.Provider>
    );
}

export const useMatch = () => {
    const context = useContext(MatchContext);
    if (context === undefined) {
        throw new Error("useMatch must be used within a MatchProvider");
    }
    return context;
};
