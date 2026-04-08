package main

import (
	"context"
	"database/sql"
	"tictactoe/backend/leaderboard"
	"tictactoe/backend/match"
	"tictactoe/backend/rpc"

	"github.com/heroiclabs/nakama-common/runtime"
)

func InitModule(ctx context.Context, logger runtime.Logger, db *sql.DB, nk runtime.NakamaModule, initializer runtime.Initializer) error {
	logger.Info("Multiplayer Tic-Tac-Toe Module Loading...")

	// 1. Initialize Leaderboards
	if err := leaderboard.InitLeaderboards(ctx, logger, nk); err != nil {
		return err
	}

	// 2. Register Match Handler
	if err := initializer.RegisterMatch("tictactoe", func(ctx context.Context, logger runtime.Logger, db *sql.DB, nk runtime.NakamaModule) (runtime.Match, error) {
		return &match.MatchHandler{}, nil
	}); err != nil {
		return err
	}

	// 3. Register RPCs
	if err := initializer.RegisterRpc("get_player_stats", rpc.GetPlayerStats); err != nil {
		return err
	}

	// 4. Register Matchmaker Hook
	if err := initializer.RegisterMatchmakerMatched(func(ctx context.Context, logger runtime.Logger, db *sql.DB, nk runtime.NakamaModule, entries []runtime.MatchmakerEntry) (string, error) {
		// Automatically create a match for the matched players
		params := map[string]interface{}{
			"mode": "classic",
		}

		// If all players requested timed mode, use it
		allTimed := true
		for _, e := range entries {
			if m, ok := e.GetProperties()["mode"].(string); !ok || m != "timed" {
				allTimed = false
				break
			}
		}
		if allTimed {
			params["mode"] = "timed"
		}

		matchId, err := nk.MatchCreate(ctx, "tictactoe", params)
		if err != nil {
			return "", err
		}
		return matchId, nil
	}); err != nil {
		return err
	}

	logger.Info("Multiplayer Tic-Tac-Toe Module Loaded Successfully.")
	return nil
}
