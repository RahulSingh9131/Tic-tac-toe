import { useQuery } from "@tanstack/react-query";
import { nakamaClient } from "@/api/nakama";
import { useAuthStore } from "@/store/authStore";

export const useLeaderboard = (id: string = "wins", limit: number = 10) => {
    const { session } = useAuthStore();

    return useQuery({
        queryKey: ["leaderboard", id, limit],
        queryFn: async () => {
            if (!session) throw new Error("No session available");
            const result = await nakamaClient.listLeaderboardRecords(
                session,
                id,
                undefined,
                limit
            );
            return result.records || [];
        },
        enabled: !!session,
    });
};
