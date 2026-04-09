import { useQuery } from "@tanstack/react-query";
import { nakamaClient } from "@/api/nakama";
import { useAuthStore } from "@/store/authStore";

export const useAccount = () => {
    const { session } = useAuthStore();

    return useQuery({
        queryKey: ["account"],
        queryFn: async () => {
            if (!session) throw new Error("No session available");
            return await nakamaClient.getAccount(session);
        },
        enabled: !!session,
    });
};
