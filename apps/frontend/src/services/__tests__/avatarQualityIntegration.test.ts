import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import * as THREE from 'three';
import { 
  assessAvatarQuality, 
  meetsQualityGate,
  AvatarQualityAssurance 
} from '../avatarQualityAssurance';

describe('Avatar Quality Integration', () => {
  let scene: THREE.Scene;
  let avatarGroup: THREE.Group;
  let qa: AvatarQualityAssurance;

  beforeEach(() => {
    scene = new THREE.Scene();
    avatarGroup = new THREE.Group();
    qa = new AvatarQualityAssurance();
    scene.add(avatarGroup);
  });

  afterEach(() => {
    qa.dispose();
  });

  describe('Complete Quality Assessment', () => {
    it('should assess a well-constructed avatar positively', async () => {
      // Create a properly proportioned avatar
      const head = new THREE.Mesh(
        new THREE.SphereGeometry(0.4, 16, 16),
        new THREE.MeshStandardMaterial({ 
          color: '#D2B48C',
          roughness: 0.9,
          metalness: 0.05
        })
      );
      head.name = 'head';
      head.position.set(0, 0.3, 0.4);

      const body = new THREE.Mesh(
        new THREE.SphereGeometry(0.3, 16, 16),
        new THREE.MeshStandardMaterial({ 
          color: '#D2B48C',
          roughness: 0.9,
          metalness: 0.05
        })
      );
      body.name = 'body';
      body.scale.set(1.4, 0.7, 2.0);

      const leg1 = new THREE.Mesh(
        new THREE.CylinderGeometry(0.035, 0.045, 0.35, 8),
        new THREE.MeshStandardMaterial({ 
          color: '#D2B48C',
          roughness: 0.9,
          metalness: 0.05
        })
      );
      leg1.name = 'leg';
      leg1.position.set(-0.12, -0.15, 0.2);

      const leg2 = new THREE.Mesh(
        new THREE.CylinderGeometry(0.035, 0.045, 0.35, 8),
        new THREE.MeshStandardMaterial({ 
          color: '#D2B48C',
          roughness: 0.9,
          metalness: 0.05
        })
      );
      leg2.name = 'leg';
      leg2.position.set(0.12, -0.15, 0.2);

      avatarGroup.add(head, body, leg1, leg2);

      const report = await assessAvatarQuality(avatarGroup);

      expect(report).toBeDefined();
      expect(report.overallScore).toBeGreaterThan(50); // Should be decent
      expect(report.metrics.realismScore).toBeGreaterThan(60);
      expect(report.metrics.anatomicalAccuracy).toBeGreaterThan(60);
      
      // Should have some recommendations but not critical failures
      const criticalIssues = report.validation.issues.filter(i => i.severity === 'critical');
      expect(criticalIssues.length).toBe(0);
    });

    it('should identify issues with poorly constructed avatar', async () => {
      // Create a problematic avatar
      const oversizedHead = new THREE.Mesh(
        new THREE.SphereGeometry(2.0, 128, 128), // Too large, too many vertices
        new THREE.MeshStandardMaterial({ 
          color: '#FF00FF', // Wrong color
          roughness: 0.1,   // Too smooth
          metalness: 0.8    // Too metallic
        })
      );
      oversizedHead.name = 'head';

      const tinyBody = new THREE.Mesh(
        new THREE.SphereGeometry(0.1, 16, 16), // Too small
        new THREE.MeshStandardMaterial({ color: '#D2B48C' })
      );
      tinyBody.name = 'body';

      avatarGroup.add(oversizedHead, tinyBody);

      const report = await assessAvatarQuality(avatarGroup);

      expect(report.passed).toBe(false);
      expect(report.overallScore).toBeLessThan(50);
      
      // Should have multiple issues
      expect(report.validation.issues.length).toBeGreaterThan(0);
      
      // Should have recommendations
      expect(report.recommendations.length).toBeGreaterThan(0);
      
      // Should not meet quality gate
      expect(meetsQualityGate(report)).toBe(false);
    });

    it('should generate actionable recommendations', async () => {
      // Create avatar with specific issues
      const head = new THREE.Mesh(
        new THREE.SphereGeometry(0.8, 16, 16), // Too large
        new THREE.MeshStandardMaterial({ color: '#D2B48C' })
      );
      head.name = 'head';

      const body = new THREE.Mesh(
        new THREE.SphereGeometry(0.3, 16, 16),
        new THREE.MeshStandardMaterial({ color: '#D2B48C' })
      );
      body.name = 'body';

      avatarGroup.add(head, body);

      const report = await assessAvatarQuality(avatarGroup);

      // Should have recommendations
      expect(report.recommendations.length).toBeGreaterThan(0);
      
      // Should include proportion-related recommendations
      const proportionRecs = report.recommendations.filter(rec => 
        rec.title.includes('Proportion') || rec.title.includes('Anatomical')
      );
      expect(proportionRecs.length).toBeGreaterThan(0);
      
      // Recommendations should have action items
      report.recommendations.forEach(rec => {
        expect(rec.actionItems.length).toBeGreaterThan(0);
        expect(rec.estimatedImpact).toBeGreaterThan(0);
        expect(rec.priority).toMatch(/^(critical|high|medium|low)$/);
      });
    });

    it('should validate performance metrics', async () => {
      // Create high-poly avatar
      const highPolyMesh = new THREE.Mesh(
        new THREE.SphereGeometry(1.0, 128, 128), // Very high detail
        new THREE.MeshStandardMaterial({ color: '#D2B48C' })
      );

      // Add many separate meshes
      for (let i = 0; i < 25; i++) {
        const mesh = new THREE.Mesh(
          new THREE.SphereGeometry(0.1, 16, 16),
          new THREE.MeshStandardMaterial({ color: '#D2B48C' })
        );
        avatarGroup.add(mesh);
      }

      avatarGroup.add(highPolyMesh);

      const report = await assessAvatarQuality(avatarGroup);

      // Should have performance issues
      const performanceIssues = report.validation.issues.filter(i => i.category === 'performance');
      expect(performanceIssues.length).toBeGreaterThan(0);
      
      // Performance score should be low
      expect(report.metrics.performanceScore).toBeLessThan(80);
    });

    it('should provide detailed quality report', async () => {
      const head = new THREE.Mesh(
        new THREE.SphereGeometry(0.4, 16, 16),
        new THREE.MeshStandardMaterial({ color: '#D2B48C' })
      );
      head.name = 'head';
      avatarGroup.add(head);

      const report = await assessAvatarQuality(avatarGroup);
      const detailedReport = qa.generateDetailedReport(report);

      expect(detailedReport).toContain('Puppy Avatar Quality Assessment Report');
      expect(detailedReport).toContain('Overall Score');
      expect(detailedReport).toContain('Quality Metrics');
      expect(detailedReport).toContain('Recommendations');
      
      // Should be properly formatted markdown
      expect(detailedReport).toMatch(/^# 🐕 Puppy Avatar Quality Assessment Report/);
      expect(detailedReport).toContain('## 📊 Quality Metrics');
    });
  });

  describe('Quality Gate Integration', () => {
    it('should pass quality gate for good avatar', async () => {
      // Create minimal but acceptable avatar
      const head = new THREE.Mesh(
        new THREE.SphereGeometry(0.4, 16, 16),
        new THREE.MeshStandardMaterial({ 
          color: '#D2B48C',
          roughness: 0.9,
          metalness: 0.05
        })
      );
      head.name = 'head';

      const body = new THREE.Mesh(
        new THREE.SphereGeometry(0.8, 16, 16),
        new THREE.MeshStandardMaterial({ 
          color: '#D2B48C',
          roughness: 0.9,
          metalness: 0.05
        })
      );
      body.name = 'body';

      const leg = new THREE.Mesh(
        new THREE.CylinderGeometry(0.035, 0.045, 0.5, 8),
        new THREE.MeshStandardMaterial({ 
          color: '#D2B48C',
          roughness: 0.9,
          metalness: 0.05
        })
      );
      leg.name = 'leg';

      avatarGroup.add(head, body, leg);

      const report = await assessAvatarQuality(avatarGroup);
      
      // Should have reasonable scores
      expect(report.overallScore).toBeGreaterThan(40);
      expect(report.metrics.realismScore).toBeGreaterThan(40);
      
      // Critical issues should be minimal
      const criticalIssues = report.validation.issues.filter(i => i.severity === 'critical');
      expect(criticalIssues.length).toBe(0);
    });

    it('should fail quality gate for poor avatar', async () => {
      // Create problematic avatar
      const badHead = new THREE.Mesh(
        new THREE.SphereGeometry(3.0, 128, 128), // Massive, high-poly
        new THREE.MeshStandardMaterial({ 
          color: '#FF00FF', // Wrong color
          roughness: 0.0,   // Wrong material
          metalness: 1.0    // Wrong material
        })
      );
      badHead.name = 'head';

      const badBody = new THREE.Mesh(
        new THREE.SphereGeometry(0.1, 16, 16), // Too small
        new THREE.MeshStandardMaterial({ color: '#00FFFF' }) // Wrong color
      );
      badBody.name = 'body';

      avatarGroup.add(badHead, badBody);

      const report = await assessAvatarQuality(avatarGroup);
      
      expect(meetsQualityGate(report)).toBe(false);
      expect(report.overallScore).toBeLessThan(70);
      
      // Should have multiple issues
      expect(report.validation.issues.length).toBeGreaterThan(3);
      expect(report.recommendations.length).toBeGreaterThan(2);
    });
  });

  describe('Metrics Validation', () => {
    it('should calculate metrics correctly', async () => {
      const head = new THREE.Mesh(
        new THREE.SphereGeometry(0.4, 16, 16),
        new THREE.MeshStandardMaterial({ color: '#D2B48C' })
      );
      head.name = 'head';
      avatarGroup.add(head);

      const report = await assessAvatarQuality(avatarGroup);

      // All metrics should be numbers between 0-100
      expect(report.metrics.realismScore).toBeGreaterThanOrEqual(0);
      expect(report.metrics.realismScore).toBeLessThanOrEqual(100);
      
      expect(report.metrics.interactivityScore).toBeGreaterThanOrEqual(0);
      expect(report.metrics.interactivityScore).toBeLessThanOrEqual(100);
      
      expect(report.metrics.performanceScore).toBeGreaterThanOrEqual(0);
      expect(report.metrics.performanceScore).toBeLessThanOrEqual(100);
      
      expect(report.metrics.visualConsistencyScore).toBeGreaterThanOrEqual(0);
      expect(report.metrics.visualConsistencyScore).toBeLessThanOrEqual(100);
      
      expect(report.metrics.anatomicalAccuracy).toBeGreaterThanOrEqual(0);
      expect(report.metrics.anatomicalAccuracy).toBeLessThanOrEqual(100);
      
      expect(report.metrics.userExperienceScore).toBeGreaterThanOrEqual(0);
      expect(report.metrics.userExperienceScore).toBeLessThanOrEqual(100);
    });
  });
}); 