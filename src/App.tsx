import { Canvas } from '@react-three/fiber';
import { Sky, Stars } from '@react-three/drei';
import { GameBoard } from './components/GameBoard';
import { FPSControls } from './components/FPSControls';
import { useGameStore } from './store/gameStore';
import { useEffect } from 'react';

function App() {
  const initializeBoard = useGameStore((state) => state.initializeBoard);
  const { gameOver, won } = useGameStore();

  useEffect(() => {
    initializeBoard(10, 10, 10); // 10x10 board with 10 mines
  }, [initializeBoard]);

  return (
    <div className="h-screen w-screen">
      <div className="absolute top-4 left-1/2 transform -translate-x-1/2 text-white text-center z-10 bg-black/50 p-4 rounded-lg">
        <h1 className="text-2xl font-bold mb-2">FPS Minesweeper</h1>
        <p>Click to start • WASD/Arrows to move • Mouse to look</p>
        <p>Left Click: Reveal • Right Click: Flag</p>
      </div>

      {/* Crosshair */}
      <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 pointer-events-none z-10">
        <div className="w-4 h-4">
          <div className="absolute w-full h-0.5 bg-white/80 top-1/2 -translate-y-1/2" />
          <div className="absolute h-full w-0.5 bg-white/80 left-1/2 -translate-x-1/2" />
        </div>
      </div>

      {/* Game Over / Win Message */}
      {(gameOver || won) && (
        <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-20">
          <div className={`text-4xl font-bold ${won ? 'text-green-500' : 'text-red-500'} bg-black/70 p-6 rounded-lg`}>
            {won ? 'YOU WIN!' : 'GAME OVER'}
          </div>
        </div>
      )}

      <Canvas camera={{ position: [0, 2, 5], fov: 75 }}>
        <Sky sunPosition={[100, 20, 100]} />
        <Stars radius={50} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 10]} intensity={1} />
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.5, 0]} receiveShadow>
          <planeGeometry args={[100, 100]} />
          <meshStandardMaterial color="#1a1a1a" />
        </mesh>
        <GameBoard />
        <FPSControls />
      </Canvas>
    </div>
  );
}

export default App;