import React, { useState, useCallback, useEffect } from 'react';
import type { UserSettings } from '../types/common';
import './Settings.css';

interface SettingsProps {
  isOpen: boolean;
  onClose: () => void;
  onSettingsChange: (settings: UserSettings) => void;
}

const defaultSettings: UserSettings = {
  theme: 'auto',
  voiceEnabled: true,
  voiceSpeed: 1,
  voiceVolume: 0.8,
  animationSpeed: 1,
  reducedMotion: false,
  fontSize: 'medium',
  highContrast: false,
  autoScroll: true,
  soundEffects: true,
  notifications: true,
};

const Settings: React.FC<SettingsProps> = ({ isOpen, onClose, onSettingsChange }) => {
  const [settings, setSettings] = useState<UserSettings>(defaultSettings);
  const [hasChanges, setHasChanges] = useState(false);

  // Load settings from localStorage on mount
  useEffect(() => {
    const savedSettings = localStorage.getItem('3davatar-settings');
    if (savedSettings) {
      try {
        const parsed = JSON.parse(savedSettings);
        setSettings({ ...defaultSettings, ...parsed });
      } catch (error) {
        console.error('Error loading settings:', error);
      }
    }
  }, []);

  // Save settings to localStorage and notify parent
  const saveSettings = useCallback((newSettings: UserSettings) => {
    setSettings(newSettings);
    localStorage.setItem('3davatar-settings', JSON.stringify(newSettings));
    onSettingsChange(newSettings);
    setHasChanges(false);
  }, [onSettingsChange]);

  // Handle setting changes
  const handleChange = useCallback(<K extends keyof UserSettings>(key: K, value: UserSettings[K]) => {
    const newSettings = { ...settings, [key]: value };
    setSettings(newSettings);
    setHasChanges(true);
  }, [settings]);

  // Handle save button click
  const handleSave = useCallback(() => {
    saveSettings(settings);
  }, [settings, saveSettings]);

  // Handle reset to defaults
  const handleReset = useCallback(() => {
    setSettings(defaultSettings);
    setHasChanges(true);
  }, []);

  // Handle close with confirmation if there are unsaved changes
  const handleClose = useCallback(() => {
    if (hasChanges) {
      const confirm = window.confirm('You have unsaved changes. Are you sure you want to close?');
      if (!confirm) return;
    }
    onClose();
  }, [hasChanges, onClose]);

  // Handle keyboard navigation
  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      handleClose();
    }
  }, [handleClose]);

  if (!isOpen) return null;

  return (
    <div className="settings-overlay" onClick={handleClose}>
      <div 
        className="settings-modal"
        onClick={(e) => e.stopPropagation()}
        onKeyDown={handleKeyDown}
        role="dialog"
        aria-modal="true"
        aria-labelledby="settings-title"
        tabIndex={-1}
      >
        <div className="settings-header">
          <h2 id="settings-title">Settings</h2>
          <button 
            onClick={handleClose}
            className="settings-close"
            aria-label="Close settings"
          >
            ×
          </button>
        </div>

        <div className="settings-content">
          {/* Theme Settings */}
          <section className="settings-section">
            <h3>Appearance</h3>
            <div className="setting-item">
              <label htmlFor="theme-select">Theme</label>
              <select 
                id="theme-select"
                value={settings.theme}
                onChange={(e) => handleChange('theme', e.target.value as UserSettings['theme'])}
              >
                <option value="light">Light</option>
                <option value="dark">Dark</option>
                <option value="auto">Auto</option>
              </select>
            </div>

            <div className="setting-item">
              <label htmlFor="font-size-select">Font Size</label>
              <select 
                id="font-size-select"
                value={settings.fontSize}
                onChange={(e) => handleChange('fontSize', e.target.value as UserSettings['fontSize'])}
              >
                <option value="small">Small</option>
                <option value="medium">Medium</option>
                <option value="large">Large</option>
              </select>
            </div>

            <div className="setting-item">
              <label className="setting-checkbox">
                <input
                  type="checkbox"
                  checked={settings.highContrast}
                  onChange={(e) => handleChange('highContrast', e.target.checked)}
                />
                <span className="checkbox-label">High Contrast</span>
              </label>
            </div>
          </section>

          {/* Voice Settings */}
          <section className="settings-section">
            <h3>Voice</h3>
            <div className="setting-item">
              <label className="setting-checkbox">
                <input
                  type="checkbox"
                  checked={settings.voiceEnabled}
                  onChange={(e) => handleChange('voiceEnabled', e.target.checked)}
                />
                <span className="checkbox-label">Enable Voice Input</span>
              </label>
            </div>

            <div className="setting-item">
              <label htmlFor="voice-speed">Voice Speed</label>
              <input
                id="voice-speed"
                type="range"
                min="0.5"
                max="2"
                step="0.1"
                value={settings.voiceSpeed}
                onChange={(e) => handleChange('voiceSpeed', parseFloat(e.target.value))}
              />
              <span className="range-value">{settings.voiceSpeed.toFixed(1)}x</span>
            </div>

            <div className="setting-item">
              <label htmlFor="voice-volume">Voice Volume</label>
              <input
                id="voice-volume"
                type="range"
                min="0"
                max="1"
                step="0.1"
                value={settings.voiceVolume}
                onChange={(e) => handleChange('voiceVolume', parseFloat(e.target.value))}
              />
              <span className="range-value">{Math.round(settings.voiceVolume * 100)}%</span>
            </div>
          </section>

          {/* Animation Settings */}
          <section className="settings-section">
            <h3>Animation</h3>
            <div className="setting-item">
              <label className="setting-checkbox">
                <input
                  type="checkbox"
                  checked={settings.reducedMotion}
                  onChange={(e) => handleChange('reducedMotion', e.target.checked)}
                />
                <span className="checkbox-label">Reduce Motion</span>
              </label>
            </div>

            <div className="setting-item">
              <label htmlFor="animation-speed">Animation Speed</label>
              <input
                id="animation-speed"
                type="range"
                min="0.5"
                max="2"
                step="0.1"
                value={settings.animationSpeed}
                onChange={(e) => handleChange('animationSpeed', parseFloat(e.target.value))}
              />
              <span className="range-value">{settings.animationSpeed.toFixed(1)}x</span>
            </div>
          </section>

          {/* General Settings */}
          <section className="settings-section">
            <h3>General</h3>
            <div className="setting-item">
              <label className="setting-checkbox">
                <input
                  type="checkbox"
                  checked={settings.autoScroll}
                  onChange={(e) => handleChange('autoScroll', e.target.checked)}
                />
                <span className="checkbox-label">Auto-scroll to new messages</span>
              </label>
            </div>

            <div className="setting-item">
              <label className="setting-checkbox">
                <input
                  type="checkbox"
                  checked={settings.soundEffects}
                  onChange={(e) => handleChange('soundEffects', e.target.checked)}
                />
                <span className="checkbox-label">Sound Effects</span>
              </label>
            </div>

            <div className="setting-item">
              <label className="setting-checkbox">
                <input
                  type="checkbox"
                  checked={settings.notifications}
                  onChange={(e) => handleChange('notifications', e.target.checked)}
                />
                <span className="checkbox-label">Notifications</span>
              </label>
            </div>
          </section>
        </div>

        <div className="settings-footer">
          <button 
            onClick={handleReset}
            className="settings-button settings-button--secondary"
          >
            Reset to Defaults
          </button>
          <div className="settings-actions">
            <button 
              onClick={handleClose}
              className="settings-button settings-button--secondary"
            >
              Cancel
            </button>
            <button 
              onClick={handleSave}
              className="settings-button settings-button--primary"
              disabled={!hasChanges}
            >
              Save Changes
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings; 