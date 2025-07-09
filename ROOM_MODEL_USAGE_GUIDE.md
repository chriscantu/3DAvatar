# Room Model Usage Guide

## Mandatory Rule: No Hardcoded Values

**IMPORTANT**: This codebase follows a strict **NO HARDCODED VALUES** policy. All numeric values, strings, colors, positions, and configuration must be defined in `apps/frontend/src/config/roomConstants.ts` and imported where needed.

### Why This Rule Exists
- **Maintainability**: Changes to room dimensions, colors, or positions only need to be made in one place
- **Consistency**: All components use the same values, preventing visual inconsistencies
- **Configurability**: Easy to adjust room layouts, furniture positions, and visual properties
- **Debugging**: Centralized constants make it easier to track down issues

## Quick Start

### 1. Basic Room with 3D Models

```tsx
import ThreeDRoom from './components/ThreeDRoom';
import { FURNITURE_POSITIONS, MODEL_PATHS } from './config/roomConstants';

function App() {
  return (
    <ThreeDRoom
      useRoomModels={true}
      furnitureModels={[
        {
          url: MODEL_PATHS.ROOM.BED,
          position: FURNITURE_POSITIONS.BED,
          name: 'bed'
        },
        {
          url: MODEL_PATHS.ROOM.DESK,
          position: FURNITURE_POSITIONS.DESK,
          name: 'desk'
        }
      ]}
    />
  );
}
```

### 2. Using Pre-configured Room Presets

```tsx
import { RoomPresets } from './components/RoomPresets';

function App() {
  return (
    <RoomPresets.CompleteRoom
      isAvatarSpeaking={true}
      userIsTyping={false}
    />
  );
}
```

### 3. Custom Room Configuration

```tsx
import { CustomRoom } from './components/RoomPresets';
import { FURNITURE_POSITIONS, MODEL_PATHS } from './config/roomConstants';

function App() {
  return (
    <CustomRoom
      furnitureModels={[
        {
          url: MODEL_PATHS.ROOM.MODERN_CHAIR,
          position: FURNITURE_POSITIONS.CHAIR,
          scale: 1.2,
          name: 'modern-chair'
        }
      ]}
    />
  );
}
```

## File Structure

```
apps/frontend/src/
├── config/
│   └── roomConstants.ts          # ALL constants and configuration
├── components/
│   ├── ThreeDRoom.tsx           # Main room component
│   ├── RoomModel.tsx            # Individual 3D model loader
│   ├── RoomModelHooks.ts        # Hooks for model management
│   ├── RoomModelComponents.tsx  # Pre-configured model components
│   ├── RoomPresets.tsx          # Room preset configurations
│   └── RoomModelExample.tsx     # Interactive demo
└── public/models/room/          # 3D model files
```

## Constants Configuration

All room configuration is centralized in `roomConstants.ts`:

### Room Dimensions & Positions
```typescript
export const ROOM_DIMENSIONS = {
  WIDTH: 10,
  HEIGHT: 4,
  DEPTH: 10,
  // ... more dimensions
} as const;

export const FURNITURE_POSITIONS = {
  BED: [-3.5, 0.5, -2] as [number, number, number],
  DESK: [3.5, 0.5, -3] as [number, number, number],
  // ... more positions
} as const;
```

### Colors & Materials
```typescript
export const ROOM_COLORS = {
  FLOOR: "#8B5FBF",
  WALLS: "#E6E6FA",
  // ... more colors
} as const;

export const FURNITURE_COLORS = {
  BED: "#FF69B4",
  DESK: "#8B4513",
  // ... more colors
} as const;
```

### Model Paths
```typescript
export const MODEL_PATHS = {
  ROOM: {
    BED: "/models/room/bed.glb",
    DESK: "/models/room/desk.glb",
    CHAIR: "/models/room/chair.glb",
    // ... more paths
  },
} as const;
```

## Component Usage

### ThreeDRoom Props

```typescript
interface ThreeDRoomProps {
  isAvatarSpeaking?: boolean;
  userIsTyping?: boolean;
  lastMessageLength?: number;
  timeSinceLastMessage?: number;
  useRoomModels?: boolean;        // Enable/disable 3D models
  roomModelUrl?: string;          // Complete room environment
  furnitureModels?: Array<{       // Individual furniture pieces
    url: string;
    position?: [number, number, number];
    rotation?: [number, number, number];
    scale?: [number, number, number] | number;
    name?: string;
  }>;
}
```

### RoomModel Props

```typescript
interface RoomModelProps {
  modelUrl: string;
  position?: [number, number, number];
  rotation?: [number, number, number];
  scale?: [number, number, number] | number;
  name?: string;
  onLoad?: () => void;
  onError?: (error: Error) => void;
}
```

## Adding New Constants

When adding new features, always add constants to `roomConstants.ts`:

```typescript
// ❌ DON'T DO THIS - Hardcoded values
<mesh position={[1, 2, 3]}>
  <boxGeometry args={[0.5, 0.5, 0.5]} />
  <meshStandardMaterial color="#FF0000" />
</mesh>

// ✅ DO THIS - Use constants
export const NEW_FURNITURE_POSITIONS = {
  LAMP: [1, 2, 3] as [number, number, number],
} as const;

export const NEW_FURNITURE_DIMENSIONS = {
  LAMP: [0.5, 0.5, 0.5] as [number, number, number],
} as const;

export const NEW_FURNITURE_COLORS = {
  LAMP: "#FF0000",
} as const;

// Then in component:
<mesh position={NEW_FURNITURE_POSITIONS.LAMP}>
  <boxGeometry args={NEW_FURNITURE_DIMENSIONS.LAMP} />
  <meshStandardMaterial color={NEW_FURNITURE_COLORS.LAMP} />
</mesh>
```

## Supported Model Formats

- **GLTF/GLB**: Preferred format for 3D models
- **File Size**: Keep models under 10MB for optimal loading
- **Textures**: Use web-optimized formats (JPEG, PNG, WebP)
- **Geometry**: Optimize polygon count for web performance

## Model Sources

- **Sketchfab**: High-quality models with proper licensing
- **Poly Haven**: Free CC0 models and textures
- **TurboSquid**: Professional models (check licensing)
- **Blender**: Create custom models

## Error Handling

The system includes comprehensive error handling:

```typescript
// Models automatically fall back to geometric room on error
const handleModelError = (error: Error) => {
  console.warn(`${ERROR_MESSAGES.FAILED_TO_LOAD_MODEL}, ${ERROR_MESSAGES.FALLING_BACK_TO_GEOMETRIC}:`, error);
  // Automatic fallback to geometric room
};
```

## Performance Considerations

1. **Model Optimization**: Use tools like `gltf-pipeline` to optimize models
2. **Texture Compression**: Use compressed texture formats when possible
3. **LOD (Level of Detail)**: Consider multiple model versions for different distances
4. **Lazy Loading**: Models load on-demand with proper loading states
5. **Memory Management**: Models are automatically cleaned up when unmounted

## Development Workflow

1. **Add Constants**: Define all values in `roomConstants.ts`
2. **Import Constants**: Import needed constants in components
3. **Use Constants**: Replace all hardcoded values with constants
4. **Test**: Verify changes work across all room modes
5. **Document**: Update this guide for new features

## Migration Guide

When updating existing code:

1. **Identify Hardcoded Values**: Look for numeric literals, color strings, position arrays
2. **Add to Constants**: Create appropriate constants in `roomConstants.ts`
3. **Import Constants**: Add imports to component files
4. **Replace Values**: Substitute hardcoded values with constants
5. **Test**: Ensure functionality remains the same

## Interactive Demo

Use `RoomModelExample` to test different configurations:

```tsx
import RoomModelExample from './components/RoomModelExample';

function App() {
  return <RoomModelExample />;
}
```

The demo includes:
- Room mode switching (geometric, basic furniture, complete, etc.)
- Avatar state testing (idle, speaking, typing, animated)
- Custom model addition and removal
- Real-time configuration changes

## Best Practices

1. **Consistent Naming**: Use descriptive constant names that match their purpose
2. **Logical Grouping**: Group related constants together (positions, colors, dimensions)
3. **Type Safety**: Use `as const` assertions for tuple types
4. **Documentation**: Comment complex constant calculations
5. **Validation**: Consider adding runtime validation for critical constants

## Troubleshooting

### Common Issues

1. **Model Not Loading**: Check file path in `MODEL_PATHS` constants
2. **Positioning Issues**: Verify positions in `FURNITURE_POSITIONS`
3. **Scaling Problems**: Check `DEFAULT_SCALES` constants
4. **Color Inconsistencies**: Ensure colors are defined in `ROOM_COLORS` or `FURNITURE_COLORS`

### Debug Tools

- Browser DevTools for network requests
- Three.js Inspector for 3D scene debugging
- Console logs for model loading status
- Performance profiler for optimization

This constants-based approach ensures maintainable, consistent, and easily configurable 3D room environments. 