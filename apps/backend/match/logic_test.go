package match

import (
	"testing"
)

func TestCheckWinner(t *testing.T) {
	tests := []struct {
		name     string
		board    [3][3]int
		winner   int
		gameOver bool
	}{
		{
			name: "Row win",
			board: [3][3]int{
				{1, 1, 1},
				{2, 0, 0},
				{0, 2, 0},
			},
			winner:   1,
			gameOver: true,
		},
		{
			name: "Column win",
			board: [3][3]int{
				{1, 2, 0},
				{1, 0, 0},
				{1, 2, 0},
			},
			winner:   1,
			gameOver: true,
		},
		{
			name: "Diagonal win",
			board: [3][3]int{
				{1, 2, 0},
				{2, 1, 0},
				{0, 0, 1},
			},
			winner:   1,
			gameOver: true,
		},
		{
			name: "Draw",
			board: [3][3]int{
				{1, 2, 1},
				{1, 1, 2},
				{2, 1, 2},
			},
			winner:   0,
			gameOver: true,
		},
		{
			name: "Ongoing",
			board: [3][3]int{
				{1, 2, 0},
				{0, 1, 0},
				{0, 0, 0},
			},
			winner:   0,
			gameOver: false,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			winner, over := CheckWinner(tt.board)
			if winner != tt.winner {
				t.Errorf("CheckWinner() winner = %v, want %v", winner, tt.winner)
			}
			if over != tt.gameOver {
				t.Errorf("CheckWinner() over = %v, want %v", over, tt.gameOver)
			}
		})
	}
}

func TestValidateMove(t *testing.T) {
	state := NewMatchState("classic")
	state.Turn = "user1"
	state.Players["user1"] = &PlayerInfo{Mark: 1}

	// Valid Move
	err := ValidateMove(state, "user1", 0, 0)
	if err != nil {
		t.Errorf("Expected valid move to pass, got %v", err)
	}

	// Wrong Turn
	err = ValidateMove(state, "user2", 0, 0)
	if err != ErrNotPlayerTurn {
		t.Errorf("Expected ErrNotPlayerTurn, got %v", err)
	}

	// Occupied Cell
	state.Board[1][1] = 1
	err = ValidateMove(state, "user1", 1, 1)
	if err != ErrCellOccupied {
		t.Errorf("Expected ErrCellOccupied, got %v", err)
	}

	// Out of Bounds
	err = ValidateMove(state, "user1", 3, 0)
	if err != ErrOutOfBounds {
		t.Errorf("Expected ErrOutOfBounds, got %v", err)
	}
}
