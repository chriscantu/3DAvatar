# Room GLB File Troubleshooting Guide

## Issue: Room GLB file not displaying in browser

### Problem Identified
The `ThreeDRoom` component was not configured to use 3D models, so it was defaulting to the geometric room instead of loading the GLB file.

### Solution Applied
Modified `apps/frontend/src/App.tsx` to enable room models:

```typescript
<ThreeDRoom 
  isAvatarSpeaking={isAvatarSpeaking}
  userIsTyping={userIsTyping}
  lastMessageLength={lastMessageLength}
  timeSinceLastMessage={timeSinceLastMessage}
  useRoomModels={true}                           // ✅ Added this
  roomModelUrl="/models/room/bedroom-complete.glb"  // ✅ Added this
/>
```

### File Structure Verified
- ✅ GLB file exists at: `apps/frontend/public/models/room/bedroom-complete.glb` (8.1MB)
- ✅ File is accessible at: `http://localhost:5173/models/room/bedroom-complete.glb`
- ✅ Development server is running on port 5173

### How to Test
1. **Open browser**: Navigate to `http://localhost:5173`
2. **Check console**: Look for these messages:
   - `"Attempting to load room model: /models/room/bedroom-complete.glb"`
   - `"Room model loaded successfully"`
   - `"Model positioned and scaled"`

### Troubleshooting Steps

#### 1. Check Browser Console
Open Developer Tools (F12) and look for:
- **Loading messages**: Model loading progress
- **Error messages**: Network errors or model parsing issues
- **WebGL errors**: Graphics card compatibility issues

#### 2. Verify Model File
```bash
# Check file exists and size
ls -la apps/frontend/public/models/room/bedroom-complete.glb

# Test direct access
curl -I http://localhost:5173/models/room/bedroom-complete.glb
```

#### 3. Common Issues and Solutions

**Issue**: "Failed to load model" error
**Solution**: 
- Check file path is correct
- Verify file is not corrupted
- Ensure file is under 10MB

**Issue**: Model loads but doesn't appear
**Solution**:
- Check camera position and zoom level
- Verify model scale (might be too small/large)
- Check lighting settings

**Issue**: Browser crashes or freezes
**Solution**:
- Model might be too complex
- Check WebGL compatibility
- Try a simpler model first

#### 4. Alternative Room Models
If the current model doesn't work, try these options:

```typescript
// Individual furniture pieces
<ThreeDRoom 
  useRoomModels={true}
  furnitureModels={[
    { url: "/models/room/bed.glb", position: [2, 0, 1] },
    { url: "/models/room/desk.glb", position: [-2, 0, 1] },
    { url: "/models/room/chair.glb", position: [-1.5, 0, 0.5] }
  ]}
/>

// Fallback to geometric room
<ThreeDRoom 
  useRoomModels={false}  // Uses geometric shapes
/>
```

### Model Requirements
- **Format**: GLTF/GLB preferred
- **Size**: Under 10MB for optimal performance
- **Textures**: Web-optimized (JPEG, PNG, WebP)
- **Complexity**: Reasonable polygon count for web

### Debug Mode
To enable detailed logging, add to browser console:
```javascript
localStorage.setItem('debug-room-models', 'true');
```

### Performance Tips
1. **Optimize models**: Use tools like Blender to reduce polygon count
2. **Compress textures**: Use web-optimized formats
3. **Use LOD**: Level of detail for distant objects
4. **Enable shadows carefully**: Can impact performance

### Next Steps
1. **Test in browser**: Visit `http://localhost:5173`
2. **Check console logs**: Look for loading messages
3. **Verify model appears**: Should see 3D room instead of geometric shapes
4. **Test interactions**: Camera controls should work with the model

### Support
If issues persist:
1. Check browser WebGL support: `chrome://gpu/`
2. Try different browser
3. Check graphics drivers
4. Test with simpler model first 