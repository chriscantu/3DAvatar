import { useState, useCallback, useEffect, useRef } from 'react';

// Speech Recognition interfaces
interface SpeechRecognitionResult {
  [index: number]: {
    transcript: string;
    confidence: number;
  };
  isFinal: boolean;
}

interface SpeechRecognitionResults {
  [index: number]: SpeechRecognitionResult;
  length: number;
}

interface SpeechRecognitionEvent {
  results: SpeechRecognitionResults;
  resultIndex: number;
}

interface SpeechRecognitionErrorEvent {
  error: string;
}

interface SpeechRecognitionInterface {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  onstart: (() => void) | null;
  onresult: ((event: SpeechRecognitionEvent) => void) | null;
  onend: (() => void) | null;
  onerror: ((event: SpeechRecognitionErrorEvent) => void) | null;
  start(): void;
  stop(): void;
  abort(): void;
}

// Extend Window interface for webkitSpeechRecognition
declare global {
  interface Window {
    SpeechRecognition: new () => SpeechRecognitionInterface;
    webkitSpeechRecognition: new () => SpeechRecognitionInterface;
  }
}

/**
 * Custom hook for voice recognition functionality
 */
export const useVoiceService = () => {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSupported, setIsSupported] = useState(false);
  
  const recognitionRef = useRef<SpeechRecognitionInterface | null>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Check if speech recognition is supported
  useEffect(() => {
    const supported = 'SpeechRecognition' in window || 'webkitSpeechRecognition' in window;
    setIsSupported(supported);
  }, []);

  // Initialize speech recognition
  const initializeRecognition = useCallback(() => {
    if (!isSupported) return null;

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();

    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'en-US';

    recognition.onstart = () => {
      setIsListening(true);
      setError(null);
    };

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      let finalTranscript = '';
      let interimTranscript = '';

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          finalTranscript += transcript;
        } else {
          interimTranscript += transcript;
        }
      }

      setTranscript(finalTranscript || interimTranscript);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
      setIsListening(false);
      let errorMessage = 'Speech recognition error';
      
      switch (event.error) {
        case 'network':
          errorMessage = 'Network error during speech recognition';
          break;
        case 'not-allowed':
          errorMessage = 'Microphone access denied';
          break;
        case 'no-speech':
          errorMessage = 'No speech detected';
          break;
        case 'aborted':
          errorMessage = 'Speech recognition aborted';
          break;
        default:
          errorMessage = `Speech recognition error: ${event.error}`;
      }
      
      setError(errorMessage);
    };

    return recognition;
  }, [isSupported]);

  // Start listening
  const startListening = useCallback(() => {
    if (!isSupported) {
      setError('Speech recognition is not supported in this browser');
      return;
    }

    if (isListening) return;

    try {
      recognitionRef.current = initializeRecognition();
      if (recognitionRef.current) {
        recognitionRef.current.start();
        
        // Set timeout to auto-stop after 30 seconds
        timeoutRef.current = setTimeout(() => {
          stopListening();
        }, 30000);
      }
    } catch (error) {
      setError('Failed to start speech recognition');
      console.error('Speech recognition error:', error);
    }
  }, [isSupported, isListening, initializeRecognition]);

  // Stop listening
  const stopListening = useCallback(() => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      recognitionRef.current = null;
    }

    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }

    setIsListening(false);
  }, []);

  // Toggle listening
  const toggleListening = useCallback(() => {
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  }, [isListening, startListening, stopListening]);

  // Clear transcript
  const clearTranscript = useCallback(() => {
    setTranscript('');
  }, []);

  // Clear error
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.abort();
      }
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return {
    isListening,
    transcript,
    error,
    isSupported,
    startListening,
    stopListening,
    toggleListening,
    clearTranscript,
    clearError,
  };
};

// Legacy service object for backward compatibility
export const voiceService = {
  isSupported: typeof window !== 'undefined' && 
    ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window),
  
  speak: async (text: string): Promise<void> => {
    if (!('speechSynthesis' in window)) {
      throw new Error('Speech synthesis not supported');
    }

    return new Promise((resolve, reject) => {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 1;
      utterance.pitch = 1;
      utterance.volume = 1;
      
      utterance.onend = () => resolve();
      utterance.onerror = (error) => reject(error);
      
      speechSynthesis.speak(utterance);
    });
  },

  startListening: () => {
    console.warn('voiceService.startListening is deprecated. Use useVoiceService hook instead.');
  },

  stopListening: () => {
    console.warn('voiceService.stopListening is deprecated. Use useVoiceService hook instead.');
  }
};

export default { useVoiceService, voiceService }; 