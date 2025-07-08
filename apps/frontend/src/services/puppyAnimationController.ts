import * as THREE from 'three';
import * as React from 'react';

interface PuppyAnimationState {
  idle: boolean;
  excited: boolean;
  speaking: boolean;
  listening: boolean;
  excitementLevel: number;
  speakingIntensity: number;
  tailWagSpeed: number;
  headBobIntensity: number;
  lastUserInteraction: number;
  animationStartTime: number;
  currentAnimationDuration: number;
}

interface PuppyAnimationRefs {
  head: React.RefObject<THREE.Mesh>;
  tail: React.RefObject<THREE.Mesh>;
  leftEar: React.RefObject<THREE.Mesh>;
  rightEar: React.RefObject<THREE.Mesh>;
  leftEye: React.RefObject<THREE.Mesh>;
  rightEye: React.RefObject<THREE.Mesh>;
  body: React.RefObject<THREE.Mesh>;
  frontLeftLeg: React.RefObject<THREE.Mesh>;
  frontRightLeg: React.RefObject<THREE.Mesh>;
  backLeftLeg: React.RefObject<THREE.Mesh>;
  backRightLeg: React.RefObject<THREE.Mesh>;
}

class PuppyAnimationController {
  private state: PuppyAnimationState;
  private refs: PuppyAnimationRefs;
  private animationFrameId: number | null = null;
  private clock: THREE.Clock;
  
  private readonly EXCITEMENT_DURATION = 3000;
  private readonly SPEAKING_DURATION = 2000;
  private readonly IDLE_RETURN_DELAY = 1000;
  
  constructor(refs: PuppyAnimationRefs) {
    this.refs = refs;
    this.clock = new THREE.Clock();
    this.state = {
      idle: true,
      excited: false,
      speaking: false,
      listening: false,
      excitementLevel: 0,
      speakingIntensity: 0,
      tailWagSpeed: 0.5,
      headBobIntensity: 0,
      lastUserInteraction: 0,
      animationStartTime: 0,
      currentAnimationDuration: 0
    };
    
    this.startAnimationLoop();
  }

  public triggerExcitement(intensity: number = 0.8): void {
    console.log('🐕 Puppy getting excited! Intensity:', intensity);
    
    this.state.excited = true;
    this.state.idle = false;
    this.state.speaking = false;
    this.state.listening = true;
    this.state.excitementLevel = Math.min(intensity, 1);
    this.state.tailWagSpeed = 1.5 + (intensity * 1.5);
    this.state.headBobIntensity = 0.3 + (intensity * 0.4);
    this.state.lastUserInteraction = Date.now();
    this.state.animationStartTime = Date.now();
    this.state.currentAnimationDuration = this.EXCITEMENT_DURATION;
  }

  public triggerSpeaking(intensity: number = 0.9): void {
    console.log('🐕 Puppy speaking! Intensity:', intensity);
    
    this.state.speaking = true;
    this.state.excited = false;
    this.state.idle = false;
    this.state.listening = false;
    this.state.speakingIntensity = Math.min(intensity, 1);
    this.state.tailWagSpeed = 2.0 + (intensity * 1.0);
    this.state.headBobIntensity = 0.5 + (intensity * 0.5);
    this.state.animationStartTime = Date.now();
    this.state.currentAnimationDuration = this.SPEAKING_DURATION;
  }

  public returnToIdle(): void {
    console.log('🐕 Puppy returning to idle state');
    
    this.state.idle = true;
    this.state.excited = false;
    this.state.speaking = false;
    this.state.listening = false;
    this.state.excitementLevel = 0;
    this.state.speakingIntensity = 0;
    this.state.tailWagSpeed = 0.5;
    this.state.headBobIntensity = 0;
  }

  public setUserTyping(isTyping: boolean): void {
    if (isTyping) {
      this.state.lastUserInteraction = Date.now();
      if (!this.state.excited && !this.state.speaking) {
        this.triggerExcitement(0.6);
      }
    } else {
      setTimeout(() => {
        if (Date.now() - this.state.lastUserInteraction > this.IDLE_RETURN_DELAY) {
          this.returnToIdle();
        }
      }, this.IDLE_RETURN_DELAY);
    }
  }

  private startAnimationLoop(): void {
    const animate = () => {
      const elapsedTime = this.clock.getElapsedTime();
      
      this.updateAnimations(elapsedTime);
      this.animationFrameId = requestAnimationFrame(animate);
    };
    
    animate();
  }

  private updateAnimations(elapsedTime: number): void {
    if (this.state.animationStartTime > 0) {
      const animationElapsed = Date.now() - this.state.animationStartTime;
      if (animationElapsed > this.state.currentAnimationDuration) {
        if (!this.state.idle) {
          this.returnToIdle();
        }
      }
    }

    if (this.state.excited) {
      this.animateExcitement(elapsedTime);
    } else if (this.state.speaking) {
      this.animateSpeaking(elapsedTime);
    } else if (this.state.idle) {
      this.animateIdle(elapsedTime);
    }
  }

  private animateExcitement(elapsedTime: number): void {
    const intensity = this.state.excitementLevel;
    
    if (this.refs.head.current) {
      const headBob = Math.sin(elapsedTime * 8) * 0.05 * intensity;
      const headTilt = Math.sin(elapsedTime * 6) * 0.1 * intensity;
      this.refs.head.current.position.y = 0.4 + headBob;
      this.refs.head.current.rotation.z = headTilt;
      this.refs.head.current.rotation.x = Math.sin(elapsedTime * 4) * 0.05 * intensity;
    }

    if (this.refs.tail.current) {
      const tailWag = Math.sin(elapsedTime * this.state.tailWagSpeed * 4) * 0.8 * intensity;
      this.refs.tail.current.rotation.z = tailWag;
      this.refs.tail.current.rotation.y = Math.sin(elapsedTime * this.state.tailWagSpeed * 2) * 0.3 * intensity;
    }

    if (this.refs.leftEar.current && this.refs.rightEar.current) {
      const earFlick = Math.sin(elapsedTime * 5) * 0.2 * intensity;
      this.refs.leftEar.current.rotation.z = -0.3 + earFlick;
      this.refs.rightEar.current.rotation.z = 0.3 - earFlick;
    }

    if (this.refs.leftEye.current && this.refs.rightEye.current) {
      const eyeSparkle = 1 + Math.sin(elapsedTime * 10) * 0.1 * intensity;
      this.refs.leftEye.current.scale.setScalar(eyeSparkle);
      this.refs.rightEye.current.scale.setScalar(eyeSparkle);
    }

    if (this.refs.body.current) {
      const bodyBounce = Math.sin(elapsedTime * 6) * 0.02 * intensity;
      this.refs.body.current.position.y = bodyBounce;
      this.refs.body.current.rotation.z = Math.sin(elapsedTime * 4) * 0.03 * intensity;
    }

    this.animateLegsExcitement(elapsedTime, intensity);
  }

  private animateSpeaking(elapsedTime: number): void {
    const intensity = this.state.speakingIntensity;
    
    if (this.refs.head.current) {
      const speakBob = Math.sin(elapsedTime * 12) * 0.03 * intensity;
      const speakTilt = Math.sin(elapsedTime * 8) * 0.08 * intensity;
      this.refs.head.current.position.y = 0.4 + speakBob;
      this.refs.head.current.rotation.x = speakTilt;
      this.refs.head.current.rotation.y = Math.sin(elapsedTime * 6) * 0.05 * intensity;
    }

    if (this.refs.tail.current) {
      const tailWag = Math.sin(elapsedTime * this.state.tailWagSpeed * 3) * 0.6 * intensity;
      this.refs.tail.current.rotation.z = tailWag;
    }

    if (this.refs.leftEar.current && this.refs.rightEar.current) {
      const earAlert = Math.sin(elapsedTime * 3) * 0.1 * intensity;
      this.refs.leftEar.current.rotation.z = -0.2 + earAlert;
      this.refs.rightEar.current.rotation.z = 0.2 - earAlert;
    }

    if (this.refs.leftEye.current && this.refs.rightEye.current) {
      const eyeFocus = 1 + Math.sin(elapsedTime * 8) * 0.05 * intensity;
      this.refs.leftEye.current.scale.setScalar(eyeFocus);
      this.refs.rightEye.current.scale.setScalar(eyeFocus);
    }

    if (this.refs.body.current) {
      const bodyLean = Math.sin(elapsedTime * 4) * 0.02 * intensity;
      this.refs.body.current.rotation.x = bodyLean;
    }
  }

  private animateIdle(elapsedTime: number): void {
    if (this.refs.body.current) {
      const breathe = Math.sin(elapsedTime * 2) * 0.01;
      this.refs.body.current.position.y = breathe;
    }

    if (this.refs.tail.current) {
      const tailSway = Math.sin(elapsedTime * 0.8) * 0.2;
      this.refs.tail.current.rotation.z = tailSway;
    }

    if (this.refs.leftEar.current && this.refs.rightEar.current) {
      const earTwitch = Math.sin(elapsedTime * 0.3) * 0.05;
      this.refs.leftEar.current.rotation.z = -0.2 + earTwitch;
      this.refs.rightEar.current.rotation.z = 0.2 - earTwitch;
    }

    if (this.refs.head.current) {
      const headSway = Math.sin(elapsedTime * 1.5) * 0.02;
      this.refs.head.current.position.y = 0.4 + headSway;
      this.refs.head.current.rotation.z = Math.sin(elapsedTime * 0.7) * 0.03;
    }

    if (this.refs.leftEye.current && this.refs.rightEye.current) {
      const blink = Math.abs(Math.sin(elapsedTime * 0.5)) * 0.05 + 0.95;
      this.refs.leftEye.current.scale.y = blink;
      this.refs.rightEye.current.scale.y = blink;
    }
  }

  private animateLegsExcitement(elapsedTime: number, intensity: number): void {
    const legBounce = Math.sin(elapsedTime * 8) * 0.02 * intensity;
    const legSway = Math.sin(elapsedTime * 6) * 0.05 * intensity;
    
    if (this.refs.frontLeftLeg.current) {
      this.refs.frontLeftLeg.current.position.y = -0.15 + legBounce;
      this.refs.frontLeftLeg.current.rotation.x = legSway;
    }
    
    if (this.refs.frontRightLeg.current) {
      this.refs.frontRightLeg.current.position.y = -0.15 + legBounce;
      this.refs.frontRightLeg.current.rotation.x = -legSway;
    }
    
    if (this.refs.backLeftLeg.current) {
      this.refs.backLeftLeg.current.position.y = -0.15 + legBounce * 0.8;
      this.refs.backLeftLeg.current.rotation.x = legSway * 0.5;
    }
    
    if (this.refs.backRightLeg.current) {
      this.refs.backRightLeg.current.position.y = -0.15 + legBounce * 0.8;
      this.refs.backRightLeg.current.rotation.x = -legSway * 0.5;
    }
  }

  public getAnimationState(): PuppyAnimationState {
    return { ...this.state };
  }

  public setAnimationState(newState: Partial<PuppyAnimationState>): void {
    this.state = { ...this.state, ...newState };
  }

  public dispose(): void {
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }
  }
}

// Explicit exports
export type { PuppyAnimationState, PuppyAnimationRefs };
export { PuppyAnimationController };
export default PuppyAnimationController; 