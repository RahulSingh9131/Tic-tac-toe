package leaderboard

import (
	"context"
	"encoding/json"

	"github.com/heroiclabs/nakama-common/runtime"
)

const (
	LeaderboardWins    = "wins"
	LeaderboardLosses  = "losses"
	LeaderboardStreaks = "win_streaks"
)

// InitLeaderboards creates the standard leaderboards on startup
func InitLeaderboards(ctx context.Context, logger runtime.Logger, nk runtime.NakamaModule) error {
	leaderboards := []struct {
		id       string
		operator string
	}{
		{LeaderboardWins, "incr"},
		{LeaderboardLosses, "incr"},
		{LeaderboardStreaks, "best"}, // Keep the highest streak ever recorded
	}

	for _, lb := range leaderboards {
		sortOrder := "desc"
		resetSchedule := "" // Never reset
		metadata := map[string]interface{}{}
		authoritative := true

		if err := nk.LeaderboardCreate(ctx, lb.id, authoritative, sortOrder, lb.operator, resetSchedule, metadata, false); err != nil {
			logger.Error("Failed to create leaderboard %s: %v", lb.id, err)
			return err
		}
		logger.Info("Initialized leaderboard: %s", lb.id)
	}
	return nil
}

// RecordMatchResult updates leaderboards for both players
func RecordMatchResult(ctx context.Context, logger runtime.Logger, nk runtime.NakamaModule, winnerID, loserID string) {
	// Fetch accounts to get usernames for the leaderboard records
	accounts, err := nk.AccountsGetId(ctx, []string{winnerID, loserID})
	usernames := make(map[string]string)
	if err == nil {
		for _, a := range accounts {
			usernames[a.User.Id] = a.User.Username
		}
	}

	if winnerID != "" && winnerID != "draw" {
		// Winner
		winnerName := usernames[winnerID]
		_, err := nk.LeaderboardRecordWrite(ctx, LeaderboardWins, winnerID, winnerName, 1, 0, nil, nil)
		if err != nil {
			logger.Error("Failed to record win for %s: %v", winnerID, err)
		}

		// Update Best Streak
		// We use Storage to track current streak
		currentStreak := 1
		objects, err := nk.StorageRead(ctx, []*runtime.StorageRead{
			{
				Collection: "stats",
				Key:        "streak",
				UserID:     winnerID,
			},
		})
		if err == nil && len(objects) > 0 {
			var stats map[string]int
			if err := json.Unmarshal([]byte(objects[0].Value), &stats); err == nil {
				currentStreak = stats["current"] + 1
			}
		}

		// Save current streak
		statsVal, _ := json.Marshal(map[string]int{"current": currentStreak})
		nk.StorageWrite(ctx, []*runtime.StorageWrite{
			{
				Collection:      "stats",
				Key:             "streak",
				UserID:          winnerID,
				Value:           string(statsVal),
				PermissionRead:  1, // Owner read
				PermissionWrite: 0, // Server only
			},
		})

		// Record current streak to "Best Streaks" leaderboard (operator=best)
		_, err = nk.LeaderboardRecordWrite(ctx, LeaderboardStreaks, winnerID, winnerName, int64(currentStreak), 0, nil, nil)
		if err != nil {
			logger.Error("Failed to record streak for %s: %v", winnerID, err)
		}
	}

	if loserID != "" && loserID != "draw" {
		// Loser
		loserName := usernames[loserID]
		_, err := nk.LeaderboardRecordWrite(ctx, LeaderboardLosses, loserID, loserName, 1, 0, nil, nil)
		if err != nil {
			logger.Error("Failed to record loss for %s: %v", loserID, err)
		}

		// Reset Current Streak in Storage
		statsVal, _ := json.Marshal(map[string]int{"current": 0})
		nk.StorageWrite(ctx, []*runtime.StorageWrite{
			{
				Collection:      "stats",
				Key:             "streak",
				UserID:          loserID,
				Value:           string(statsVal),
				PermissionRead:  1,
				PermissionWrite: 0,
			},
		})
	}
}
