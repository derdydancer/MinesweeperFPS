import { useRef } from 'react';
import { Text } from '@react-three/drei';
import { useGameStore } from '../store/gameStore';

const CELL_SIZE = 1;
const COLORS = {
  hidden: '#64748b',
  revealed: '#e2e8f0',
  flagged: '#ef4444',
  mine: '#000000',
};

const NUMBER_COLORS = [
  '#000000', // 0 - not used
  '#2563eb', // 1
  '#16a34a', // 2
  '#dc2626', // 3
  '#1e40af', // 4
  '#991b1b', // 5
  '#0891b2', // 6
  '#4c1d95', // 7
  '#1e293b', // 8
];

export function GameBoard() {
  const { board } = useGameStore();
  const boardRef = useRef<THREE.Group>(null);

  return (
    <group 
      ref={boardRef} 
      position={[-(board[0]?.length * CELL_SIZE) / 2, -0.5, -(board.length * CELL_SIZE) / 2]}
    >
      {board.map((row, y) =>
        row.map((cell, x) => (
          <group key={`${x}-${y}`} position={[x * CELL_SIZE, 0, y * CELL_SIZE]}>
            <mesh
              position={[CELL_SIZE / 2, 0, CELL_SIZE / 2]}
              userData={{ x, y }}
            >
              <boxGeometry args={[CELL_SIZE * 0.95, 0.1, CELL_SIZE * 0.95]} />
              <meshStandardMaterial
                color={
                  cell.isFlagged
                    ? COLORS.flagged
                    : cell.isRevealed
                    ? cell.isMine
                      ? COLORS.mine
                      : COLORS.revealed
                    : COLORS.hidden
                }
              />
            </mesh>
            {cell.isRevealed && !cell.isMine && cell.neighborMines > 0 && (
              <Text
                position={[CELL_SIZE / 2, 0.06, CELL_SIZE / 2]}
                rotation={[-Math.PI / 2, 0, 0]}
                fontSize={0.5}
                color={NUMBER_COLORS[cell.neighborMines]}
              >
                {cell.neighborMines}
              </Text>
            )}
          </group>
        ))
      )}
    </group>
  );
}