package match

import (
	"context"
	"database/sql"
	"encoding/json"

	"github.com/heroiclabs/nakama-common/runtime"
)

type MatchHandler struct{}

func (m *MatchHandler) MatchInit(ctx context.Context, logger runtime.Logger, db *sql.DB, nk runtime.NakamaModule, params map[string]interface{}) (interface{}, int, string) {
	mode := "classic"
	if m, ok := params["mode"].(string); ok {
		mode = m
	}

	state := NewMatchState(mode)
	if mode == "timed" {
		state.TurnTimer = 30
	}

	tickRate := 10 // 10 ticks per second
	label := ""    // Match labels can be used for filtering

	return state, tickRate, label
}

func (m *MatchHandler) MatchJoinAttempt(ctx context.Context, logger runtime.Logger, db *sql.DB, nk runtime.NakamaModule, dispatcher runtime.MatchDispatcher, tick int64, state interface{}, presence runtime.Presence, metadata map[string]string) (interface{}, bool, string) {
	s := state.(*MatchState)

	if len(s.Players) >= 2 {
		return s, false, "match full"
	}

	return s, true, ""
}

func (m *MatchHandler) MatchJoin(ctx context.Context, logger runtime.Logger, db *sql.DB, nk runtime.NakamaModule, dispatcher runtime.MatchDispatcher, tick int64, state interface{}, presences []runtime.Presence) interface{} {
	s := state.(*MatchState)

	for _, p := range presences {
		mark := 1 // X
		if len(s.Players) == 1 {
			mark = 2 // O
		}

		s.Players[p.GetUserId()] = &PlayerInfo{
			UserID:   p.GetUserId(),
			Username: p.GetUsername(),
			Mark:     mark,
		}
		s.TurnOrder = append(s.TurnOrder, p.GetUserId())

		if len(s.Players) == 2 {
			s.Turn = s.TurnOrder[0] // X starts

			// Broadcast Game Start
			msg, _ := json.Marshal(s)
			dispatcher.BroadcastMessage(OpCodeGameStart, msg, nil, nil, true)
		}
	}

	return s
}

func (m *MatchHandler) MatchLeave(ctx context.Context, logger runtime.Logger, db *sql.DB, nk runtime.NakamaModule, dispatcher runtime.MatchDispatcher, tick int64, state interface{}, presences []runtime.Presence) interface{} {
	s := state.(*MatchState)

	for _, p := range presences {
		delete(s.Players, p.GetUserId())

		if !s.GameOver && len(s.Players) < 2 {
			// Opponent left, end game
			s.GameOver = true
			// Determine winner (the one who stayed)
			for id := range s.Players {
				s.Winner = id
			}

			msg, _ := json.Marshal(map[string]string{"reason": "opponent_left"})
			dispatcher.BroadcastMessage(OpCodeOpponentLeft, msg, nil, nil, true)
		}
	}

	return s
}

func (m *MatchHandler) MatchLoop(ctx context.Context, logger runtime.Logger, db *sql.DB, nk runtime.NakamaModule, dispatcher runtime.MatchDispatcher, tick int64, state interface{}, messages []runtime.MatchData) interface{} {
	s := state.(*MatchState)

	if s.GameOver {
		return nil // Terminate match
	}

	// Handle Messages
	for _, m := range messages {
		switch m.GetOpCode() {
		case OpCodePlayerMove:
			var move struct {
				Row int `json:"row"`
				Col int `json:"col"`
			}
			if err := json.Unmarshal(m.GetData(), &move); err != nil {
				logger.Error("Failed to unmarshal move: %v", err)
				continue
			}

			if err := ValidateMove(s, m.GetUserId(), move.Row, move.Col); err != nil {
				errMsg, _ := json.Marshal(map[string]string{"reason": err.Error()})
				dispatcher.BroadcastMessage(OpCodeInvalidMove, errMsg, []runtime.Presence{m}, nil, true)
				continue
			}

			ApplyMove(s, m.GetUserId(), move.Row, move.Col)

			// Broadcast Update
			update, _ := json.Marshal(s)
			dispatcher.BroadcastMessage(OpCodeStateUpdate, update, nil, nil, true)

			if s.GameOver {
				gameOverMsg, _ := json.Marshal(s)
				dispatcher.BroadcastMessage(OpCodeGameOver, gameOverMsg, nil, nil, true)
			}
		}
	}

	// Handle Timers (if timed mode)
	if s.Mode == "timed" && !s.GameOver {
		if tick%int64(s.TickRate) == 0 { // Once per second
			s.TurnTimer--

			if s.TurnTimer <= 0 {
				// Forfeit current player
				s.GameOver = true
				for _, id := range s.TurnOrder {
					if id != s.Turn {
						s.Winner = id
						break
					}
				}

				gameOverMsg, _ := json.Marshal(s)
				dispatcher.BroadcastMessage(OpCodeGameOver, gameOverMsg, nil, nil, true)
			} else {
				// Optional: broadcast timer update if needed frequently
			}
		}
	}

	return s
}

func (m *MatchHandler) MatchTerminate(ctx context.Context, logger runtime.Logger, db *sql.DB, nk runtime.NakamaModule, dispatcher runtime.MatchDispatcher, tick int64, state interface{}, graceSeconds int) interface{} {
	// Final cleanup or stats recording could happen here
	// But it's better to do via MatchTerminate or MatchLoop's final state
	return state
}

func (m *MatchHandler) MatchSignal(ctx context.Context, logger runtime.Logger, db *sql.DB, nk runtime.NakamaModule, dispatcher runtime.MatchDispatcher, tick int64, state interface{}, data string) (interface{}, string) {
	return state, ""
}
