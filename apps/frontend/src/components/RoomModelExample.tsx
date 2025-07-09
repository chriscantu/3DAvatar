import React, { useState } from 'react';
import { RoomPresets } from './RoomPresets';
import { 
  UI_CONFIG, 
  FURNITURE_POSITIONS, 
  MODEL_PATHS, 
  AVATAR_CONFIG 
} from '../config/roomConstants';

const ROOM_MODES = {
  GEOMETRIC: 'geometric',
  BASIC_FURNITURE: 'basic-furniture',
  COMPLETE: 'complete',
  COMPLETE_ENVIRONMENT: 'complete-environment',
  MODERN: 'modern',
  CUSTOM: 'custom',
} as const;

const AVATAR_STATES = {
  IDLE: 'idle',
  SPEAKING: 'speaking',
  TYPING: 'typing',
  ANIMATED: 'animated',
} as const;

const CONTROL_PANEL_STYLES = {
  POSITION: 'absolute' as const,
  TOP: UI_CONFIG.CONTROL_PANEL.POSITION.TOP,
  LEFT: UI_CONFIG.CONTROL_PANEL.POSITION.LEFT,
  Z_INDEX: UI_CONFIG.CONTROL_PANEL.Z_INDEX,
  BACKGROUND: UI_CONFIG.CONTROL_PANEL.BACKGROUND,
  PADDING: UI_CONFIG.CONTROL_PANEL.PADDING,
  BORDER_RADIUS: UI_CONFIG.CONTROL_PANEL.BORDER_RADIUS,
  COLOR: UI_CONFIG.CONTROL_PANEL.COLOR,
  FONT_FAMILY: UI_CONFIG.CONTROL_PANEL.FONT_FAMILY,
  MAX_WIDTH: '300px',
};

const BUTTON_STYLES = {
  MARGIN: '5px',
  PADDING: '8px 12px',
  BACKGROUND: '#444',
  COLOR: 'white',
  BORDER: 'none',
  BORDER_RADIUS: '4px',
  CURSOR: 'pointer',
};

const ACTIVE_BUTTON_STYLES = {
  ...BUTTON_STYLES,
  BACKGROUND: '#666',
};

const RoomModelExample: React.FC = () => {
  const [roomMode, setRoomMode] = useState<keyof typeof ROOM_MODES>('GEOMETRIC');
  const [avatarState, setAvatarState] = useState<keyof typeof AVATAR_STATES>('IDLE');
  const [customModels, setCustomModels] = useState([
    {
      url: MODEL_PATHS.ROOM.BED,
      position: FURNITURE_POSITIONS.BED as [number, number, number],
      name: 'custom-bed'
    }
  ]);

  const getAvatarProps = () => {
    switch (avatarState) {
      case 'SPEAKING':
        return {
          isAvatarSpeaking: true,
          userIsTyping: false,
          lastMessageLength: 50,
          timeSinceLastMessage: 1000
        };
      case 'TYPING':
        return {
          isAvatarSpeaking: false,
          userIsTyping: true,
          lastMessageLength: 0,
          timeSinceLastMessage: 0
        };
      case 'ANIMATED':
        return {
          isAvatarSpeaking: true,
          userIsTyping: true,
          lastMessageLength: 75,
          timeSinceLastMessage: 2000
        };
      default:
        return {
          isAvatarSpeaking: false,
          userIsTyping: false,
          lastMessageLength: 0,
          timeSinceLastMessage: 5000
        };
    }
  };

  const addCustomModel = () => {
    setCustomModels([
      ...customModels,
      {
        url: MODEL_PATHS.ROOM.CHAIR,
        position: [Math.random() * 4 - 2, 0, Math.random() * 4 - 2] as [number, number, number],
        name: `custom-model-${customModels.length + 1}`
      }
    ]);
  };

  const clearCustomModels = () => {
    setCustomModels([]);
  };

  const renderRoom = () => {
    const avatarProps = getAvatarProps();
    
    switch (roomMode) {
      case 'BASIC_FURNITURE':
        return <RoomPresets.BasicFurniture {...avatarProps} />;
      case 'COMPLETE':
        return <RoomPresets.Complete {...avatarProps} />;
      case 'COMPLETE_ENVIRONMENT':
        return <RoomPresets.CompleteEnvironment {...avatarProps} />;
      case 'MODERN':
        return <RoomPresets.Modern {...avatarProps} />;
      case 'CUSTOM':
        return <RoomPresets.Custom furnitureModels={customModels} {...avatarProps} />;
      default:
        return <RoomPresets.Geometric {...avatarProps} />;
    }
  };

  return (
    <div style={{ width: '100vw', height: '100vh', position: 'relative' }}>
      {renderRoom()}
      
      {/* Control Panel */}
      <div style={CONTROL_PANEL_STYLES}>
        <h3 style={{ margin: '0 0 10px 0' }}>Room Model Demo</h3>
        
        <div style={{ marginBottom: '15px' }}>
          <h4 style={{ margin: '0 0 5px 0' }}>Room Mode:</h4>
          {Object.entries(ROOM_MODES).map(([key, value]) => (
            <button
              key={key}
              style={roomMode === key ? ACTIVE_BUTTON_STYLES : BUTTON_STYLES}
              onClick={() => setRoomMode(key as keyof typeof ROOM_MODES)}
            >
              {value.replace('-', ' ').toUpperCase()}
            </button>
          ))}
        </div>
        
        <div style={{ marginBottom: '15px' }}>
          <h4 style={{ margin: '0 0 5px 0' }}>Avatar State:</h4>
          {Object.entries(AVATAR_STATES).map(([key, value]) => (
            <button
              key={key}
              style={avatarState === key ? ACTIVE_BUTTON_STYLES : BUTTON_STYLES}
              onClick={() => setAvatarState(key as keyof typeof AVATAR_STATES)}
            >
              {value.toUpperCase()}
            </button>
          ))}
        </div>
        
        {roomMode === 'CUSTOM' && (
          <div style={{ marginBottom: '15px' }}>
            <h4 style={{ margin: '0 0 5px 0' }}>Custom Models:</h4>
            <button style={BUTTON_STYLES} onClick={addCustomModel}>
              Add Model
            </button>
            <button style={BUTTON_STYLES} onClick={clearCustomModels}>
              Clear All
            </button>
            <p style={{ margin: '5px 0', fontSize: '12px' }}>
              Models: {customModels.length}
            </p>
          </div>
        )}
        
        <div style={{ fontSize: '12px', opacity: 0.8, marginTop: '10px' }}>
          <p>Use mouse to orbit camera</p>
          <p>Scroll to zoom in/out</p>
          <p>Models load from /models/room/</p>
        </div>
      </div>
    </div>
  );
};

export default RoomModelExample; 