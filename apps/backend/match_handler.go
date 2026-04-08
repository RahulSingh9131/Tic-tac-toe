// Package main contains the match handler stub for the Tic-Tac-Toe game.
// The full game logic will be implemented in Phase 2.
package main

import (
	"context"
	"database/sql"

	"github.com/heroiclabs/nakama-common/runtime"
)

// MatchHandler implements the runtime.Match interface for authoritative Tic-Tac-Toe matches.
type MatchHandler struct{}

// MatchInit initializes a new match with an empty board.
func (m *MatchHandler) MatchInit(ctx context.Context, logger runtime.Logger, db *sql.DB, nk runtime.NakamaModule, params map[string]interface{}) (interface{}, int, string) {
	logger.Info("Match init")

	state := &MatchState{
		Board:   [3][3]int{},
		Players: make(map[string]*PlayerInfo),
		Mode:    "classic",
	}

	// Parse mode from matchmaker params
	if mode, ok := params["mode"].(string); ok {
		state.Mode = mode
	}

	// Tick rate: 5 ticks/second (sufficient for turn-based with timer updates)
	tickRate := 5
	label := "tictactoe"

	return state, tickRate, label
}

// MatchJoinAttempt validates whether a player can join the match.
func (m *MatchHandler) MatchJoinAttempt(ctx context.Context, logger runtime.Logger, db *sql.DB, nk runtime.NakamaModule, dispatcher runtime.MatchDispatcher, tick int64, state interface{}, presence runtime.Presence, metadata map[string]string) (interface{}, bool, string) {
	s := state.(*MatchState)

	// Only allow 2 players
	if len(s.Players) >= 2 {
		return s, false, "match is full"
	}

	if s.GameOver {
		return s, false, "game is already over"
	}

	return s, true, ""
}

// MatchJoin is called when a player successfully joins the match.
func (m *MatchHandler) MatchJoin(ctx context.Context, logger runtime.Logger, db *sql.DB, nk runtime.NakamaModule, dispatcher runtime.MatchDispatcher, tick int64, state interface{}, presences []runtime.Presence) interface{} {
	s := state.(*MatchState)
	logger.Info("Player(s) joining match, count: %d", len(presences))

	// TODO: Assign X/O marks and broadcast GAME_START (Phase 2)

	return s
}

// MatchLeave is called when a player leaves the match.
func (m *MatchHandler) MatchLeave(ctx context.Context, logger runtime.Logger, db *sql.DB, nk runtime.NakamaModule, dispatcher runtime.MatchDispatcher, tick int64, state interface{}, presences []runtime.Presence) interface{} {
	s := state.(*MatchState)
	logger.Info("Player(s) leaving match, count: %d", len(presences))

	// TODO: Handle forfeit logic (Phase 2)

	return s
}

// MatchLoop is called every tick to process game logic.
func (m *MatchHandler) MatchLoop(ctx context.Context, logger runtime.Logger, db *sql.DB, nk runtime.NakamaModule, dispatcher runtime.MatchDispatcher, tick int64, state interface{}, messages []runtime.MatchData) interface{} {
	s := state.(*MatchState)

	// TODO: Process PLAYER_MOVE messages, validate, update board, check winner (Phase 2)

	_ = messages
	return s
}

// MatchTerminate is called when a match is ending.
func (m *MatchHandler) MatchTerminate(ctx context.Context, logger runtime.Logger, db *sql.DB, nk runtime.NakamaModule, dispatcher runtime.MatchDispatcher, tick int64, state interface{}, graceSeconds int) interface{} {
	s := state.(*MatchState)
	logger.Info("Match terminating, grace seconds: %d", graceSeconds)

	// TODO: Save match results to leaderboard (Phase 4)

	return s
}

// MatchSignal handles external signals sent to the match.
func (m *MatchHandler) MatchSignal(ctx context.Context, logger runtime.Logger, db *sql.DB, nk runtime.NakamaModule, dispatcher runtime.MatchDispatcher, tick int64, state interface{}, data string) (interface{}, string) {
	return state, ""
}
