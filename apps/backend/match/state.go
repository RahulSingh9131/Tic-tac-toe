package match

// PlayerInfo stores information about a player in the match
type PlayerInfo struct {
	UserID   string `json:"user_id"`
	Username string `json:"username"`
	Mark     int    `json:"mark"` // 1 for X, 2 for O
}

// MatchState represents the in-memory state of a Tic-Tac-Toe match
type MatchState struct {
	// Board: 0=empty, 1=X, 2=O
	Board [3][3]int `json:"board"`

	// Players: userID -> PlayerInfo
	Players map[string]*PlayerInfo `json:"players"`

	// Turn: userID of the current player
	Turn string `json:"turn"`

	// TurnOrder: [playerX_id, playerO_id]
	TurnOrder []string `json:"turn_order"`

	// Game Status
	Winner   string `json:"winner"` // "" | userID | "draw"
	GameOver bool   `json:"game_over"`
	Mode     string `json:"mode"` // "classic" | "timed"

	// Timer State
	TurnTimer     int   `json:"turn_timer"`      // remaining seconds
	TurnStartTick int64 `json:"turn_start_tick"` // tick when current turn started
	TickRate      int   `json:"tick_rate"`       // ticks per second
}

func NewMatchState(mode string) *MatchState {
	return &MatchState{
		Board:     [3][3]int{},
		Players:   make(map[string]*PlayerInfo),
		TurnOrder: make([]string, 0, 2),
		Mode:      mode,
		TickRate:  10, // Default tick rate
	}
}

// GetMarkLabel returns "X", "O", or "" for a given mark value
func GetMarkLabel(mark int) string {
	switch mark {
	case 1:
		return "X"
	case 2:
		return "O"
	default:
		return ""
	}
}
