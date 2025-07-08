import React, { useRef, useEffect, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface ModelBasedAvatarProps {
  position?: [number, number, number];
  isSpeaking?: boolean;
}

const ModelBasedAvatar: React.FC<ModelBasedAvatarProps> = ({ 
  position = [0, 0, 0], 
  isSpeaking = false 
}) => {
  const groupRef = useRef<THREE.Group>(null);
  const [modelLoaded, setModelLoaded] = useState(false);
  const [error] = useState<string | null>(null);

  // For now, let's create a more realistic puppy using improved geometry
  // This will be a stepping stone to a full GLTF model
  const createRealisticPuppy = () => {
    const group = new THREE.Group();
    
    // Better materials with realistic properties
    const furMaterial = new THREE.MeshStandardMaterial({
      color: '#D2B48C',
      roughness: 0.8,
      metalness: 0.0,
    });
    
    const darkFurMaterial = new THREE.MeshStandardMaterial({
      color: '#8B4513',
      roughness: 0.8,
      metalness: 0.0,
    });
    
    const whiteFurMaterial = new THREE.MeshStandardMaterial({
      color: '#FFFFFF',
      roughness: 0.8,
      metalness: 0.0,
    });
    
    const blackMaterial = new THREE.MeshStandardMaterial({
      color: '#000000',
      roughness: 0.9,
      metalness: 0.0,
    });

    // Create a more realistic body shape
    const bodyGeometry = new THREE.SphereGeometry(0.25, 16, 16);
    bodyGeometry.scale(1.2, 0.8, 1.8); // Make it more dog-like
    const body = new THREE.Mesh(bodyGeometry, furMaterial);
    body.position.set(0, 0.1, 0);
    body.castShadow = true;
    group.add(body);

    // Head - more proportional
    const headGeometry = new THREE.SphereGeometry(0.18, 16, 16);
    headGeometry.scale(1.1, 1.0, 1.2);
    const head = new THREE.Mesh(headGeometry, furMaterial);
    head.position.set(0, 0.25, 0.35);
    head.castShadow = true;
    group.add(head);

    // Snout - more realistic shape
    const snoutGeometry = new THREE.SphereGeometry(0.08, 12, 12);
    snoutGeometry.scale(0.8, 0.6, 1.4);
    const snout = new THREE.Mesh(snoutGeometry, whiteFurMaterial);
    snout.position.set(0, 0.2, 0.5);
    snout.castShadow = true;
    group.add(snout);

    // Nose
    const noseGeometry = new THREE.SphereGeometry(0.025, 8, 8);
    const nose = new THREE.Mesh(noseGeometry, blackMaterial);
    nose.position.set(0, 0.22, 0.57);
    nose.castShadow = true;
    group.add(nose);

    // Eyes - made more visible and properly positioned
    const eyeGeometry = new THREE.SphereGeometry(0.05, 12, 12);
    const leftEye = new THREE.Mesh(eyeGeometry, new THREE.MeshStandardMaterial({ color: '#FFFFFF' }));
    leftEye.position.set(-0.1, 0.3, 0.5); // Base eye position
    leftEye.castShadow = true;
    group.add(leftEye);

    const rightEye = new THREE.Mesh(eyeGeometry, new THREE.MeshStandardMaterial({ color: '#FFFFFF' }));
    rightEye.position.set(0.1, 0.3, 0.5); // Base eye position
    rightEye.castShadow = true;
    group.add(rightEye);

    // Iris - colored part of the eye (made more prominent)
    const irisGeometry = new THREE.SphereGeometry(0.03, 12, 12);
    const irisColor = new THREE.MeshStandardMaterial({ 
      color: '#8B4513', // Brown iris color
      roughness: 0.3,
      metalness: 0.0
    });
    
    const leftIris = new THREE.Mesh(irisGeometry, irisColor);
    leftIris.position.set(-0.1, 0.3, 0.525); // More separation from eye
    group.add(leftIris);

    const rightIris = new THREE.Mesh(irisGeometry, irisColor);
    rightIris.position.set(0.1, 0.3, 0.525); // More separation from eye
    group.add(rightIris);

    // Pupils - smaller to show more iris
    const pupilGeometry = new THREE.SphereGeometry(0.015, 8, 8);
    const leftPupil = new THREE.Mesh(pupilGeometry, blackMaterial);
    leftPupil.position.set(-0.1, 0.3, 0.55); // Clear separation from iris
    group.add(leftPupil);

    const rightPupil = new THREE.Mesh(pupilGeometry, blackMaterial);
    rightPupil.position.set(0.1, 0.3, 0.55); // Clear separation from iris
    group.add(rightPupil);

    // Ears - moved forward and positioned more naturally
    const earGeometry = new THREE.SphereGeometry(0.08, 12, 12);
    earGeometry.scale(0.6, 1.5, 0.8);
    
    const leftEar = new THREE.Mesh(earGeometry, darkFurMaterial);
    leftEar.position.set(-0.12, 0.35, 0.35); // Moved forward from 0.25 to 0.35
    leftEar.rotation.set(0.3, 0, -0.4);
    leftEar.castShadow = true;
    group.add(leftEar);

    const rightEar = new THREE.Mesh(earGeometry, darkFurMaterial);
    rightEar.position.set(0.12, 0.35, 0.35); // Moved forward from 0.25 to 0.35
    rightEar.rotation.set(0.3, 0, 0.4);
    rightEar.castShadow = true;
    group.add(rightEar);

    // Legs - properly positioned on ground
    const legGeometry = new THREE.CylinderGeometry(0.03, 0.04, 0.25, 8);
    
    const frontLeftLeg = new THREE.Mesh(legGeometry, furMaterial);
    frontLeftLeg.position.set(-0.15, -0.05, 0.25);
    frontLeftLeg.castShadow = true;
    group.add(frontLeftLeg);

    const frontRightLeg = new THREE.Mesh(legGeometry, furMaterial);
    frontRightLeg.position.set(0.15, -0.05, 0.25);
    frontRightLeg.castShadow = true;
    group.add(frontRightLeg);

    const backLeftLeg = new THREE.Mesh(legGeometry, furMaterial);
    backLeftLeg.position.set(-0.15, -0.05, -0.15);
    backLeftLeg.castShadow = true;
    group.add(backLeftLeg);

    const backRightLeg = new THREE.Mesh(legGeometry, furMaterial);
    backRightLeg.position.set(0.15, -0.05, -0.15);
    backRightLeg.castShadow = true;
    group.add(backRightLeg);

    // Paws
    const pawGeometry = new THREE.SphereGeometry(0.045, 8, 8);
    pawGeometry.scale(1, 0.6, 1);
    
    const frontLeftPaw = new THREE.Mesh(pawGeometry, blackMaterial);
    frontLeftPaw.position.set(-0.15, -0.17, 0.25);
    frontLeftPaw.castShadow = true;
    group.add(frontLeftPaw);

    const frontRightPaw = new THREE.Mesh(pawGeometry, blackMaterial);
    frontRightPaw.position.set(0.15, -0.17, 0.25);
    frontRightPaw.castShadow = true;
    group.add(frontRightPaw);

    const backLeftPaw = new THREE.Mesh(pawGeometry, blackMaterial);
    backLeftPaw.position.set(-0.15, -0.17, -0.15);
    backLeftPaw.castShadow = true;
    group.add(backLeftPaw);

    const backRightPaw = new THREE.Mesh(pawGeometry, blackMaterial);
    backRightPaw.position.set(0.15, -0.17, -0.15);
    backRightPaw.castShadow = true;
    group.add(backRightPaw);

    // Tail - more realistic positioning and shape
    const tailGeometry = new THREE.CylinderGeometry(0.02, 0.04, 0.25, 8);
    const tail = new THREE.Mesh(tailGeometry, furMaterial);
    tail.position.set(0, 0.2, -0.35); // Raised up and moved closer to body
    tail.rotation.set(-0.3, 0, 0); // Angled upward like a happy puppy
    tail.castShadow = true;
    group.add(tail);

    // White chest marking
    const chestGeometry = new THREE.SphereGeometry(0.08, 12, 12);
    chestGeometry.scale(0.8, 1.2, 0.6);
    const chest = new THREE.Mesh(chestGeometry, whiteFurMaterial);
    chest.position.set(0, 0.05, 0.28);
    chest.castShadow = true;
    group.add(chest);

    return group;
  };

  useEffect(() => {
    if (groupRef.current) {
      // Clear existing children
      while (groupRef.current.children.length > 0) {
        groupRef.current.remove(groupRef.current.children[0]);
      }
      
      // Add the realistic puppy model
      const puppyModel = createRealisticPuppy();
      groupRef.current.add(puppyModel);
      setModelLoaded(true);
    }
  }, []);

  // Animation loop
  useFrame((state) => {
    if (!groupRef.current || !modelLoaded) return;

    const time = state.clock.getElapsedTime();
    
    // Gentle head movement
    if (groupRef.current.children[0]) {
      const puppyGroup = groupRef.current.children[0];
      if (isSpeaking) {
        puppyGroup.rotation.y = Math.sin(time * 3) * 0.1;
        puppyGroup.rotation.x = Math.sin(time * 2) * 0.05;
      } else {
        puppyGroup.rotation.y = Math.sin(time * 0.5) * 0.03;
        puppyGroup.rotation.x = Math.sin(time * 0.3) * 0.02;
      }
    }
  });

  if (error) {
    return (
      <group ref={groupRef} position={position}>
        <mesh>
          <boxGeometry args={[0.5, 0.5, 0.5]} />
          <meshStandardMaterial color="red" />
        </mesh>
      </group>
    );
  }

  return (
    <group ref={groupRef} position={position}>
      {/* Model will be added via useEffect */}
    </group>
  );
};

export default ModelBasedAvatar; 