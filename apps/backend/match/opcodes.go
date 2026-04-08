package match

const (
	// OpCodeGameStart: Server -> Client
	// Payload: { board, players, turn, marks, mode }
	OpCodeGameStart int64 = 1

	// OpCodeStateUpdate: Server -> Client
	// Payload: { board, turn, lastMove, timer }
	OpCodeStateUpdate int64 = 2

	// OpCodeGameOver: Server -> Client
	// Payload: { winner, board, reason }
	OpCodeGameOver int64 = 3

	// OpCodePlayerMove: Client -> Server
	// Payload: { row, col }
	OpCodePlayerMove int64 = 4

	// OpCodeInvalidMove: Server -> Client
	// Payload: { reason }
	OpCodeInvalidMove int64 = 5

	// OpCodeTimerUpdate: Server -> Client
	// Payload: { remainingTime }
	OpCodeTimerUpdate int64 = 6

	// OpCodeOpponentLeft: Server -> Client
	// Payload: {}
	OpCodeOpponentLeft int64 = 7
)
