// SceneCanvas.jsx
import { Canvas, useThree, useFrame } from '@react-three/fiber';
import { Suspense, useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import WaitingRoomScene from './WaitingRoomScene';
import HoverPopup from './HoverPopup';

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

  // Easing functions for smoother camera movement
  const easeInOutCubic = (t) => {
    return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
  };

  const easeInOutQuart = (t) => {
    return t < 0.5 ? 8 * t * t * t * t : 1 - Math.pow(-2 * t + 2, 4) / 2;
  };

  const easeOutBack = (t) => {
    const c1 = 1.70158;
    const c3 = c1 + 1;
    return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2);
  };

  // 4 Camera positions with their look-at targets
  const cameraSetup = [
    {
      position: new THREE.Vector3(-25, 12, -20),
      lookAt: new THREE.Vector3(0, 3, 0),
      name: "Position 1: Wide Overview"
    },
    {
      position: new THREE.Vector3(-1.1, 3.1, -4),
      lookAt: new THREE.Vector3(0, 3, -1),
      name: "Position 2: Projects View"
    },
    {
      position: new THREE.Vector3(1.5, 8.5, -1),
      lookAt: new THREE.Vector3(6, 8.5, 0.5),
      name: "Position 3: Experience View"
    },
    {
      position: new THREE.Vector3(5, 7, 6),
      lookAt: new THREE.Vector3(5, 2, 7),
      name: "Position 4: This Page View"
    }
  ];

  useFrame(() => {
    const scrollT = scrollRef.current;
    const totalSteps = cameraSetup.length - 1;

    if (totalSteps === 0) return;

    const stepSize = 1 / totalSteps;
    const index = Math.floor(scrollT / stepSize);
    const nextIndex = Math.min(index + 1, totalSteps);
    
    const localProgress = stepSize > 0 ? (scrollT - stepSize * index) / stepSize : 0;
    
    // Apply easing to the interpolation factor
    const easedT = easeInOutCubic(Math.min(Math.max(localProgress, 0), 1));

    // Get current and next camera setups
    const from = cameraSetup[index] || cameraSetup[0];
    const to = cameraSetup[nextIndex] || cameraSetup[cameraSetup.length - 1];

    // Interpolate position with easing
    camera.position.lerpVectors(from.position, to.position, easedT);
    
    // Interpolate look-at target with easing
    const lookAtTarget = new THREE.Vector3().lerpVectors(from.lookAt, to.lookAt, easedT);
    camera.lookAt(lookAtTarget);

  });

  return null;
}

export default function SceneCanvas() {
  const [hoveredObjectInfo, setHoveredObjectInfo] = useState(null);
  const [hoveredProjectScreenshot, setHoveredProjectScreenshot] = useState(null);

  const handleHover = (info) => {
    setHoveredObjectInfo(info);
  };

  // Called by HoverPopup when a project row is hovered
  const handleProjectHover = (screenshotUrl) => {
    setHoveredProjectScreenshot(screenshotUrl);
  };

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%' }}>
      <Canvas 
        camera={{
          fov: 50,
          position: [-25, 12, -20]
        }} 
        shadows={{ type: "VSMShadowMap" }}
        style={{ width: '100%', height: '100%' }}
      >
        {/* First directional light */}
        <directionalLight 
          position={[1, 15, 1]} 
          intensity={0.5}
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

        {/* Second directional light */}
        <directionalLight 
          position={[-10, 15, -8]} 
          intensity={0.6}
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
        <ambientLight intensity={0.6} />
        
        <Suspense fallback={null}>
          <WaitingRoomScene 
            onHover={handleHover}
            onMouseMove={() => {}} 
            hoveredProjectScreenshot={hoveredProjectScreenshot}
          />
        </Suspense>
        <ScrollCameraController />
      </Canvas>
      <HoverPopup 
        hoveredObjectInfo={hoveredObjectInfo}
        onProjectHover={handleProjectHover}
      />
    </div>
  );
}