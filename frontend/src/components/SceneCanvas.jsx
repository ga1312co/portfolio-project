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
      const sceneSection = document.querySelector('.scene-section');
      if (!sceneSection) return;
      
      const sectionTop = sceneSection.offsetTop;
      const sectionHeight = sceneSection.offsetHeight;
      const scrollY = window.scrollY;
      
      // Calculate scroll progress within the scene section
      const sectionScrollStart = sectionTop;
      const sectionScrollEnd = sectionTop + sectionHeight - window.innerHeight;
      
      if (scrollY >= sectionScrollStart && scrollY <= sectionScrollEnd) {
        const sectionProgress = (scrollY - sectionScrollStart) / (sectionScrollEnd - sectionScrollStart);
        scrollRef.current = Math.min(Math.max(sectionProgress, 0), 1);
      } else if (scrollY < sectionScrollStart) {
        scrollRef.current = 0;
      } else {
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
    <Canvas 
      camera={{
        fov: 50,
        position: [-20, 15, -25]
      }} 
      shadows={{ type: "VSMShadowMap" }}
      style={{ width: '100%', height: '100%' }}
    >
      {/* First directional light with higher resolution shadows */}
      <directionalLight 
        position={[0, 15, 1]} 
        intensity={0.3}
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
        shadow-camera-near={1}
        shadow-camera-far={30}
        shadow-camera-left={-20}
        shadow-camera-right={20}
        shadow-camera-top={20}
        shadow-camera-bottom={-20}
        shadow-bias={-0.0005}
        shadow-normalBias={0.05}
      />

      {/* Second directional light with higher resolution shadows */}
      <directionalLight 
        position={[-20, 15, -8]} 
        intensity={0.4}
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
        shadow-camera-near={1}
        shadow-camera-far={30}
        shadow-camera-left={-20}
        shadow-camera-right={20}
        shadow-camera-top={20}
        shadow-camera-bottom={-20}
        shadow-bias={-0.001}
        shadow-normalBias={0.1}
      />

      {/* Soft ambient light */}
      <ambientLight intensity={0.5} />
      
      <Suspense fallback={null}>
        <WaitingRoomScene />
      </Suspense>
      <ScrollCameraController />
    </Canvas>
  );
}