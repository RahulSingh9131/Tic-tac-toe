import { useEffect, useState } from "react";
import { useAuthStore } from "@/store/authStore";
import { authenticateDevice } from "@/api/nakama";
import { Session } from "@heroiclabs/nakama-js";

export const useAuth = () => {
    const { session, setSession, isAuthenticated } = useAuthStore();
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const initAuth = async () => {
            // 1. Try to restore session from localStorage
            const storedSession = localStorage.getItem("nakama_session");
            const storedRefresh = localStorage.getItem("nakama_refresh");

            if (storedSession) {
                try {
                    // In nakama-js v2.x, restore takes (token, refreshToken)
                    const sessionObj = Session.restore(storedSession, storedRefresh || "");
                    const currentTime = Math.floor(Date.now() / 1000);

                    if (!sessionObj.isexpired(currentTime)) {
                        setSession(sessionObj);
                        setLoading(false);
                        return;
                    }
                } catch (e) {
                    console.error("Failed to restore session", e);
                }
            }

            // 2. Auto-login via device if no valid session
            try {
                let deviceId = localStorage.getItem("nakama_device_id");
                if (!deviceId) {
                    deviceId = crypto.randomUUID();
                    localStorage.setItem("nakama_device_id", deviceId);
                }

                const sessionObj = await authenticateDevice(deviceId);
                localStorage.setItem("nakama_session", sessionObj.token);
                localStorage.setItem("nakama_refresh", sessionObj.refresh_token);
                setSession(sessionObj);
            } catch (e) {
                console.error("Authentication failed", e);
            } finally {
                setLoading(false);
            }
        };

        initAuth();
    }, [setSession]);

    return { session, isAuthenticated, loading };
};
