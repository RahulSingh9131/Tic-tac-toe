import { useEffect, useState, useCallback } from "react";
import { nakamaClient } from "@/api/nakama";
import { Match, Socket } from "@heroiclabs/nakama-js";
import { useAuthStore } from "@/store/authStore";

export const useMatch = () => {
    const { session } = useAuthStore();
    const [socket, setSocket] = useState<Socket | null>(null);
    const [match, setMatch] = useState<Match | null>(null);
    const [matchState, setMatchState] = useState<any>(null);

    // Initialize Socket
    useEffect(() => {
        if (!session || socket) return;

        const s = nakamaClient.createSocket(false, false);
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
            if (s) s.disconnect(true);
        };
    }, [session, socket]);

    // Handle Match Events
    useEffect(() => {
        if (!socket) return;

        socket.onmatchdata = (result) => {
            const payload = JSON.parse(new TextDecoder().decode(result.data));
            setMatchState((prev: any) => ({
                ...prev,
                ...payload,
                lastOpCode: result.op_code
            }));
        };

        socket.onmatchpresence = (presence: any) => {
            console.log("Presence update", presence);
        };

        socket.onmatchmakermatched = async (matched) => {
            try {
                const m = await socket.joinMatch(matched.match_id, matched.token);
                setMatch(m);
            } catch (e) {
                console.error("Failed to join match after matching", e);
            }
        };
    }, [socket]);

    const joinMatchmaker = useCallback(async (mode: string = "classic") => {
        if (!socket) return;

        const query = "*";
        const minCount = 2;
        const maxCount = 2;
        const stringProperties = { mode };

        try {
            await socket.addMatchmaker(query, minCount, maxCount, stringProperties);
        } catch (e) {
            console.error("Failed to add matchmaker", e);
        }
    }, [socket]);

    const makeMove = useCallback(async (row: number, col: number) => {
        if (!socket || !match) return;
        const OpCodePlayerMove = 4;
        const data = JSON.stringify({ row, col });
        try {
            await (socket as any).sendMatchData(match.match_id, OpCodePlayerMove, data);
        } catch (e) {
            console.error("Failed to send match data", e);
        }
    }, [socket, match]);

    return { socket, match, matchState, joinMatchmaker, makeMove };
};
