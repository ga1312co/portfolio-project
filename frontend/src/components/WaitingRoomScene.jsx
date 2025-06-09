import { useGLTF } from '@react-three/drei';
import { useEffect, useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';

export default function WaitingRoomScene({ onHover, onMouseMove }) {
  const { scene } = useGLTF('/models/WaitingRoom2.glb');
  const plantsRef = useRef([]);
  const clickablesRef = useRef([]);
  const { camera, gl } = useThree();
  const lastHoveredObjectNameRef = useRef(null);

  useEffect(() => {
    plantsRef.current = [];
    clickablesRef.current = [];

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
        
        // Find plants
        const plantNames = ['plant_leaves', 'plant_tree'];
        const isPlant = plantNames.includes(child.name.toLowerCase());
        
        if (isPlant) {
          plantsRef.current.push({
            mesh: child,
            originalRotation: child.rotation.clone(),
            originalPosition: child.position.clone(),
            animationOffset: Math.random() * Math.PI * 2,
            swayIntensity: child.name === 'plant_leaves' ? 0.03 : 0.015,
            name: child.name
          });
          console.log('🌱 Found plant to animate:', child.name);
        }

        // Find clickable objects - make case insensitive
        const clickableNames = ['clickable_projects', 'clickable_about', 'clickable_experience'];
        const isClickable = clickableNames.some(name => 
          child.name.toLowerCase().includes(name)
        );
        
        if (isClickable) {
          clickablesRef.current.push(child);
          console.log('🖱️ Found clickable object:', child.name);
        }
      }
    });
    
    console.log(`🌿 Found ${plantsRef.current.length} plants to animate`);
    console.log(`🖱️ Found ${clickablesRef.current.length} clickable objects`);
  }, [scene]);


  useEffect(() => {
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();

    const getObjectScreenBounds = (object3D) => {
      const box = new THREE.Box3().setFromObject(object3D);
      const corners = [
        new THREE.Vector3(box.min.x, box.min.y, box.min.z),
        new THREE.Vector3(box.min.x, box.min.y, box.max.z),
        new THREE.Vector3(box.min.x, box.max.y, box.min.z),
        new THREE.Vector3(box.min.x, box.max.y, box.max.z),
        new THREE.Vector3(box.max.x, box.min.y, box.min.z),
        new THREE.Vector3(box.max.x, box.min.y, box.max.z),
        new THREE.Vector3(box.max.x, box.max.y, box.min.z),
        new THREE.Vector3(box.max.x, box.max.y, box.max.z),
      ];

      const canvas = gl.domElement;
      const rect = canvas.getBoundingClientRect();
      let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;

      corners.forEach(corner => {
        const screenPos = corner.project(camera);
        const x = ((screenPos.x + 1) / 2) * rect.width + rect.left;
        const y = ((-screenPos.y + 1) / 2) * rect.height + rect.top;
        minX = Math.min(minX, x);
        maxX = Math.max(maxX, x);
        minY = Math.min(minY, y);
        maxY = Math.max(maxY, y);
      });
      return { left: minX, top: minY, right: maxX, bottom: maxY, width: maxX - minX, height: maxY - minY };
    };

    const handleMouseMove = (event) => {
      const canvas = gl.domElement;
      const rect = canvas.getBoundingClientRect();
      
      // onMouseMove is still called for general mouse tracking if needed by parent
      // but not strictly for popup positioning anymore.
      if (onMouseMove) {
        onMouseMove({ x: event.clientX, y: event.clientY });
      }
      
      mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
      
      raycaster.setFromCamera(mouse, camera);
      
      if (clickablesRef.current.length > 0) {
        const intersects = raycaster.intersectObjects(clickablesRef.current);
        
        if (intersects.length > 0) {
          const intersectedObject = intersects[0].object;
          const objectName = intersectedObject.name;
          if (lastHoveredObjectNameRef.current !== objectName) {
            const bounds = getObjectScreenBounds(intersectedObject);
            onHover({ name: objectName, bounds });
            lastHoveredObjectNameRef.current = objectName;
          }
          canvas.style.cursor = 'pointer';
        } else {
          if (lastHoveredObjectNameRef.current !== null) {
            onHover(null);
            lastHoveredObjectNameRef.current = null;
          }
          canvas.style.cursor = 'default';
        }
      }
    };

    const canvas = gl.domElement;
    canvas.addEventListener('mousemove', handleMouseMove);
    
    return () => {
      canvas.removeEventListener('mousemove', handleMouseMove);
      canvas.style.cursor = 'default';
    };
  }, [camera, gl, onHover, onMouseMove, scene]); // scene dependency for clickablesRef

  // Animation loop for plants
  useFrame(({ clock }) => {
    const time = clock.getElapsedTime();
    
    plantsRef.current.forEach((plant) => {
      if (plant.name === 'plant_leaves') {
        const swayX = Math.sin(time * 1 + plant.animationOffset) * plant.swayIntensity;
        const swayZ = Math.cos(time * 1 + plant.animationOffset) * plant.swayIntensity * 0.7;
        
        plant.mesh.rotation.x = plant.originalRotation.x + swayX;
        plant.mesh.rotation.z = plant.originalRotation.z + swayZ;
        
        const bob = Math.sin(time * 1.2 + plant.animationOffset) * 0.01;
        plant.mesh.position.y = plant.originalPosition.y + bob;
        
      } else if (plant.name === 'plant_tree') {
        const swayX = Math.sin(time * 0.4 + plant.animationOffset) * plant.swayIntensity;
        const swayZ = Math.cos(time * 0.3 + plant.animationOffset) * plant.swayIntensity * 0.5;
        
        plant.mesh.rotation.x = plant.originalRotation.x + swayX;
        plant.mesh.rotation.z = plant.originalRotation.z + swayZ;
      }
    });
  });

  return <primitive object={scene} scale={9} />;
}