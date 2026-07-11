import { describe, it, expect } from 'vitest';
import { serviceSchema, incidentSchema } from '../src/lib/validators';

describe('serviceSchema', () => {
  it('should validate correct operational service inputs successfully', () => {
    const valid = {
      name: 'API Service',
      description: 'Primary public APIs routing server endpoints.',
      status: 'operational',
    };
    const res = serviceSchema.safeParse(valid);
    expect(res.success).toBe(true);
  });

  it('should validate without description successfully', () => {
    const valid = {
      name: 'Database cluster',
      status: 'major_outage',
    };
    const res = serviceSchema.safeParse(valid);
    expect(res.success).toBe(true);
  });

  it('should reject empty service name values', () => {
    const invalid = {
      name: '',
      status: 'operational',
    };
    const res = serviceSchema.safeParse(invalid);
    expect(res.success).toBe(false);
    if (!res.success) {
      expect(res.error.flatten().fieldErrors.name).toBeDefined();
    }
  });

  it('should reject names longer than 100 characters', () => {
    const invalid = {
      name: 'a'.repeat(101),
      status: 'operational',
    };
    const res = serviceSchema.safeParse(invalid);
    expect(res.success).toBe(false);
  });

  it('should reject invalid status enums values', () => {
    const invalid = {
      name: 'Portal web client',
      status: 'broken_down',
    };
    const res = serviceSchema.safeParse(invalid);
    expect(res.success).toBe(false);
  });
});

describe('incidentSchema', () => {
  it('should validate valid incident payloads successfully', () => {
    const valid = {
      title: 'Database connection pools depletion outage',
      impact: 'major',
      status: 'investigating',
      serviceIds: ['s1', 's2'],
      body: 'We are experiencing 504 errors on database connections.',
    };
    const res = incidentSchema.safeParse(valid);
    expect(res.success).toBe(true);
  });

  it('should reject empty incident titles', () => {
    const invalid = {
      title: '  ',
      impact: 'minor',
      status: 'identified',
      serviceIds: ['s1'],
      body: 'Investigating routing error.',
    };
    const res = incidentSchema.safeParse(invalid);
    expect(res.success).toBe(false);
  });

  it('should reject empty service lists', () => {
    const invalid = {
      title: 'Global load balancer dropout',
      impact: 'critical',
      status: 'investigating',
      serviceIds: [],
      body: 'Routing nodes dropping packages.',
    };
    const res = incidentSchema.safeParse(invalid);
    expect(res.success).toBe(false);
  });
});
