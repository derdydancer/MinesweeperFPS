import { useEffect, useRef } from 'react';
import { useThree, useFrame } from '@react-three/fiber';
import { Vector3, Raycaster, Group } from 'three';
import { PointerLockControls } from '@react-three/drei';
import { useGameStore } from '../store/gameStore';

const MOVEMENT_SPEED = 8; // Reduced from 400 to 8 for more controlled movement

export function FPSControls() {
  const { camera, scene } = useThree();
  const controls = useRef<any>(null);
  const raycaster = useRef(new Raycaster());
  const moveForward = useRef(false);
  const moveBackward = useRef(false);
  const moveLeft = useRef(false);
  const moveRight = useRef(false);
  const velocity = useRef(new Vector3());
  const direction = useRef(new Vector3());
  const { revealCell, toggleFlag } = useGameStore();

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      switch (event.code) {
        case 'ArrowUp':
        case 'KeyW':
          moveForward.current = true;
          break;
        case 'ArrowDown':
        case 'KeyS':
          moveBackward.current = true;
          break;
        case 'ArrowLeft':
        case 'KeyA':
          moveLeft.current = true;
          break;
        case 'ArrowRight':
        case 'KeyD':
          moveRight.current = true;
          break;
      }
    };

    const onKeyUp = (event: KeyboardEvent) => {
      switch (event.code) {
        case 'ArrowUp':
        case 'KeyW':
          moveForward.current = false;
          break;
        case 'ArrowDown':
        case 'KeyS':
          moveBackward.current = false;
          break;
        case 'ArrowLeft':
        case 'KeyA':
          moveLeft.current = false;
          break;
        case 'ArrowRight':
        case 'KeyD':
          moveRight.current = false;
          break;
      }
    };

    const onClick = (event: MouseEvent) => {
      if (!controls.current?.isLocked) {
        controls.current?.lock();
        return;
      }

      if (!scene) return;

      // Find the game board group
      const gameBoard = scene.children.find(child => child instanceof Group) as Group | undefined;
      if (!gameBoard) return;

      // Update raycaster
      const controlObject = controls.current.getObject();
      raycaster.current.ray.origin.copy(controlObject.position);
      raycaster.current.ray.direction
        .set(0, 0, -1)
        .unproject(camera)
        .sub(controlObject.position)
        .normalize();

      // Only check intersections with the game board cells
      const intersects = raycaster.current.intersectObjects(
        gameBoard.children.flatMap(group => group.children),
        true
      );

      if (intersects.length > 0) {
        const cell = intersects[0].object.userData;
        if (cell && typeof cell.x === 'number' && typeof cell.y === 'number') {
          if (event.button === 0) { // Left click
            revealCell(cell.x, cell.y);
          } else if (event.button === 2) { // Right click
            toggleFlag(cell.x, cell.y);
          }
        }
      }
    };

    document.addEventListener('keydown', onKeyDown);
    document.addEventListener('keyup', onKeyUp);
    document.addEventListener('mousedown', onClick);
    document.addEventListener('contextmenu', (e) => e.preventDefault());

    return () => {
      document.removeEventListener('keydown', onKeyDown);
      document.removeEventListener('keyup', onKeyUp);
      document.removeEventListener('mousedown', onClick);
    };
  }, [camera, scene, revealCell, toggleFlag]);

  useFrame(() => {
    if (controls.current?.isLocked) {
      const delta = 0.1;

      velocity.current.x -= velocity.current.x * 10.0 * delta;
      velocity.current.z -= velocity.current.z * 10.0 * delta;

      direction.current.z = Number(moveForward.current) - Number(moveBackward.current);
      direction.current.x = Number(moveRight.current) - Number(moveLeft.current);
      direction.current.normalize();

      if (moveForward.current || moveBackward.current) {
        velocity.current.z -= direction.current.z * MOVEMENT_SPEED * delta;
      }
      if (moveLeft.current || moveRight.current) {
        velocity.current.x -= direction.current.x * MOVEMENT_SPEED * delta;
      }

      controls.current.moveRight(-velocity.current.x * delta);
      controls.current.moveForward(-velocity.current.z * delta);
    }
  });

  return <PointerLockControls ref={controls} />;
}