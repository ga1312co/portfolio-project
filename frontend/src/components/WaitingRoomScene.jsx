import { useGLTF } from '@react-three/drei';
import { useEffect, useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';

export default function WaitingRoomScene({ onHover, onMouseMove, hoveredProjectScreenshot, onReady }) {
  const { scene } = useGLTF('/models/WaitingRoom2.glb');
  const plantsRef = useRef([]);
  const clickablesRef = useRef([]);
  const { camera, gl } = useThree();
  const lastHoveredObjectNameRef = useRef(null);
  const computerMeshRef = useRef(null);
  const originalComputerTextureRef = useRef(null);

  // --- Scene Setup ---
  useEffect(() => {
    initializeSceneObjects();
    // Signal that scene is ready
    if (onReady) {
      onReady();
    }
  }, [scene, onReady]);

  function initializeSceneObjects() {
    plantsRef.current = [];
    clickablesRef.current = [];

    scene.traverse((child) => {
      if (child.isMesh) {
        enableShadows(child);
        fixMaterialEmissive(child);

        if (isPlantMesh(child)) {
          addPlantMesh(child);
        }
        if (isClickableMesh(child)) {
          clickablesRef.current.push(child);
          // console.log('🖱️ Found clickable object:', child.name);
        }
        if (isComputerMesh(child)) {
          computerMeshRef.current = child;
          if (!originalComputerTextureRef.current && child.material && child.material.map) {
            originalComputerTextureRef.current = child.material.map;
          }
        }
      }
    });
  }

  function enableShadows(mesh) {
    mesh.castShadow = true;
    mesh.receiveShadow = true;
  }

  function fixMaterialEmissive(mesh) {
    if (mesh.material) {
      if (Array.isArray(mesh.material)) {
        mesh.material.forEach(mat => {
          if (mat.emissive) mat.emissive = new THREE.Color(0x000000);
          mat.needsUpdate = true;
        });
      } else {
        if (mesh.material.emissive) {
          mesh.material.emissive = new THREE.Color(0x000000);
        }
        mesh.material.needsUpdate = true;
      }
    }
  }

  function isPlantMesh(child) {
    const plantNames = ['plant_leaves', 'plant_tree'];
    return plantNames.includes(child.name.toLowerCase());
  }

  function addPlantMesh(child) {
    plantsRef.current.push({
      mesh: child,
      originalRotation: child.rotation.clone(),
      originalPosition: child.position.clone(),
      animationOffset: Math.random() * Math.PI * 2,
      swayIntensity: child.name === 'plant_leaves' ? 0.03 : 0.015,
      name: child.name
    });
  }

  function isClickableMesh(child) {
    const clickableNames = ['clickable_projects', 'clickable_about', 'clickable_experience'];
    return clickableNames.some(name => child.name.toLowerCase().includes(name));
  }

  function isComputerMesh(child) {
    return child.name.toLowerCase().includes('clickable_projects');
  }

  // --- Mouse Hover Logic ---
  useEffect(() => {
    const canvas = gl.domElement;
    canvas.addEventListener('mousemove', handleCanvasMouseMove);
    return () => {
      canvas.removeEventListener('mousemove', handleCanvasMouseMove);
      canvas.style.cursor = 'default';
    };
    // eslint-disable-next-line
  }, [camera, gl, onHover, onMouseMove, scene]);

  function handleCanvasMouseMove(event) {
    const canvas = gl.domElement;
    const rect = canvas.getBoundingClientRect();

    if (onMouseMove) {
      onMouseMove({ x: event.clientX, y: event.clientY });
    }

    const mouse = getNormalizedMouseCoords(event, rect);
    const raycaster = new THREE.Raycaster();
    raycaster.setFromCamera(mouse, camera);

    if (clickablesRef.current.length > 0) {
      const intersects = raycaster.intersectObjects(clickablesRef.current);
      if (intersects.length > 0) {
        handleObjectHover(intersects[0].object, canvas);
      } else {
        handleNoObjectHover(canvas);
      }
    }
  }

  function getNormalizedMouseCoords(event, rect) {
    return {
      x: ((event.clientX - rect.left) / rect.width) * 2 - 1,
      y: -((event.clientY - rect.top) / rect.height) * 2 + 1
    };
  }

  function handleObjectHover(object, canvas) {
    const objectName = object.name;
    if (lastHoveredObjectNameRef.current !== objectName) {
      const bounds = getObjectScreenBounds(object);
      onHover({ name: objectName, bounds });
      lastHoveredObjectNameRef.current = objectName;
    }
    canvas.style.cursor = 'pointer';
  }

  function handleNoObjectHover(canvas) {
    if (lastHoveredObjectNameRef.current !== null) {
      onHover(null);
      lastHoveredObjectNameRef.current = null;
    }
    canvas.style.cursor = 'default';
  }

  function getObjectScreenBounds(object3D) {
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
  }

  // --- Plant Animation ---
  useFrame(({ clock }) => {
    animatePlants(clock.getElapsedTime());
  });

  function animatePlants(time) {
    plantsRef.current.forEach((plant) => {
      if (plant.name === 'plant_leaves') {
        animatePlantLeaves(plant, time);
      } else if (plant.name === 'plant_tree') {
        animatePlantTree(plant, time);
      }
    });
  }

  function animatePlantLeaves(plant, time) {
    const swayX = Math.sin(time * 1 + plant.animationOffset) * plant.swayIntensity;
    const swayZ = Math.cos(time * 1 + plant.animationOffset) * plant.swayIntensity * 0.7;
    plant.mesh.rotation.x = plant.originalRotation.x + swayX;
    plant.mesh.rotation.z = plant.originalRotation.z + swayZ;
    const bob = Math.sin(time * 1.2 + plant.animationOffset) * 0.01;
    plant.mesh.position.y = plant.originalPosition.y + bob;
  }

  function animatePlantTree(plant, time) {
    const swayX = Math.sin(time * 0.4 + plant.animationOffset) * plant.swayIntensity;
    const swayZ = Math.cos(time * 0.3 + plant.animationOffset) * plant.swayIntensity * 0.5;
    plant.mesh.rotation.x = plant.originalRotation.x + swayX;
    plant.mesh.rotation.z = plant.originalRotation.z + swayZ;
  }

  // --- Computer Screen Texture ---
  useEffect(() => {
    updateComputerScreenTexture();
  }, [hoveredProjectScreenshot]);

  function updateComputerScreenTexture() {
    if (computerMeshRef.current) {
      if (hoveredProjectScreenshot) {
        setComputerScreenTexture(hoveredProjectScreenshot);
      } else {
        resetComputerScreenTexture();
      }
    }
  }

  function setComputerScreenTexture(imageUrl) {
    const loader = new THREE.TextureLoader();
    loader.load(imageUrl, (texture) => {
      texture.flipY = false;
      computerMeshRef.current.material.map = texture;
      computerMeshRef.current.material.needsUpdate = true;
    });
  }

  function resetComputerScreenTexture() {
    if (originalComputerTextureRef.current) {
      computerMeshRef.current.material.map = originalComputerTextureRef.current;
      computerMeshRef.current.material.needsUpdate = true;
    }
  }

  // --- Render ---
  return <primitive object={scene} scale={9} />;
}