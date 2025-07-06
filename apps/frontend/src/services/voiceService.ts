// Voice Service for Speech-to-Text and Text-to-Speech

// Type declarations for speech APIs
declare global {
  interface Window {
    SpeechRecognition: {
      new (): SpeechRecognition;
    };
    webkitSpeechRecognition: {
      new (): SpeechRecognition;
    };
  }
}

interface SpeechRecognition extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  onresult: ((event: SpeechRecognitionEvent) => void) | null;
  onerror: ((event: SpeechRecognitionErrorEvent) => void) | null;
  onend: (() => void) | null;
  start(): void;
  stop(): void;
}

interface SpeechRecognitionEvent extends Event {
  results: SpeechRecognitionResultList;
}

interface SpeechRecognitionResultList {
  [index: number]: SpeechRecognitionResult;
  length: number;
}

interface SpeechRecognitionResult {
  [index: number]: SpeechRecognitionAlternative;
  length: number;
}

interface SpeechRecognitionAlternative {
  transcript: string;
  confidence: number;
}

interface SpeechRecognitionErrorEvent extends Event {
  error: string;
}

export interface VoiceServiceInterface {
  startListening: (onResult: (text: string) => void, onError: (error: string) => void) => void;
  stopListening: () => void;
  speak: (text: string) => Promise<void>;
  isListening: boolean;
  isSupported: boolean;
}

class VoiceService implements VoiceServiceInterface {
  private recognition: SpeechRecognition | null = null;
  private synthesis: SpeechSynthesis | null = null;
  public isListening: boolean = false;
  public isSupported: boolean = false;

  constructor() {
    this.initializeServices();
  }

  private initializeServices() {
    // Check for Speech Recognition support
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      this.recognition = new SpeechRecognition();
      
      if (this.recognition) {
        this.recognition.continuous = false;
        this.recognition.interimResults = false;
        this.recognition.lang = 'en-US';
      }
    }

    // Check for Speech Synthesis support
    if ('speechSynthesis' in window) {
      this.synthesis = window.speechSynthesis;
    }

    this.isSupported = !!(this.recognition && this.synthesis);
  }

  startListening(onResult: (text: string) => void, onError: (error: string) => void): void {
    if (!this.recognition || this.isListening) {
      onError('Speech recognition not available or already listening');
      return;
    }

    this.isListening = true;

    this.recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      onResult(transcript);
      this.isListening = false;
    };

    this.recognition.onerror = (event) => {
      onError(`Speech recognition error: ${event.error}`);
      this.isListening = false;
    };

    this.recognition.onend = () => {
      this.isListening = false;
    };

    try {
      this.recognition.start();
    } catch (error) {
      this.isListening = false;
      onError(`Failed to start speech recognition: ${error}`);
    }
  }

  stopListening(): void {
    if (this.recognition && this.isListening) {
      this.recognition.stop();
      this.isListening = false;
    }
  }

  async speak(text: string): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!this.synthesis) {
        reject(new Error('Speech synthesis not available'));
        return;
      }

      // Cancel any ongoing speech
      this.synthesis.cancel();

      const utterance = new SpeechSynthesisUtterance(text);
      
      // Configure voice settings
      utterance.rate = 0.9;
      utterance.pitch = 1.1;
      utterance.volume = 0.8;

      // Try to use a female voice if available
      const voices = this.synthesis.getVoices();
      const femaleVoice = voices.find(voice => 
        voice.name.toLowerCase().includes('female') || 
        voice.name.toLowerCase().includes('woman') ||
        voice.name.toLowerCase().includes('samantha') ||
        voice.name.toLowerCase().includes('karen')
      );
      
      if (femaleVoice) {
        utterance.voice = femaleVoice;
      } else {
        // Fallback to first available voice
        utterance.voice = voices[0] || null;
      }

      utterance.onend = () => resolve();
      utterance.onerror = (event) => reject(new Error(`Speech synthesis error: ${event.error}`));

      this.synthesis.speak(utterance);
    });
  }
}

// Create a singleton instance
export const voiceService = new VoiceService(); 