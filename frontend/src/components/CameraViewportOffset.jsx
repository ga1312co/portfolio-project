// src/components/CameraViewportOffset.jsx
import { useEffect } from 'react';
import { useThree } from '@react-three/fiber';

// Helper function for easing
function easeInOutQuad(t) {
  return t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
}

export default function CameraViewportOffset({
  breakpoint = 768,       // The screen width to apply the offset below
  offsetX = -200,         // The target pixel offset
  scrollProgress = 0,     // The scroll progress from the parent
}) {
  const { camera, size } = useThree();

  useEffect(() => {
    // Guard clause: Don't run if the canvas size is not determined yet.
    if (size.width === 0 || size.height === 0) {
      return;
    }

    // Define the scroll range for the transition (from camera pos 1 to 2)
    // There are 4 positions, so 3 transitions. The first transition is from 0 to 1/3.
    const transitionStart = 0.0;
    const transitionEnd = 1 / 3;

    let currentOffsetX = 0;
    if (scrollProgress > transitionStart) {
      // Calculate how far into the transition we are, capped at 1
      const progress = Math.min((scrollProgress - transitionStart) / (transitionEnd - transitionStart), 1.0);
      const easedProgress = easeInOutQuad(progress);
      currentOffsetX = offsetX * easedProgress;
    }

    // Check if we are on a narrow screen
    if (size.width < breakpoint) {
      camera.setViewOffset(
        size.width,      // full width
        size.height,     // full height
        currentOffsetX,  // x offset (now driven by scroll)
        0,               // y offset
        size.width,      // viewport width
        size.height      // viewport height
      );
    } else {
      // Clear the offset on wider screens regardless of scroll
      camera.clearViewOffset();
    }

    // Cleanup on component unmount or when dependencies change
    return () => {
      // It's good practice to clear the offset when the component is unmounted
      // or before the effect re-runs.
      camera.clearViewOffset(); 
    };
  }, [camera, size, breakpoint, offsetX, scrollProgress]); // Effect now depends on scrollProgress

  return null;
}
