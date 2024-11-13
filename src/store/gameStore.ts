import { create } from 'zustand';

interface Cell {
  isMine: boolean;
  isRevealed: boolean;
  isFlagged: boolean;
  neighborMines: number;
}

interface GameState {
  board: Cell[][];
  gameOver: boolean;
  won: boolean;
  initializeBoard: (width: number, height: number, mines: number) => void;
  revealCell: (x: number, y: number) => void;
  toggleFlag: (x: number, y: number) => void;
  resetGame: () => void;
}

const createBoard = (width: number, height: number, mines: number): Cell[][] => {
  // Initialize empty board
  const board: Cell[][] = Array(height).fill(null).map(() =>
    Array(width).fill(null).map(() => ({
      isMine: false,
      isRevealed: false,
      isFlagged: false,
      neighborMines: 0,
    }))
  );

  // Place mines
  let minesPlaced = 0;
  while (minesPlaced < mines) {
    const x = Math.floor(Math.random() * width);
    const y = Math.floor(Math.random() * height);
    if (!board[y][x].isMine) {
      board[y][x].isMine = true;
      minesPlaced++;
    }
  }

  // Calculate neighbor mines
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      if (!board[y][x].isMine) {
        let count = 0;
        for (let dy = -1; dy <= 1; dy++) {
          for (let dx = -1; dx <= 1; dx++) {
            const ny = y + dy;
            const nx = x + dx;
            if (ny >= 0 && ny < height && nx >= 0 && nx < width && board[ny][nx].isMine) {
              count++;
            }
          }
        }
        board[y][x].neighborMines = count;
      }
    }
  }

  return board;
};

export const useGameStore = create<GameState>((set, get) => ({
  board: [],
  gameOver: false,
  won: false,

  initializeBoard: (width, height, mines) => {
    set({
      board: createBoard(width, height, mines),
      gameOver: false,
      won: false,
    });
  },

  revealCell: (x, y) => {
    const { board, gameOver } = get();
    if (gameOver || board[y][x].isFlagged || board[y][x].isRevealed) return;

    const newBoard = [...board];
    
    const floodFill = (x: number, y: number) => {
      if (x < 0 || x >= board[0].length || y < 0 || y >= board.length) return;
      if (newBoard[y][x].isRevealed || newBoard[y][x].isFlagged) return;

      newBoard[y][x].isRevealed = true;

      if (newBoard[y][x].neighborMines === 0) {
        for (let dy = -1; dy <= 1; dy++) {
          for (let dx = -1; dx <= 1; dx++) {
            floodFill(x + dx, y + dy);
          }
        }
      }
    };

    if (board[y][x].isMine) {
      // Reveal all mines when game is over
      board.forEach((row, y) => {
        row.forEach((cell, x) => {
          if (cell.isMine) {
            newBoard[y][x].isRevealed = true;
          }
        });
      });
      set({ board: newBoard, gameOver: true });
    } else {
      floodFill(x, y);
      
      // Check for win
      let won = true;
      newBoard.forEach(row => {
        row.forEach(cell => {
          if (!cell.isMine && !cell.isRevealed) won = false;
        });
      });

      set({ board: newBoard, won });
    }
  },

  toggleFlag: (x, y) => {
    const { board, gameOver } = get();
    if (gameOver || board[y][x].isRevealed) return;

    const newBoard = [...board];
    newBoard[y][x].isFlagged = !newBoard[y][x].isFlagged;
    set({ board: newBoard });
  },

  resetGame: () => {
    const width = 10;
    const height = 10;
    const mines = 10;
    set({
      board: createBoard(width, height, mines),
      gameOver: false,
      won: false,
    });
  },
}));