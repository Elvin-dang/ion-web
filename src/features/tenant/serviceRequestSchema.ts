/**
 * Zod schema + constants for the Tenant Service Request form (WBS 2.1.1).
 *
 * Every error message is verbatim from the WBS checklist so the demo matches
 * the spec exactly. Attachments are validated separately (File objects can't be
 * meaningfully described in the resolver across the cascading steps) — see
 * `validateAttachments`.
 */
import { z } from 'zod';

export const MAX_DESCRIPTION = 1000;
export const MAX_NAME = 100;
export const MAX_PHONE = 20;
export const MAX_FILE_BYTES = 5 * 1024 * 1024; // 5 MB
export const MAX_FILES = 5;
export const ACCEPTED_FILE_TYPES = ['image/jpeg', 'image/png', 'application/pdf'];
export const ACCEPTED_FILE_EXT = '.jpg,.jpeg,.png,.pdf';

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const serviceRequestSchema = z.object({
  // Location
  buildingId: z.string().min(1, 'Please select a building.'),
  floorId: z.string().optional(),
  areaId: z.string().optional(),
  // Asset taxonomy
  assetSystemId: z.string().min(1, 'Please select an asset system.'),
  assetSubSystemId: z.string().optional(),
  assetTypeId: z.string().optional(),
  assetId: z.string().optional(),
  // Issue
  description: z
    .string()
    .min(1, 'Please describe the issue.')
    .max(MAX_DESCRIPTION, 'Description must not exceed 1000 characters.'),
  // Contact
  contactName: z
    .string()
    .min(1, 'Please enter your name.')
    .max(MAX_NAME, 'Name must not exceed 100 characters.'),
  contactPhone: z
    .string()
    .min(1, 'Please enter your phone number.')
    .max(MAX_PHONE, 'Phone number must not exceed 20 characters.'),
  contactEmail: z
    .string()
    .min(1, 'Please enter your email address.')
    .max(MAX_NAME, 'Email must not exceed 100 characters.')
    .regex(emailRegex, 'Please enter a valid email address.'),
});

export type ServiceRequestForm = z.infer<typeof serviceRequestSchema>;

export const defaultServiceRequestValues: ServiceRequestForm = {
  buildingId: '',
  floorId: '',
  areaId: '',
  assetSystemId: '',
  assetSubSystemId: '',
  assetTypeId: '',
  assetId: '',
  description: '',
  contactName: '',
  contactPhone: '',
  contactEmail: '',
};

/** Validate the attachment list, returning the first verbatim WBS error or null. */
export function validateAttachments(files: File[]): string | null {
  if (files.length > MAX_FILES) {
    return 'You can attach a maximum of 5 files.';
  }
  for (const file of files) {
    const validType =
      ACCEPTED_FILE_TYPES.includes(file.type) ||
      /\.(jpe?g|png|pdf)$/i.test(file.name);
    if (!validType) {
      return 'Only JPG, PNG, and PDF files are accepted.';
    }
    if (file.size > MAX_FILE_BYTES) {
      return 'Each file must not exceed 5 MB.';
    }
  }
  return null;
}

/** Generate a demo Request ID, e.g. SR-2026-0517. */
export function generateRequestId(): string {
  const year = new Date().getFullYear();
  const seq = String(Math.floor(1000 + Math.random() * 9000)).slice(-4);
  return `SR-${year}-${seq}`;
}
