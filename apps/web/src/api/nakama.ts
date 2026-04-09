import { Client } from "@heroiclabs/nakama-js";

// Nakama Server Configuration from Environment Variables
const SERVER_KEY = import.meta.env.VITE_NAKAMA_SERVER_KEY || "defaultkey";
const HOST = import.meta.env.VITE_NAKAMA_HOST || "127.0.0.1";
const PORT = import.meta.env.VITE_NAKAMA_PORT || "7350";
const USE_SSL = import.meta.env.VITE_NAKAMA_USE_SSL === "true";

// Initialize Nakama Client singleton
export const nakamaClient = new Client(SERVER_KEY, HOST, PORT, USE_SSL);

export const authenticateDevice = async (deviceId: string) => {
    return await nakamaClient.authenticateDevice(deviceId, true);
};

export const authenticateEmail = async (email: string, password: string) => {
    return await nakamaClient.authenticateEmail(email, password, true);
};
