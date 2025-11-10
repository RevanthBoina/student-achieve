import { z } from 'zod';

// School domains for validation - educational institutions worldwide
const SCHOOL_DOMAINS = [
  'edu',           // US educational institutions
  'edu.in',        // Indian educational institutions
  'ac.in',         // Indian academic institutions
  'ac.uk',         // UK academic institutions
  'edu.au',        // Australian educational institutions
  'edu.cn',        // Chinese educational institutions
  'ac.jp',         // Japanese academic institutions
  'edu.pk',        // Pakistani educational institutions
  'edu.sg',        // Singaporean educational institutions
  'edu.my',        // Malaysian educational institutions
  'ac.nz',         // New Zealand academic institutions
];

const isSchoolEmail = (email: string) => {
  const domain = email.split('@')[1];
  if (!domain) return false;
  
  // Check if domain ends with any known educational domain
  return SCHOOL_DOMAINS.some(schoolDomain => domain.endsWith(schoolDomain));
};

// Signup Schema
export const signupSchema = z.object({
  fullName: z.string()
    .trim()
    .min(2, 'Name must be at least 2 characters')
    .max(100, 'Name must be less than 100 characters'),
  email: z.string()
    .trim()
    .email('Invalid email address')
    .max(255, 'Email must be less than 255 characters'),
  password: z.string()
    .min(8, 'Password must be at least 8 characters')
    .max(100, 'Password must be less than 100 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number'),
  verificationMethod: z.enum(['school_email', 'id_card']),
  schoolEmail: z.string().email().optional(),
  idCard: z.instanceof(File).optional(),
}).refine((data) => {
  if (data.verificationMethod === 'school_email' && data.schoolEmail) {
    return isSchoolEmail(data.schoolEmail);
  }
  return true;
}, {
  message: 'School email must be from an educational institution',
  path: ['schoolEmail'],
}).refine((data) => {
  if (data.verificationMethod === 'id_card') {
    return data.idCard instanceof File;
  }
  return true;
}, {
  message: 'ID card image is required',
  path: ['idCard'],
});

export type SignupFormData = z.infer<typeof signupSchema>;

// Login Schema
export const loginSchema = z.object({
  email: z.string()
    .trim()
    .email('Invalid email address')
    .max(255, 'Email must be less than 255 characters'),
  password: z.string()
    .min(1, 'Password is required'),
});

export type LoginFormData = z.infer<typeof loginSchema>;

// Profile Schema
export const profileSchema = z.object({
  bio: z.string()
    .max(500, 'Bio must be less than 500 characters')
    .optional(),
  school: z.string()
    .max(200, 'School name must be less than 200 characters')
    .optional(),
  profilePhoto: z.instanceof(File).optional(),
}).refine((data) => {
  if (data.profilePhoto) {
    const validTypes = ['image/jpeg', 'image/png', 'image/webp'];
    return validTypes.includes(data.profilePhoto.type);
  }
  return true;
}, {
  message: 'Profile photo must be a JPG, PNG, or WEBP image',
  path: ['profilePhoto'],
}).refine((data) => {
  if (data.profilePhoto) {
    const maxSize = 5 * 1024 * 1024; // 5MB
    return data.profilePhoto.size <= maxSize;
  }
  return true;
}, {
  message: 'Profile photo must be less than 5MB',
  path: ['profilePhoto'],
});

export type ProfileFormData = z.infer<typeof profileSchema>;

// Create Record Schema
export const createRecordSchema = z.object({
  title: z.string()
    .trim()
    .min(10, 'Title must be at least 10 characters')
    .max(200, 'Title must be less than 200 characters'),
  description: z.string()
    .trim()
    .min(50, 'Description must be at least 50 characters')
    .max(5000, 'Description must be less than 5000 characters'),
  categoryId: z.string().uuid('Invalid category'),
  mediaFiles: z.array(z.instanceof(File)).optional(),
  evidenceFiles: z.array(z.instanceof(File)).optional(),
}).refine((data) => {
  if (data.mediaFiles && data.mediaFiles.length > 0) {
    const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'video/mp4', 'video/webm'];
    return data.mediaFiles.every(file => validTypes.includes(file.type));
  }
  return true;
}, {
  message: 'Media files must be images (JPG, PNG, WEBP) or videos (MP4, WEBM)',
  path: ['mediaFiles'],
}).refine((data) => {
  if (data.mediaFiles && data.mediaFiles.length > 0) {
    const maxSize = 50 * 1024 * 1024; // 50MB
    return data.mediaFiles.every(file => file.size <= maxSize);
  }
  return true;
}, {
  message: 'Each media file must be less than 50MB',
  path: ['mediaFiles'],
}).refine((data) => {
  if (data.evidenceFiles && data.evidenceFiles.length > 0) {
    const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'];
    return data.evidenceFiles.every(file => validTypes.includes(file.type));
  }
  return true;
}, {
  message: 'Evidence files must be images (JPG, PNG, WEBP) or PDF documents',
  path: ['evidenceFiles'],
}).refine((data) => {
  if (data.evidenceFiles && data.evidenceFiles.length > 0) {
    const maxSize = 10 * 1024 * 1024; // 10MB
    return data.evidenceFiles.every(file => file.size <= maxSize);
  }
  return true;
}, {
  message: 'Each evidence file must be less than 10MB',
  path: ['evidenceFiles'],
});

export type CreateRecordFormData = z.infer<typeof createRecordSchema>;
