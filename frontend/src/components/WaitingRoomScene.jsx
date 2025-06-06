import { useGLTF } from '@react-three/drei';
import { useEffect } from 'react';
import * as THREE from 'three';

export default function WaitingRoomScene() {
  const { scene } = useGLTF('/models/WaitingRoom2.glb');

  useEffect(() => {
    scene.traverse((child) => {
      if (child.isMesh) {
        // Enable shadows
        child.castShadow = true;
        child.receiveShadow = true;
        
        // Fix materials if they're too bright
        if (child.material) {
          // If material is an array (multi-material)
          if (Array.isArray(child.material)) {
            child.material.forEach(mat => {
              if (mat.emissive) mat.emissive = new THREE.Color(0x000000);
              mat.needsUpdate = true;
            });
          } else {
            // Single material
            if (child.material.emissive) {
              child.material.emissive = new THREE.Color(0x000000);
            }
            child.material.needsUpdate = true;
          }
        }
        
        // Debug: Log mesh info (you can remove this later)
        console.log('Mesh:', child.name, 'Material:', child.material?.type);
      }
    });
  }, [scene]);

  return <primitive object={scene} scale={10} />;
}