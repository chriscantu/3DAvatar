import { useState, useEffect, useRef, useCallback } from 'react';

// Voice configuration interface
export interface VoiceConfig {
  rate: number;        // 0.1 to 10
  pitch: number;       // 0 to 2
  volume: number;      // 0 to 1
  voiceName?: string;  // Specific voice name
  lang: string;        // Language code
  age?: 'child' | 'teen' | 'adult' | 'elderly';
}

// Default configuration for a 10-year-old voice
export const CHILD_VOICE_CONFIG: VoiceConfig = {
  rate: 1.1,        // Slightly faster (children often speak faster)
  pitch: 1.8,       // Higher pitch for child-like voice
  volume: 0.9,      // Slightly lower volume for gentleness
  lang: 'en-US',
  age: 'child'
};

// Text-to-speech hook interface
export interface UseTextToSpeechReturn {
  speak: (text: string, config?: Partial<VoiceConfig>) => Promise<void>;
  stop: () => void;
  isSpeaking: boolean;
  isSupported: boolean;
  availableVoices: SpeechSynthesisVoice[];
  currentConfig: VoiceConfig;
  updateConfig: (config: Partial<VoiceConfig>) => void;
  error: string | null;
}

/**
 * Custom hook for text-to-speech functionality with child voice support
 */
export const useTextToSpeech = (initialConfig: VoiceConfig = CHILD_VOICE_CONFIG): UseTextToSpeechReturn => {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isSupported, setIsSupported] = useState(false);
  const [availableVoices, setAvailableVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [currentConfig, setCurrentConfig] = useState<VoiceConfig>(initialConfig);
  const [error, setError] = useState<string | null>(null);
  
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
  const currentVoiceRef = useRef<SpeechSynthesisVoice | null>(null);

  // Check if speech synthesis is supported
  useEffect(() => {
    const supported = 'speechSynthesis' in window && 'SpeechSynthesisUtterance' in window;
    setIsSupported(supported);
    
    if (!supported) {
      setError('Text-to-speech is not supported in this browser');
    }
  }, []);

  // Load available voices
  useEffect(() => {
    if (!isSupported) return;

    const loadVoices = () => {
      const voices = speechSynthesis.getVoices();
      setAvailableVoices(voices);
      
      // Find the best voice for the current configuration
      selectBestVoice(voices, currentConfig);
    };

    // Load voices immediately if available
    loadVoices();
    
    // Also listen for voice changes (some browsers load voices asynchronously)
    speechSynthesis.addEventListener('voiceschanged', loadVoices);
    
    return () => {
      speechSynthesis.removeEventListener('voiceschanged', loadVoices);
    };
  }, [isSupported, currentConfig]);

  // Select the best voice based on configuration
  const selectBestVoice = useCallback((voices: SpeechSynthesisVoice[], config: VoiceConfig) => {
    if (voices.length === 0) return;

    let selectedVoice: SpeechSynthesisVoice | null = null;

    // First, try to find a voice by name if specified
    if (config.voiceName) {
      selectedVoice = voices.find(voice => voice.name === config.voiceName) || null;
    }

    // If no specific voice found, find the best match based on age and characteristics
    if (!selectedVoice) {
      const languageVoices = voices.filter(voice => voice.lang.startsWith(config.lang.split('-')[0]));
      
      if (config.age === 'child') {
        // Look for voices that might sound younger
        selectedVoice = languageVoices.find(voice => 
          voice.name.toLowerCase().includes('child') ||
          voice.name.toLowerCase().includes('kid') ||
          voice.name.toLowerCase().includes('young') ||
          voice.name.toLowerCase().includes('girl') ||
          voice.name.toLowerCase().includes('boy')
        ) || null;
      }
      
      // If still no voice found, use the first available voice for the language
      if (!selectedVoice) {
        selectedVoice = languageVoices.find(voice => voice.lang === config.lang) ||
                      languageVoices[0] ||
                      voices[0] ||
                      null;
      }
    }

    currentVoiceRef.current = selectedVoice;
    console.log('Selected voice:', selectedVoice?.name, 'for age:', config.age);
  }, []);

  // Create speech utterance with current configuration
  const createUtterance = useCallback((text: string, config: VoiceConfig): SpeechSynthesisUtterance => {
    const utterance = new SpeechSynthesisUtterance(text);
    
    // Apply configuration
    utterance.rate = Math.max(0.1, Math.min(10, config.rate));
    utterance.pitch = Math.max(0, Math.min(2, config.pitch));
    utterance.volume = Math.max(0, Math.min(1, config.volume));
    utterance.lang = config.lang;
    
    // Set voice if available
    if (currentVoiceRef.current) {
      utterance.voice = currentVoiceRef.current;
    }

    // Event handlers
    utterance.onstart = () => {
      setIsSpeaking(true);
      setError(null);
      console.log('Started speaking:', text.substring(0, 50) + '...');
    };

    utterance.onend = () => {
      setIsSpeaking(false);
      utteranceRef.current = null;
      console.log('Finished speaking');
    };

    utterance.onerror = (event) => {
      setError(`Speech synthesis error: ${event.error}`);
      setIsSpeaking(false);
      utteranceRef.current = null;
      console.error('Speech synthesis error:', event.error);
    };

    return utterance;
  }, []);

  // Speak text with optional configuration override
  const speak = useCallback(async (text: string, configOverride?: Partial<VoiceConfig>): Promise<void> => {
    if (!isSupported) {
      throw new Error('Text-to-speech is not supported');
    }

    if (!text.trim()) {
      return;
    }

    // Stop any current speech
    stop();

    // Merge configuration
    const config = { ...currentConfig, ...configOverride };
    
    try {
      // Create and configure utterance
      const utterance = createUtterance(text, config);
      utteranceRef.current = utterance;
      
      // Start speaking
      speechSynthesis.speak(utterance);
      
      // Return a promise that resolves when speech ends
      return new Promise((resolve, reject) => {
        utterance.onend = () => {
          setIsSpeaking(false);
          utteranceRef.current = null;
          resolve();
        };
        
        utterance.onerror = (event) => {
          setError(`Speech synthesis error: ${event.error}`);
          setIsSpeaking(false);
          utteranceRef.current = null;
          reject(new Error(event.error));
        };
      });
    } catch (error) {
      setError(`Failed to start speech synthesis: ${error}`);
      throw error;
    }
  }, [isSupported, currentConfig, createUtterance]);

  // Stop speech
  const stop = useCallback(() => {
    if (speechSynthesis.speaking) {
      speechSynthesis.cancel();
    }
    setIsSpeaking(false);
    utteranceRef.current = null;
  }, []);

  // Update configuration
  const updateConfig = useCallback((newConfig: Partial<VoiceConfig>) => {
    const updatedConfig = { ...currentConfig, ...newConfig };
    setCurrentConfig(updatedConfig);
    
    // Re-select best voice if configuration changed
    if (availableVoices.length > 0) {
      selectBestVoice(availableVoices, updatedConfig);
    }
  }, [currentConfig, availableVoices, selectBestVoice]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stop();
    };
  }, [stop]);

  return {
    speak,
    stop,
    isSpeaking,
    isSupported,
    availableVoices,
    currentConfig,
    updateConfig,
    error
  };
}; 