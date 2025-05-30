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
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      scrollRef.current = scrollY / docHeight;
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
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

    const stepSize = 1 / totalSteps;
    const index = Math.floor(scrollT / stepSize);
    const nextIndex = Math.min(index + 1, totalSteps);
    const t = (scrollT - stepSize * index) / stepSize;

    const from = cameraPositions[index];
    const to = cameraPositions[nextIndex];

    camera.position.lerpVectors(from, to, t);
    camera.lookAt(0, 2.5, 0);
  });

  return null;
}

export default function SceneCanvas() {
  return (
    <Canvas camera={{fov: 50 }} shadows>
      <pointLight position={[5, 15, 5]} intensity={100} />
      <pointLight position={[-5, 15, -5]} intensity={100} />
      <pointLight position={[5, 15, -5]} intensity={100} />
      <pointLight position={[-5, 15, 5]} intensity={100} />
      <Suspense fallback={null}>
        <WaitingRoomScene />
      </Suspense>
      <ScrollCameraController />
    </Canvas>
  );
}