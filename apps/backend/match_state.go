// Package main contains the match state and player info types.
package main

// MatchState holds the authoritative state of a Tic-Tac-Toe match.
type MatchState struct {
	// Board represents the 3x3 game grid.
	// Values: 0 = empty, 1 = X, 2 = O
	Board [3][3]int `json:"board"`

	// Players maps user ID to player info.
	Players map[string]*PlayerInfo `json:"players"`

	// TurnOrder holds user IDs in turn order: [0] = X, [1] = O.
	TurnOrder []string `json:"turnOrder"`

	// Turn is the user ID of the player whose turn it is.
	Turn string `json:"turn"`

	// Winner is the user ID of the winner, "draw" for a draw, or "" if ongoing.
	Winner string `json:"winner"`

	// GameOver indicates whether the game has ended.
	GameOver bool `json:"gameOver"`

	// Mode is the game mode: "classic" or "timed".
	Mode string `json:"mode"`

	// TurnDeadlineTick is the tick at which the current turn expires (timed mode only).
	TurnDeadlineTick int64 `json:"turnDeadlineTick"`

	// TickRate stores the match tick rate for timer calculations.
	TickRate int `json:"tickRate"`
}

// PlayerInfo holds info about a player in the match.
type PlayerInfo struct {
	// UserID is the Nakama user ID.
	UserID string `json:"userId"`

	// Username is the display name.
	Username string `json:"username"`

	// Mark is the player's mark: 1 = X, 2 = O.
	Mark int `json:"mark"`
}
