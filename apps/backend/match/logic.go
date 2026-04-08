package match

import (
	"errors"
)

var (
	ErrNotPlayerTurn = errors.New("not your turn")
	ErrCellOccupied  = errors.New("cell already occupied")
	ErrOutOfBounds   = errors.New("move out of bounds")
	ErrGameOver      = errors.New("game already over")
	ErrInvalidOpCode = errors.New("invalid operation code")
)

// ValidateMove checks if a move is legal given the current state.
func ValidateMove(state *MatchState, userID string, row, col int) error {
	if state.GameOver {
		return ErrGameOver
	}

	if state.Turn != userID {
		return ErrNotPlayerTurn
	}

	if row < 0 || row > 2 || col < 0 || col > 2 {
		return ErrOutOfBounds
	}

	if state.Board[row][col] != 0 {
		return ErrCellOccupied
	}

	return nil
}

// CheckWinner checks the board for a winner or a draw.
// Returns: winner (0=none, 1=X, 2=O), gameOver (bool)
func CheckWinner(board [3][3]int) (int, bool) {
	// Rows
	for i := 0; i < 3; i++ {
		if board[i][0] != 0 && board[i][0] == board[i][1] && board[i][0] == board[i][2] {
			return board[i][0], true
		}
	}

	// Columns
	for i := 0; i < 3; i++ {
		if board[0][i] != 0 && board[0][i] == board[1][i] && board[0][i] == board[2][i] {
			return board[0][i], true
		}
	}

	// Diagonals
	if board[0][0] != 0 && board[0][0] == board[1][1] && board[0][0] == board[2][2] {
		return board[0][0], true
	}
	if board[0][2] != 0 && board[0][2] == board[1][1] && board[0][2] == board[2][0] {
		return board[0][2], true
	}

	// Check for Draw
	isFull := true
	for r := 0; r < 3; r++ {
		for c := 0; c < 3; c++ {
			if board[r][c] == 0 {
				isFull = false
				break
			}
		}
	}

	if isFull {
		return 0, true
	}

	return 0, false
}

// ApplyMove updates the board state with a player's move.
func ApplyMove(state *MatchState, userID string, row, col int) {
	player := state.Players[userID]
	state.Board[row][col] = player.Mark

	// Check for winner
	winnerMark, over := CheckWinner(state.Board)
	if over {
		state.GameOver = true
		if winnerMark != 0 {
			state.Winner = userID
		} else {
			state.Winner = "draw"
		}
		return
	}

	// Toggle Turn
	for _, id := range state.TurnOrder {
		if id != userID {
			state.Turn = id
			break
		}
	}

	// Reset timer for next turn
	if state.Mode == "timed" {
		state.TurnTimer = 30 // Reset to 30 seconds
	}
}
