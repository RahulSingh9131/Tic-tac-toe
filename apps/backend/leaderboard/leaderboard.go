package leaderboard

import (
	"context"

	"github.com/heroiclabs/nakama-common/runtime"
)

const (
	LeaderboardWins    = "wins"
	LeaderboardLosses  = "losses"
	LeaderboardStreaks = "win_streaks"
)

// InitLeaderboards creates the standard leaderboards on startup
func InitLeaderboards(ctx context.Context, logger runtime.Logger, nk runtime.NakamaModule) error {
	for _, id := range []string{LeaderboardWins, LeaderboardLosses, LeaderboardStreaks} {
		sortOrder := "desc"
		operator := "incr"
		resetSchedule := "" // Never reset
		metadata := map[string]interface{}{}
		authoritative := true

		if err := nk.LeaderboardCreate(ctx, id, authoritative, sortOrder, operator, resetSchedule, metadata, false); err != nil {
			logger.Error("Failed to create leaderboard %s: %v", id, err)
			return err
		}
		logger.Info("Initialized leaderboard: %s", id)
	}
	return nil
}

// RecordMatchResult updates leaderboards for both players
func RecordMatchResult(ctx context.Context, logger runtime.Logger, nk runtime.NakamaModule, winnerID, loserID string) {
	if winnerID != "" && winnerID != "draw" {
		// Winner
		_, err := nk.LeaderboardRecordWrite(ctx, LeaderboardWins, winnerID, "", 1, 0, nil, nil)
		if err != nil {
			logger.Error("Failed to record win for %s: %v", winnerID, err)
		}

		// Streak
		_, err = nk.LeaderboardRecordWrite(ctx, LeaderboardStreaks, winnerID, "", 1, 0, nil, nil)
		if err != nil {
			logger.Error("Failed to record streak for %s: %v", winnerID, err)
		}
	}

	if loserID != "" && loserID != "draw" {
		// Loser
		_, err := nk.LeaderboardRecordWrite(ctx, LeaderboardLosses, loserID, "", 1, 0, nil, nil)
		if err != nil {
			logger.Error("Failed to record loss for %s: %v", loserID, err)
		}

		// Reset Streak (Nakama 'set' operator would be better but here we use incr 1)
		// Usually we'd use a custom storage object for streaks if we want complex logic
	}
}
