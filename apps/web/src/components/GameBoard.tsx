import { cn } from "@/lib/utils";

interface GameBoardProps {
  board: number[][];
  onMove: (row: number, col: number) => void;
  disabled?: boolean;
}

export default function GameBoard({ board, onMove, disabled }: GameBoardProps) {
  return (
    <div className="grid grid-cols-3 gap-2 w-full max-w-[400px] aspect-square mx-auto">
      {board.map((row, rowIndex) =>
        row.map((cell, colIndex) => (
          <button
            key={`${rowIndex}-${colIndex}`}
            onClick={() => onMove(rowIndex, colIndex)}
            disabled={disabled || cell !== 0}
            className={cn(
              "flex items-center justify-center text-5xl font-black bg-muted/40 rounded-2xl hover:bg-muted/60 transition-all border-4 border-muted/20 aspect-square shadow-lg min-w-[80px] min-h-[80px] sm:min-w-[120px] sm:min-h-[120px]",
              cell === 1 && "text-blue-500",
              cell === 2 && "text-rose-500",
              (disabled || cell !== 0) && "cursor-not-allowed grayscale-[0.5] opacity-50"
            )}
          >
            {cell === 1 ? "X" : cell === 2 ? "O" : ""}
          </button>
        ))
      )}
    </div>
  );
}
