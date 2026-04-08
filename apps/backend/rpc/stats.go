package rpc

import (
	"context"
	"database/sql"
	"encoding/json"

	"github.com/heroiclabs/nakama-common/runtime"
)

func GetPlayerStats(ctx context.Context, logger runtime.Logger, db *sql.DB, nk runtime.NakamaModule, payload string) (string, error) {
	userID, ok := ctx.Value(runtime.RUNTIME_CTX_USER_ID).(string)
	if !ok {
		return "", runtime.NewError("not authenticated", 16)
	}

	// Fetch account to get metadata if needed
	account, err := nk.AccountGetId(ctx, userID)
	if err != nil {
		return "", runtime.NewError("failed to get account", 13)
	}

	// Fetch leaderboard records for this user
	records, _, _, _, err := nk.LeaderboardRecordsList(ctx, "wins", []string{userID}, 1, "", 0)
	wins := int64(0)
	if err == nil && len(records) > 0 {
		wins = records[0].Score
	}

	stats := map[string]interface{}{
		"username": account.User.Username,
		"user_id":  userID,
		"wins":     wins,
	}

	response, err := json.Marshal(stats)
	if err != nil {
		return "", runtime.NewError("failed to marshal response", 13)
	}

	return string(response), nil
}
