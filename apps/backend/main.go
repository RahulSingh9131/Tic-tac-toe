// Package main is the entry point for the Nakama Go plugin.
// It registers match handlers, matchmaker hooks, RPCs, and leaderboards.
package main

import (
	"context"
	"database/sql"

	"github.com/heroiclabs/nakama-common/runtime"
)

const (
	moduleName    = "tictactoe"
	matchName     = "tictactoe_match"
	leaderboardID = "global_wins"
)

// InitModule is called by Nakama when the plugin is loaded.
// It registers the match handler, matchmaker hook, and RPC functions.
func InitModule(ctx context.Context, logger runtime.Logger, db *sql.DB, nk runtime.NakamaModule, initializer runtime.Initializer) error {
	logger.Info("Initializing %s module", moduleName)

	// Register the authoritative match handler
	if err := initializer.RegisterMatch(matchName, newMatch); err != nil {
		return err
	}

	// Register matchmaker matched hook — creates an authoritative match when players are paired
	if err := initializer.RegisterMatchmakerMatched(onMatchmakerMatched); err != nil {
		return err
	}

	logger.Info("Module %s loaded successfully", moduleName)
	return nil
}

// newMatch creates a new instance of the match handler.
func newMatch(ctx context.Context, logger runtime.Logger, db *sql.DB, nk runtime.NakamaModule) (runtime.Match, error) {
	return &MatchHandler{}, nil
}

// onMatchmakerMatched is called when the matchmaker finds a suitable match.
// It creates an authoritative server match for the paired players.
func onMatchmakerMatched(ctx context.Context, logger runtime.Logger, db *sql.DB, nk runtime.NakamaModule, entries []runtime.MatchmakerEntry) (string, error) {
	// Extract game mode from matchmaker properties (default to "classic")
	mode := "classic"
	for _, entry := range entries {
		if props := entry.GetProperties(); props != nil {
			if strProps := props["mode"]; strProps != nil {
				if m, ok := strProps.(string); ok {
					mode = m
					break
				}
			}
		}
	}

	params := map[string]interface{}{
		"mode": mode,
	}

	matchID, err := nk.MatchCreate(ctx, matchName, params)
	if err != nil {
		logger.Error("Failed to create match: %v", err)
		return "", err
	}

	logger.Info("Match created: %s (mode: %s)", matchID, mode)
	return matchID, nil
}
