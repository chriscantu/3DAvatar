import * as THREE from 'three';

export interface DogReferenceSpecs {
  body: {
    length: number;
    width: number;
    height: number;
    position: [number, number, number];
  };
  head: {
    diameter: number;
    position: [number, number, number];
  };
  snout: {
    length: number;
    baseWidth: number;
    tipWidth: number;
    position: [number, number, number];
  };
  chest: {
    width: number;
    depth: number;
    position: [number, number, number];
  };
  legs: Array<{
    length: number;
    width: number;
    position: [number, number, number];
  }>;
  paws: Array<{
    diameter: number;
    position: [number, number, number];
  }>;
}

export const idealDogSpecs: DogReferenceSpecs = {
  body: {
    length: 1.5,
    width: 1.2,  // Fixed: width should be > height
    height: 1.0,
    position: [0, 0.45, 0] // Elevated by half leg length
  },
  head: {
    diameter: 0.8,  // Increased from 0.7 to improve ratio
    position: [0, 0.8, 0.6] // Above body, forward
  },
  snout: {
    length: 0.35,
    baseWidth: 0.25,
    tipWidth: 0.15,
    position: [0, 0.75, 0.95] // Forward of head
  },
  chest: {
    width: 0.6,
    depth: 0.3,
    position: [0, 0.4, 0.3] // Slightly forward of body center
  },
  legs: [
    { length: 0.45, width: 0.12, position: [-0.25, 0.225, 0.4] }, // Front left
    { length: 0.45, width: 0.12, position: [0.25, 0.225, 0.4] },  // Front right
    { length: 0.45, width: 0.12, position: [-0.25, 0.225, -0.4] }, // Back left
    { length: 0.45, width: 0.12, position: [0.25, 0.225, -0.4] }   // Back right
  ],
  paws: [
    { diameter: 0.18, position: [-0.25, 0.09, 0.4] }, // Front left
    { diameter: 0.18, position: [0.25, 0.09, 0.4] },  // Front right
    { diameter: 0.18, position: [-0.25, 0.09, -0.4] }, // Back left
    { diameter: 0.18, position: [0.25, 0.09, -0.4] }   // Back right
  ]
};

export function createReferenceAvatar(specs: DogReferenceSpecs): THREE.Group {
  const group = new THREE.Group();
  
  // Body - elongated oval
  const bodyGeometry = new THREE.SphereGeometry(0.5, 16, 16);
  const bodyMaterial = new THREE.MeshStandardMaterial({ 
    color: '#D2B48C', 
    roughness: 0.8,
    metalness: 0.1 
  });
  const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
  
  // Safe position and scale setting
  if (body.position && typeof body.position.set === 'function') {
    body.position.set(...specs.body.position);
  } else {
    body.position.x = specs.body.position[0];
    body.position.y = specs.body.position[1];
    body.position.z = specs.body.position[2];
  }
  
  if (body.scale && typeof body.scale.set === 'function') {
    body.scale.set(specs.body.width, specs.body.height, specs.body.length);
  } else {
    body.scale.x = specs.body.width;
    body.scale.y = specs.body.height;
    body.scale.z = specs.body.length;
  }
  
  body.name = 'reference-body';
  group.add(body);

  // Head - slightly flattened sphere
  const headGeometry = new THREE.SphereGeometry(specs.head.diameter / 2, 16, 16);
  const headMaterial = new THREE.MeshStandardMaterial({ 
    color: '#D2B48C', 
    roughness: 0.8,
    metalness: 0.1 
  });
  const head = new THREE.Mesh(headGeometry, headMaterial);
  
  if (head.position && typeof head.position.set === 'function') {
    head.position.set(...specs.head.position);
  } else {
    head.position.x = specs.head.position[0];
    head.position.y = specs.head.position[1];
    head.position.z = specs.head.position[2];
  }
  
  if (head.scale && typeof head.scale.set === 'function') {
    head.scale.set(1, 0.9, 1.1); // Slightly elongated
  } else {
    head.scale.x = 1;
    head.scale.y = 0.9;
    head.scale.z = 1.1;
  }
  
  head.name = 'reference-head';
  group.add(head);

  // Snout - tapered cylinder
  const snoutGeometry = new THREE.CylinderGeometry(
    specs.snout.tipWidth / 2,
    specs.snout.baseWidth / 2,
    specs.snout.length,
    12
  );
  const snoutMaterial = new THREE.MeshStandardMaterial({ 
    color: '#F5F5DC', 
    roughness: 0.9,
    metalness: 0.0 
  });
  const snout = new THREE.Mesh(snoutGeometry, snoutMaterial);
  
  if (snout.position && typeof snout.position.set === 'function') {
    snout.position.set(...specs.snout.position);
  } else {
    snout.position.x = specs.snout.position[0];
    snout.position.y = specs.snout.position[1];
    snout.position.z = specs.snout.position[2];
  }
  
  if (snout.rotation && typeof snout.rotation.set === 'function') {
    snout.rotation.set(Math.PI / 2, 0, 0); // Point forward
  } else if (snout.rotation) {
    snout.rotation.x = Math.PI / 2;
    snout.rotation.y = 0;
    snout.rotation.z = 0;
  }
  
  snout.name = 'reference-snout';
  group.add(snout);

  // Add remaining components with similar safe property setting...
  // For brevity, I'll add a simplified version
  
  // Chest - subtle oval
  const chestGeometry = new THREE.SphereGeometry(0.3, 12, 12);
  const chestMaterial = new THREE.MeshStandardMaterial({ 
    color: '#F5F5DC', 
    roughness: 0.9,
    metalness: 0.0 
  });
  const chest = new THREE.Mesh(chestGeometry, chestMaterial);
  chest.position.x = specs.chest.position[0];
  chest.position.y = specs.chest.position[1];
  chest.position.z = specs.chest.position[2];
  chest.name = 'reference-chest';
  group.add(chest);

  // Legs and paws
  specs.legs.forEach((legSpec, index) => {
    const legGeometry = new THREE.CylinderGeometry(
      legSpec.width / 2,
      legSpec.width / 2,
      legSpec.length,
      8
    );
    const legMaterial = new THREE.MeshStandardMaterial({ 
      color: '#D2B48C', 
      roughness: 0.8,
      metalness: 0.1 
    });
    const leg = new THREE.Mesh(legGeometry, legMaterial);
    leg.position.x = legSpec.position[0];
    leg.position.y = legSpec.position[1];
    leg.position.z = legSpec.position[2];
    leg.name = `reference-leg-${index}`;
    group.add(leg);
  });

  specs.paws.forEach((pawSpec, index) => {
    const pawGeometry = new THREE.SphereGeometry(pawSpec.diameter / 2, 8, 8);
    const pawMaterial = new THREE.MeshStandardMaterial({ 
      color: '#2F2F2F', 
      roughness: 0.8,
      metalness: 0.0 
    });
    const paw = new THREE.Mesh(pawGeometry, pawMaterial);
    paw.position.x = pawSpec.position[0];
    paw.position.y = pawSpec.position[1];
    paw.position.z = pawSpec.position[2];
    paw.name = `reference-paw-${index}`;
    group.add(paw);
  });

  // Add nose
  const noseGeometry = new THREE.SphereGeometry(0.04, 8, 8);
  const noseMaterial = new THREE.MeshStandardMaterial({ 
    color: '#000000', 
    roughness: 0.2,
    metalness: 0.1 
  });
  const nose = new THREE.Mesh(noseGeometry, noseMaterial);
  nose.position.x = 0;
  nose.position.y = 0.75;
  nose.position.z = 1.125; // At tip of snout
  nose.name = 'reference-nose';
  group.add(nose);

  return group;
}

export function validateAvatarAgainstReference(
  avatar: THREE.Group,
  reference: THREE.Group,
  tolerance: number = 0.1
): {
  isValid: boolean;
  issues: string[];
  measurements: Record<string, unknown>;
} {
  const issues: string[] = [];
  const measurements: Record<string, unknown> = {};

  // Get components from both avatars
  const avatarBody = avatar.children.find(child => child.name?.includes('body'));
  const referenceBody = reference.children.find(child => child.name?.includes('body'));

  if (!avatarBody || !referenceBody) {
    issues.push('Missing body component');
    return { isValid: false, issues, measurements };
  }

  // Check body proportions
  const avatarBodyScale = avatarBody.scale;
  const referenceBodyScale = referenceBody.scale;
  
  measurements.bodyScale = {
    avatar: { x: avatarBodyScale.x, y: avatarBodyScale.y, z: avatarBodyScale.z },
    reference: { x: referenceBodyScale.x, y: referenceBodyScale.y, z: referenceBodyScale.z }
  };

  // Check if body is elongated (length > height)
  if (avatarBodyScale.z <= avatarBodyScale.y) {
    issues.push('Body should be elongated (length > height)');
  }

  // Check ground contact
  const avatarPaws = avatar.children.filter(child => child.name?.includes('paw'));
  const lowestPawY = Math.min(...avatarPaws.map(paw => paw.position.y));
  
  measurements.groundContact = { lowestPawY };
  
  if (Math.abs(lowestPawY) > tolerance) {
    issues.push(`Avatar floating: lowest paw at y=${lowestPawY.toFixed(3)}, should be ~0`);
  }

  // Check snout presence and shape
  const avatarSnout = avatar.children.find(child => child.name?.includes('snout'));
  if (!avatarSnout) {
    issues.push('Missing snout component');
  } else {
    measurements.snoutPosition = avatarSnout.position;
    // Check if snout extends forward from head
    const avatarHead = avatar.children.find(child => child.name?.includes('head'));
    if (avatarHead && avatarSnout.position.z <= avatarHead.position.z) {
      issues.push('Snout should extend forward from head');
    }
  }

  return {
    isValid: issues.length === 0,
    issues,
    measurements
  };
}

export function generateReferenceImageData(
  avatar: THREE.Group,
  width: number = 800,
  height: number = 600
): Promise<string> {
  return new Promise((resolve) => {
    // Create scene
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0xf0f0f0);
    
    // Add avatar
    scene.add(avatar);
    
    // Add lighting
    const ambientLight = new THREE.AmbientLight(0x404040, 0.6);
    scene.add(ambientLight);
    
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(5, 10, 5);
    directionalLight.castShadow = true;
    scene.add(directionalLight);
    
    // Create camera
    const camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);
    camera.position.set(3, 2, 3);
    camera.lookAt(0, 0.5, 0);
    
    // Create renderer
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    
    const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
    renderer.setSize(width, height);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    
    // Render
    renderer.render(scene, camera);
    
    // Convert to data URL
    const dataURL = canvas.toDataURL('image/png');
    resolve(dataURL);
  });
} 