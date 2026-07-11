import { z } from 'zod';

// ─── Enums ───────────────────────────────────────────────────────────────────

export const SERVICE_STATUSES = [
  'operational',
  'degraded',
  'partial_outage',
  'major_outage',
  'maintenance',
] as const;

export const INCIDENT_STATUSES = [
  'investigating',
  'identified',
  'monitoring',
  'resolved',
] as const;

export const INCIDENT_IMPACTS = [
  'none',
  'minor',
  'major',
  'critical',
] as const;

export const MEMBERSHIP_ROLES = [
  'owner',
  'admin',
  'member',
  'viewer',
] as const;

export type ServiceStatus = (typeof SERVICE_STATUSES)[number];
export type IncidentStatus = (typeof INCIDENT_STATUSES)[number];
export type IncidentImpact = (typeof INCIDENT_IMPACTS)[number];
export type MembershipRole = (typeof MEMBERSHIP_ROLES)[number];

// ─── Auth Schemas ────────────────────────────────────────────────────────────

export const signupSchema = z.object({
  name: z
    .string()
    .min(1, 'Name is required')
    .max(100, 'Name must be 100 characters or less')
    .trim(),
  email: z
    .string()
    .min(1, 'Email is required')
    .email('Please enter a valid email address')
    .trim()
    .toLowerCase(),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .max(128, 'Password must be 128 characters or less'),
  orgName: z
    .string()
    .min(1, 'Organization name is required')
    .max(100, 'Organization name must be 100 characters or less')
    .trim(),
});

export const loginSchema = z.object({
  email: z
    .string()
    .min(1, 'Email is required')
    .email('Please enter a valid email address')
    .trim()
    .toLowerCase(),
  password: z.string().min(1, 'Password is required'),
});

// ─── Service Schemas ─────────────────────────────────────────────────────────

export const serviceSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, 'Service name is required')
    .max(100, 'Service name must be 100 characters or less'),
  description: z
    .string()
    .trim()
    .max(500, 'Description must be 500 characters or less')
    .optional()
    .or(z.literal('')),
  status: z.enum(SERVICE_STATUSES, {
    message: 'Please select a valid status',
  }),
});

export const updateServiceStatusSchema = z.object({
  serviceId: z.string().min(1, 'Service ID is required'),
  status: z.enum(SERVICE_STATUSES, {
    message: 'Please select a valid status',
  }),
});

// ─── Incident Schemas ────────────────────────────────────────────────────────

export const incidentSchema = z.object({
  title: z
    .string()
    .trim()
    .min(1, 'Incident title is required')
    .max(200, 'Title must be 200 characters or less'),
  impact: z.enum(INCIDENT_IMPACTS, {
    message: 'Please select a valid impact level',
  }),
  status: z.enum(INCIDENT_STATUSES, {
    message: 'Please select a valid status',
  }),
  serviceIds: z
    .array(z.string())
    .min(1, 'At least one service must be selected'),
  body: z
    .string()
    .trim()
    .min(1, 'Initial update message is required')
    .max(5000, 'Message must be 5000 characters or less'),
});

export const incidentUpdateSchema = z.object({
  incidentId: z.string().min(1, 'Incident ID is required'),
  body: z
    .string()
    .trim()
    .min(1, 'Update message is required')
    .max(5000, 'Message must be 5000 characters or less'),
  status: z.enum(INCIDENT_STATUSES, {
    message: 'Please select a valid status',
  }),
});

// ─── Type Exports ────────────────────────────────────────────────────────────

export type SignupInput = z.infer<typeof signupSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type ServiceInput = z.infer<typeof serviceSchema>;
export type UpdateServiceStatusInput = z.infer<typeof updateServiceStatusSchema>;
export type IncidentInput = z.infer<typeof incidentSchema>;
export type IncidentUpdateInput = z.infer<typeof incidentUpdateSchema>;
