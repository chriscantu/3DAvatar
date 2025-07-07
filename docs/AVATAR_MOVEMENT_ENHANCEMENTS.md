# Avatar Movement Enhancement Plan

## Phase 1: Enhanced Movement Patterns (In Progress)

### Current State
- Basic breathing animation (subtle head movement)
- Mouth animation when speaking (scale changes)
- Tail wagging with intensity based on speaking state
- Static positioning and simple animations

### Phase 1 Enhancements

#### 1. Interactive Positioning System
- **Turn Toward User**: Avatar rotates slightly when user is typing
- **Attention States**: Different postures for listening vs. speaking vs. idle
- **Dynamic Positioning**: Avatar shifts weight and adjusts stance based on conversation flow

#### 2. Enhanced Body Language
- **Ear Movement**: Ears perk up when receiving messages, relax during idle
- **Head Tilting**: Subtle head tilts to show curiosity or confusion
- **Posture Changes**: Sitting, standing, leaning forward for engagement
- **Paw Gestures**: Front paws move to emphasize points or show excitement

#### 3. Conversation Flow Animations
- **Listening Mode**: Ears forward, slight lean in, attentive posture
- **Thinking Mode**: Head tilt, ear twitch, subtle movement while processing
- **Speaking Mode**: More animated mouth, tail wagging, engaged posture
- **Idle Mode**: Relaxed breathing, occasional stretching, natural movements

#### 4. Timing and Transitions
- **Smooth Transitions**: Natural movement between states
- **Anticipatory Movements**: Avatar prepares for responses before they appear
- **Realistic Timing**: Movements match natural conversation rhythm

### Implementation Strategy

1. **Enhance Avatar Component**: Add new animation states and movement patterns
2. **Extend Movement Props**: Add conversation state and user interaction props
3. **Create Animation Controller**: Centralized system for managing movement states
4. **Integrate with Chat**: Connect movement patterns to chat interface events

### Technical Implementation

#### New Animation States
```typescript
type AvatarState = 'idle' | 'listening' | 'thinking' | 'speaking' | 'excited' | 'curious';
type MovementIntensity = 'subtle' | 'moderate' | 'animated';
```

#### Enhanced Props Interface
```typescript
interface AvatarProps {
  position?: [number, number, number];
  isSpeaking?: boolean;
  conversationState?: AvatarState;
  userIsTyping?: boolean;
  movementIntensity?: MovementIntensity;
  lastMessageLength?: number;
  timeSinceLastMessage?: number;
}
```

#### Movement Controller
- State management for avatar animations
- Smooth transitions between movement patterns
- Timing controls for realistic behavior
- Integration with chat interface events

### Success Metrics
- Avatar responds within 200ms to user interactions
- Smooth transitions between all movement states
- Natural-looking body language that enhances conversation
- No performance impact on 3D rendering

## Phase 2: Emotional Response System (Planned)
- Facial expressions based on detected emotions
- Color changes for different emotional states
- Intensity variations based on emotional analysis
- Integration with EmotionalIntelligence service

## Phase 3: Context-Aware Animations (Planned)
- Topic-specific gestures and movements
- Intent-based animation patterns
- Memory integration for personalized responses
- Conversation history awareness

## Phase 4: Advanced Gesture System (Planned)
- Complex gesture combinations
- Storytelling animations
- Interactive elements (pointing, demonstrating)
- Personality-driven movement patterns

## Phase 5: Memory Integration (Planned)
- Recognition animations for returning users
- Reference gestures for past conversations
- Personalized movement preferences
- Long-term behavior adaptation 