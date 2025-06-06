import { useGLTF } from '@react-three/drei';
import { useEffect, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

export default function WaitingRoomScene() {
  const { scene } = useGLTF('/models/WaitingRoom2.glb');
  const plantsRef = useRef([]);

  useEffect(() => {
    plantsRef.current = [];

    scene.traverse((child) => {
      if (child.isMesh) {
        // Enable shadows
        child.castShadow = true;
        child.receiveShadow = true;
        
        // Fix materials
        if (child.material) {
          if (Array.isArray(child.material)) {
            child.material.forEach(mat => {
              if (mat.emissive) mat.emissive = new THREE.Color(0x000000);
              mat.needsUpdate = true;
            });
          } else {
            if (child.material.emissive) {
              child.material.emissive = new THREE.Color(0x000000);
            }
            child.material.needsUpdate = true;
          }
        }
        
        // Find your specific plants by name
        const plantNames = ['plant_leaves', 'plant_tree'];
        const isPlant = plantNames.includes(child.name.toLowerCase());
        
        if (isPlant) {
          plantsRef.current.push({
            mesh: child,
            originalRotation: child.rotation.clone(),
            originalPosition: child.position.clone(),
            animationOffset: Math.random() * Math.PI * 2,
            swayIntensity: child.name === 'plant_leaves' ? 0.03 : 0.015, // Leaves sway more than tree
            name: child.name
          });
          console.log('🌱 Found plant to animate:', child.name);
        }
      }
    });
    
    console.log(`🌿 Found ${plantsRef.current.length} plants to animate`);
  }, [scene]);

  // Animation loop
  useFrame(({ clock }) => {
    const time = clock.getElapsedTime();
    
    plantsRef.current.forEach((plant) => {
      // Different animation styles for different plants
      if (plant.name === 'plant_leaves') {
        // Leaves: More dramatic swaying
        const swayX = Math.sin(time * 1 + plant.animationOffset) * plant.swayIntensity;
        const swayZ = Math.cos(time * 1 + plant.animationOffset) * plant.swayIntensity * 0.7;
        
        plant.mesh.rotation.x = plant.originalRotation.x + swayX;
        plant.mesh.rotation.z = plant.originalRotation.z + swayZ;
        
        // Slight vertical movement
        const bob = Math.sin(time * 1.2 + plant.animationOffset) * 0.01;
        plant.mesh.position.y = plant.originalPosition.y + bob;
        
      } else if (plant.name === 'plant_tree') {
        // Tree: Subtle swaying
        const swayX = Math.sin(time * 0.4 + plant.animationOffset) * plant.swayIntensity;
        const swayZ = Math.cos(time * 0.3 + plant.animationOffset) * plant.swayIntensity * 0.5;
        
        plant.mesh.rotation.x = plant.originalRotation.x + swayX;
        plant.mesh.rotation.z = plant.originalRotation.z + swayZ;
      }
    });
  });

  return <primitive object={scene} scale={9} />;
}