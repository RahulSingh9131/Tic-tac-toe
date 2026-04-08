import { Client } from "@heroiclabs/nakama-js";

// Nakama Server Configuration
const SERVER_KEY = "tictactoe-dev-key";
const HOST = "127.0.0.1";
const PORT = "7350";
const USE_SSL = false;

// Initialize Nakama Client singleton
export const nakamaClient = new Client(SERVER_KEY, HOST, PORT, USE_SSL);

export const authenticateDevice = async (deviceId: string) => {
    return await nakamaClient.authenticateDevice(deviceId, true);
};

export const authenticateEmail = async (email: string, password: string) => {
    return await nakamaClient.authenticateEmail(email, password, true);
};
