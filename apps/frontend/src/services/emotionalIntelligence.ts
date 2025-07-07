import type { Context, EmotionalAnalysis } from '../types/context';

/**
 * Emotional Intelligence Service for Avatar System
 * 
 * Provides advanced emotion detection, sentiment analysis, and adaptive response capabilities.
 * Integrates with the context management system to enhance avatar emotional awareness.
 */

export interface EmotionalContext {
  primary: string;
  secondary?: string;
  intensity: number; // 0-1 scale
  confidence: number; // 0-1 scale
  indicators: string[];
  trend: 'improving' | 'declining' | 'stable';
}

export interface ResponseToneAdjustment {
  tone: 'supportive' | 'enthusiastic' | 'calming' | 'encouraging' | 'neutral';
  adjustments: {
    warmth: number; // -1 to 1
    energy: number; // -1 to 1
    formality: number; // -1 to 1
    empathy: number; // 0 to 1
  };
  suggestedPhrases: string[];
  avoidPhrases: string[];
}

export interface EmotionalPattern {
  userId: string;
  patterns: {
    commonEmotions: string[];
    triggers: { emotion: string; keywords: string[] }[];
    recoveryStrategies: { emotion: string; effectiveResponses: string[] }[];
    emotionalJourney: { timestamp: number; emotion: string; intensity: number }[];
  };
  lastUpdated: number;
}

export class EmotionalIntelligence {
  private emotionalPatterns: Map<string, EmotionalPattern> = new Map();
  private emotionKeywords: Map<string, string[]> = new Map();
  private sentimentAnalyzer: SentimentAnalyzer;

  constructor() {
    this.initializeEmotionKeywords();
    this.sentimentAnalyzer = new SentimentAnalyzer();
  }

  /**
   * Analyze the emotional state from user input and conversation context
   */
  analyzeEmotionalState(userInput: string, context: Context): EmotionalAnalysis {
    const textAnalysis = this.analyzeTextEmotion(userInput);
    const contextualAnalysis = this.analyzeContextualEmotion(context);
    
    // Safe access to userId with fallback
    const userId = context?.session?.userProfile?.userId || 'unknown';
    const historicalAnalysis = this.analyzeEmotionalHistory(userId);

    const primary = this.determinePrimaryEmotion(textAnalysis, contextualAnalysis, historicalAnalysis);
    const intensity = this.calculateEmotionalIntensity(userInput, textAnalysis);
    const confidence = this.calculateConfidence(textAnalysis, contextualAnalysis);

    const emotionalContext = {
      primary,
      secondary: this.determineSecondaryEmotion(textAnalysis),
      intensity,
      confidence,
      indicators: textAnalysis.indicators,
      trend: this.determineEmotionalTrend(userId)
    };

    return {
      detectedEmotion: primary,
      confidence,
      suggestedResponse: this.getToneAdjustment(emotionalContext),
      emotionalContext
    };
  }

  /**
   * Adapt response based on detected emotional state
   */
  adaptResponseToEmotion(response: string, emotionalState: EmotionalContext): string {
    const toneAdjustment = this.getToneAdjustment(emotionalState);
    
    let adaptedResponse = response;

    // Apply tone adjustments
    if (toneAdjustment.adjustments.warmth > 0.5) {
      adaptedResponse = this.addWarmthToResponse(adaptedResponse);
    }

    if (toneAdjustment.adjustments.empathy > 0.7) {
      adaptedResponse = this.addEmpathyToResponse(adaptedResponse, emotionalState.primary);
    }

    if (toneAdjustment.adjustments.energy > 0.5) {
      adaptedResponse = this.increaseEnergyInResponse(adaptedResponse);
    } else if (toneAdjustment.adjustments.energy < -0.5) {
      adaptedResponse = this.addCalmingElementsToResponse(adaptedResponse);
    }

    // Add suggested phrases if appropriate
    if (toneAdjustment.suggestedPhrases.length > 0) {
      adaptedResponse = this.incorporateSuggestedPhrases(adaptedResponse, toneAdjustment.suggestedPhrases);
    }

    return adaptedResponse;
  }

  /**
   * Update emotional patterns based on user interactions
   */
  updateEmotionalPattern(userId: string, emotion: string, intensity: number): void {
    let pattern = this.emotionalPatterns.get(userId);
    
    if (!pattern) {
      pattern = {
        userId,
        patterns: {
          commonEmotions: [],
          triggers: [],
          recoveryStrategies: [],
          emotionalJourney: []
        },
        lastUpdated: Date.now()
      };
    }

    // Update emotional journey
    pattern.patterns.emotionalJourney.push({
      timestamp: Date.now(),
      emotion,
      intensity
    });

    // Keep only last 100 entries
    if (pattern.patterns.emotionalJourney.length > 100) {
      pattern.patterns.emotionalJourney = pattern.patterns.emotionalJourney.slice(-100);
    }

    // Update common emotions
    if (!pattern.patterns.commonEmotions.includes(emotion)) {
      pattern.patterns.commonEmotions.push(emotion);
    }

    // Update triggers (simplified without userInput)
    const existingTrigger = pattern.patterns.triggers.find(t => t.emotion === emotion);
    if (existingTrigger) {
      // Keep existing keywords
    } else {
      pattern.patterns.triggers.push({ emotion, keywords: [] });
    }

    pattern.lastUpdated = Date.now();
    this.emotionalPatterns.set(userId, pattern);
  }

  /**
   * Get emotional insights for a user
   */
  getEmotionalInsights(userId: string): EmotionalPattern | null {
    return this.emotionalPatterns.get(userId) || null;
  }

  private initializeEmotionKeywords(): void {
    this.emotionKeywords.set('happy', [
      'happy', 'great', 'awesome', 'fantastic', 'wonderful', 'amazing', 'excited', 'thrilled',
      'delighted', 'pleased', 'joyful', 'cheerful', 'glad', 'content', 'satisfied'
    ]);

    this.emotionKeywords.set('sad', [
      'sad', 'depressed', 'down', 'blue', 'upset', 'disappointed', 'heartbroken',
      'miserable', 'gloomy', 'melancholy', 'dejected', 'despondent', 'sorrowful'
    ]);

    this.emotionKeywords.set('angry', [
      'angry', 'mad', 'furious', 'irritated', 'annoyed', 'frustrated', 'outraged',
      'livid', 'enraged', 'irate', 'incensed', 'infuriated', 'aggravated'
    ]);

    this.emotionKeywords.set('anxious', [
      'anxious', 'worried', 'nervous', 'stressed', 'concerned', 'uneasy', 'apprehensive',
      'fearful', 'panicked', 'overwhelmed', 'tense', 'restless', 'troubled'
    ]);

    this.emotionKeywords.set('confused', [
      'confused', 'puzzled', 'perplexed', 'bewildered', 'lost', 'unclear', 'uncertain',
      'baffled', 'mystified', 'stumped', "don't understand", 'not sure'
    ]);

    this.emotionKeywords.set('excited', [
      'excited', 'thrilled', 'pumped', 'enthusiastic', 'eager', 'animated', 'energetic',
      'passionate', 'motivated', 'inspired', 'fired up', 'psyched', 'incredible', 'wow'
    ]);
  }

  private analyzeTextEmotion(text: string): { emotion: string; confidence: number; indicators: string[] } {
    const lowerText = text.toLowerCase();
    const results: { emotion: string; score: number; indicators: string[] }[] = [];

    // First, check for specific emotions (prioritize these)
    for (const [emotion, keywords] of this.emotionKeywords.entries()) {
      const foundKeywords = keywords.filter(keyword => lowerText.includes(keyword));
      if (foundKeywords.length > 0) {
        // Calculate score based on keyword matches and text length
        const keywordScore = foundKeywords.length / keywords.length;
        const textLengthFactor = Math.min(text.length / 100, 1); // Normalize by text length
        
        // Boost score for multiple keywords and strong emotional indicators
        let finalScore = keywordScore * (0.7 + textLengthFactor * 0.3);
        
        // Base boost for any emotional keyword detection
        finalScore = Math.max(finalScore, 0.6); // Minimum confidence for any emotion detection
        
        // MAJOR boost for exact emotion name matches
        const hasExactMatch = foundKeywords.includes(emotion);
        if (hasExactMatch) {
          finalScore *= 1.8; // Strong preference for exact emotion names
        }
        
        // Boost confidence for multiple keyword matches
        if (foundKeywords.length > 1) {
          finalScore *= 1.4;
        }
        
        // Boost confidence for strong emotional words
        const strongEmotionalWords = ['amazing', 'fantastic', 'wonderful', 'terrible', 'awful', 'furious', 'thrilled', 'excited', 'devastated', 'disappointed', 'frustrated'];
        const hasStrongWords = foundKeywords.some(keyword => strongEmotionalWords.includes(keyword));
        if (hasStrongWords) {
          finalScore *= 1.2;
        }
        
        // Extra boost for very strong emotional indicators
        const veryStrongWords = ['devastated', 'furious', 'thrilled', 'ecstatic', 'terrified', 'overjoyed'];
        const hasVeryStrongWords = foundKeywords.some(keyword => veryStrongWords.includes(keyword));
        if (hasVeryStrongWords) {
          finalScore *= 1.5;
        }
        
        results.push({
          emotion,
          score: Math.min(finalScore, 1), // Cap at 1.0
          indicators: foundKeywords
        });
      }
    }

    // Only add general sentiment if no specific emotions found
    if (results.length === 0) {
      const sentiment = this.sentimentAnalyzer.analyze(text);
      if (sentiment.score > 0.3) {
        results.push({ emotion: 'positive', score: sentiment.score * 0.6, indicators: ['positive sentiment'] });
      } else if (sentiment.score < -0.3) {
        results.push({ emotion: 'negative', score: Math.abs(sentiment.score) * 0.6, indicators: ['negative sentiment'] });
      }
    }

    if (results.length === 0) {
      return { emotion: 'neutral', confidence: 0.3, indicators: [] };
    }

    // Return highest scoring emotion
    const topResult = results.reduce((max, current) => current.score > max.score ? current : max);
    
    // Boost confidence if multiple indicators found
    let confidence = topResult.score;
    if (topResult.indicators.length > 1) {
      confidence = Math.min(confidence * 1.2, 1);
    }
    
    return {
      emotion: topResult.emotion,
      confidence: Math.min(confidence, 1),
      indicators: topResult.indicators
    };
  }

  private analyzeContextualEmotion(context: Context): { emotion: string; confidence: number } {
    // First check if there's a current user emotion set in the context
    if (context.immediate.currentUserEmotion && context.immediate.currentUserEmotion !== 'neutral') {
      return { emotion: context.immediate.currentUserEmotion, confidence: 0.7 };
    }

    // Analyze conversation flow for emotional context
    const recentMessages = context.immediate.recentMessages.slice(-3);
    if (recentMessages.length === 0) {
      return { emotion: 'neutral', confidence: 0.3 };
    }

    const emotionalProgression = recentMessages.map(msg => 
      this.analyzeTextEmotion(msg.content)
    );

    // Look for emotional trends
    const emotions = emotionalProgression.map(e => e.emotion);
    const lastEmotion = emotions[emotions.length - 1];
    
    // Check for emotional consistency
    const consistentEmotion = emotions.every(e => e === lastEmotion);
    const confidence = consistentEmotion ? 0.8 : 0.4;

    return { emotion: lastEmotion, confidence };
  }

  private analyzeEmotionalHistory(userId: string): { emotion: string; confidence: number } {
    const pattern = this.emotionalPatterns.get(userId);
    if (!pattern || pattern.patterns.emotionalJourney.length === 0) {
      return { emotion: 'neutral', confidence: 0.2 };
    }

    // Get recent emotional trend
    const recentEntries = pattern.patterns.emotionalJourney.slice(-5);
    const mostCommonEmotion = this.getMostFrequentEmotion(recentEntries.map(e => e.emotion));
    
    return { emotion: mostCommonEmotion, confidence: 0.6 };
  }

  private determinePrimaryEmotion(
    textAnalysis: { emotion: string; confidence: number },
    contextualAnalysis: { emotion: string; confidence: number },
    historicalAnalysis: { emotion: string; confidence: number }
  ): string {
    // Weight the analyses
    const weightedScores = [
      { emotion: textAnalysis.emotion, score: textAnalysis.confidence * 0.6 },
      { emotion: contextualAnalysis.emotion, score: contextualAnalysis.confidence * 0.3 },
      { emotion: historicalAnalysis.emotion, score: historicalAnalysis.confidence * 0.1 }
    ];

    // Aggregate scores by emotion
    const emotionScores = new Map<string, number>();
    weightedScores.forEach(({ emotion, score }) => {
      emotionScores.set(emotion, (emotionScores.get(emotion) || 0) + score);
    });

    // Return emotion with highest score
    let maxScore = 0;
    let primaryEmotion = 'neutral';
    for (const [emotion, score] of emotionScores.entries()) {
      if (score > maxScore) {
        maxScore = score;
        primaryEmotion = emotion;
      }
    }

    return primaryEmotion;
  }

  private determineSecondaryEmotion(textAnalysis: { emotion: string; confidence: number }): string | undefined {
    // Simple implementation: return a common secondary emotion based on primary
    const secondaryEmotions: Record<string, string> = {
      'happy': 'excited',
      'excited': 'happy',
      'sad': 'anxious',
      'angry': 'frustrated',
      'anxious': 'worried',
      'confused': 'uncertain'
    };
    
    return secondaryEmotions[textAnalysis.emotion] || undefined;
  }

  private calculateEmotionalIntensity(userInput: string, textAnalysis: { emotion: string; confidence: number; indicators: string[] }): number {
    let intensity = textAnalysis.confidence;

    // Check for intensity modifiers
    const intensifiers = ['very', 'extremely', 'really', 'so', 'incredibly', 'absolutely'];
    const diminishers = ['slightly', 'somewhat', 'a bit', 'kind of', 'sort of'];
    
    const lowerInput = userInput.toLowerCase();
    
    if (intensifiers.some(word => lowerInput.includes(word))) {
      intensity = Math.min(intensity * 1.3, 1);
    }
    
    if (diminishers.some(word => lowerInput.includes(word))) {
      intensity = intensity * 0.6; // More reduction for mild expressions
    }

    // Check for punctuation intensity
    const exclamationCount = (userInput.match(/!/g) || []).length;
    if (exclamationCount > 0) {
      intensity = Math.min(intensity + (exclamationCount * 0.1), 1);
    }

    return intensity;
  }

  private calculateConfidence(
    textAnalysis: { emotion: string; confidence: number },
    contextualAnalysis: { emotion: string; confidence: number }
  ): number {
    // Higher confidence if text and context agree
    if (textAnalysis.emotion === contextualAnalysis.emotion) {
      return Math.min((textAnalysis.confidence + contextualAnalysis.confidence) / 2 * 1.2, 1);
    }
    
    // Lower confidence if they disagree
    return Math.max(textAnalysis.confidence * 0.8, 0.3);
  }

  private determineEmotionalTrend(userId: string): 'improving' | 'declining' | 'stable' {
    const pattern = this.emotionalPatterns.get(userId);
    if (!pattern || pattern.patterns.emotionalJourney.length < 3) {
      return 'stable';
    }

    const recent = pattern.patterns.emotionalJourney.slice(-5);
    const positiveEmotions = ['happy', 'excited', 'positive'];
    const negativeEmotions = ['sad', 'angry', 'anxious', 'negative'];

    let positiveCount = 0;
    let negativeCount = 0;

    recent.forEach(entry => {
      if (positiveEmotions.includes(entry.emotion)) positiveCount++;
      if (negativeEmotions.includes(entry.emotion)) negativeCount++;
    });

    if (positiveCount > negativeCount) return 'improving';
    if (negativeCount > positiveCount) return 'declining';
    return 'stable';
  }

  private suggestResponseTone(emotion: string, intensity: number): string {
    const toneMap: Record<string, string> = {
      'happy': intensity > 0.7 ? 'enthusiastic' : 'encouraging',
      'sad': 'supportive',
      'angry': 'calming',
      'anxious': 'calming',
      'confused': 'encouraging',
      'excited': 'enthusiastic',
      'neutral': 'neutral'
    };

    return toneMap[emotion] || 'neutral';
  }

  private getToneAdjustment(emotionalState: EmotionalContext): ResponseToneAdjustment {
    const adjustments: Record<string, ResponseToneAdjustment> = {
      'happy': {
        tone: 'enthusiastic',
        adjustments: { warmth: 0.8, energy: 0.7, formality: -0.2, empathy: 0.5 },
        suggestedPhrases: ["That's wonderful!", "I'm so glad to hear that!", "How exciting!"],
        avoidPhrases: ["I understand this is difficult", "That sounds challenging"]
      },
      'sad': {
        tone: 'supportive',
        adjustments: { warmth: 0.9, energy: -0.3, formality: -0.1, empathy: 0.9 },
        suggestedPhrases: ["I'm here for you", "That sounds really difficult", "Your feelings are completely valid"],
        avoidPhrases: ["Cheer up!", "Look on the bright side", "At least..."]
      },
      'angry': {
        tone: 'calming',
        adjustments: { warmth: 0.6, energy: -0.5, formality: 0.1, empathy: 0.8 },
        suggestedPhrases: ["I can understand why you'd feel that way", "That does sound frustrating", "Let's work through this together"],
        avoidPhrases: ["Calm down", "You're overreacting", "It's not that bad"]
      },
      'anxious': {
        tone: 'calming',
        adjustments: { warmth: 0.8, energy: -0.4, formality: -0.2, empathy: 0.9 },
        suggestedPhrases: ["Take a deep breath", "One step at a time", "You've got this", "It's okay to feel worried"],
        avoidPhrases: ["Don't worry", "Just relax", "Everything will be fine"]
      },
      'confused': {
        tone: 'encouraging',
        adjustments: { warmth: 0.7, energy: 0.2, formality: -0.3, empathy: 0.6 },
        suggestedPhrases: ["Let me help clarify that", "That's a great question", "Let's break this down together"],
        avoidPhrases: ["That's obvious", "You should know this", "It's simple"]
      },
      'excited': {
        tone: 'enthusiastic',
        adjustments: { warmth: 0.9, energy: 0.8, formality: -0.4, empathy: 0.4 },
        suggestedPhrases: ["That's amazing!", "I love your enthusiasm!", "Tell me more!"],
        avoidPhrases: ["Slow down", "Let's be realistic", "Don't get too excited"]
      }
    };

    return adjustments[emotionalState.primary] || {
      tone: 'neutral',
      adjustments: { warmth: 0.5, energy: 0, formality: 0, empathy: 0.5 },
      suggestedPhrases: [],
      avoidPhrases: []
    };
  }

  private addWarmthToResponse(response: string): string {
    const warmPrefixes = ["I'm really glad you shared that. ", "Thank you for telling me. ", "I appreciate you opening up. "];
    const randomPrefix = warmPrefixes[Math.floor(Math.random() * warmPrefixes.length)];
    return randomPrefix + response;
  }

  private addEmpathyToResponse(response: string, emotion: string): string {
    const empathyPhrases: Record<string, string[]> = {
      'sad': ["I can hear that you're going through a tough time. ", "That sounds really hard. "],
      'angry': ["I can understand why you'd feel frustrated. ", "That does sound really annoying. "],
      'anxious': ["I can sense you're feeling worried about this. ", "It's completely normal to feel anxious about this. "]
    };

    const phrases = empathyPhrases[emotion];
    if (phrases) {
      const randomPhrase = phrases[Math.floor(Math.random() * phrases.length)];
      return randomPhrase + response;
    }

    return response;
  }

  private increaseEnergyInResponse(response: string): string {
    // Add exclamation marks and energetic language
    return response.replace(/\./g, '!').replace(/\?/g, '?!');
  }

  private addCalmingElementsToResponse(response: string): string {
    const calmingPrefixes = ["Take your time. ", "There's no rush. ", "Let's approach this gently. "];
    const randomPrefix = calmingPrefixes[Math.floor(Math.random() * calmingPrefixes.length)];
    return randomPrefix + response;
  }

  private incorporateSuggestedPhrases(response: string, phrases: string[]): string {
    if (phrases.length === 0) return response;
    
    const randomPhrase = phrases[Math.floor(Math.random() * phrases.length)];
    return randomPhrase + " " + response;
  }

  private extractEmotionalKeywords(text: string): string[] {
    const keywords: string[] = [];
    const lowerText = text.toLowerCase();

    for (const [emotion, emotionKeywords] of this.emotionKeywords.entries()) {
      const foundKeywords = emotionKeywords.filter(keyword => lowerText.includes(keyword));
      keywords.push(...foundKeywords);
    }

    return [...new Set(keywords)];
  }

  private getMostFrequentEmotion(emotions: string[]): string {
    const frequency = new Map<string, number>();
    emotions.forEach(emotion => {
      frequency.set(emotion, (frequency.get(emotion) || 0) + 1);
    });

    let maxCount = 0;
    let mostFrequent = 'neutral';
    for (const [emotion, count] of frequency.entries()) {
      if (count > maxCount) {
        maxCount = count;
        mostFrequent = emotion;
      }
    }

    return mostFrequent;
  }
}

/**
 * Simple sentiment analyzer for emotional intelligence
 */
class SentimentAnalyzer {
  private positiveWords = [
    'good', 'great', 'excellent', 'amazing', 'wonderful', 'fantastic', 'awesome',
    'love', 'like', 'enjoy', 'happy', 'pleased', 'satisfied', 'delighted'
  ];

  private negativeWords = [
    'bad', 'terrible', 'awful', 'horrible', 'hate', 'dislike', 'sad', 'angry',
    'frustrated', 'disappointed', 'upset', 'annoyed', 'worried', 'concerned'
  ];

  analyze(text: string): { score: number; confidence: number } {
    const words = text.toLowerCase().split(/\s+/);
    let positiveCount = 0;
    let negativeCount = 0;

    words.forEach(word => {
      if (this.positiveWords.includes(word)) positiveCount++;
      if (this.negativeWords.includes(word)) negativeCount++;
    });

    const totalSentimentWords = positiveCount + negativeCount;
    if (totalSentimentWords === 0) {
      return { score: 0, confidence: 0.1 };
    }

    const score = (positiveCount - negativeCount) / totalSentimentWords;
    const confidence = Math.min(totalSentimentWords / words.length * 2, 1);

    return { score, confidence };
  }
}

export { EmotionalIntelligence as default }; 