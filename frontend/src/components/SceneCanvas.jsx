// SceneCanvas.jsx
import { Canvas, useThree, useFrame } from '@react-three/fiber';
import { Suspense, useEffect, useRef } from 'react';
import * as THREE from 'three';
import WaitingRoomScene from './WaitingRoomScene';

function ScrollCameraController() {
  const { camera } = useThree();
  const scrollRef = useRef(0);

  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY;
      const cameraScrollHeight = window.innerHeight * 3.8; // 380vh for camera movement
      const pauseScrollHeight = window.innerHeight * 4.2; // 420vh - pause at final position
      
      if (scrollY <= cameraScrollHeight) {
        // Camera movement phase (0vh to 380vh)
        scrollRef.current = Math.min(Math.max(scrollY / cameraScrollHeight, 0), 1);
      } else if (scrollY <= pauseScrollHeight) {
        // Pause phase (380vh to 420vh) - stay at final camera position
        scrollRef.current = 1;
      } else {
        // Footer phase (after 420vh) - keep camera at final position
        scrollRef.current = 1;
      }
    };
    
    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });
    
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  const cameraPositions = [
    new THREE.Vector3(-20, 15, -25),
    new THREE.Vector3(-15, 12, -10),
    new THREE.Vector3(-10, 10, 0),
    new THREE.Vector3(-5, 8, 5)
  ];

  useFrame(() => {
    const scrollT = scrollRef.current;
    const totalSteps = cameraPositions.length - 1;

    if (totalSteps === 0) return;

    const stepSize = 1 / totalSteps;
    const index = Math.floor(scrollT / stepSize);
    const nextIndex = Math.min(index + 1, totalSteps);
    
    const localProgress = stepSize > 0 ? (scrollT - stepSize * index) / stepSize : 0;
    const t = Math.min(Math.max(localProgress, 0), 1);

    const from = cameraPositions[index] || cameraPositions[0];
    const to = cameraPositions[nextIndex] || cameraPositions[cameraPositions.length - 1];

    camera.position.lerpVectors(from, to, t);
    camera.lookAt(0, 2.5, 0);
  });

  return null;
}

export default function SceneCanvas() {
  return (
    <Canvas camera={{fov: 50 }} shadows>
      <pointLight position={[5, 15, 5]} intensity={80} />
      <pointLight position={[-5, 15, -5]} intensity={80} />
      <pointLight position={[5, 15, -5]} intensity={80} />
      <pointLight position={[-5, 15, 5]} intensity={80} />
      <Suspense fallback={null}>
        <WaitingRoomScene />
      </Suspense>
      <ScrollCameraController />
    </Canvas>
  );
}