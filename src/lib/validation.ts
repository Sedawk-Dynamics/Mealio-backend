/**
 * Shared validation helpers used by both the registration form (client)
 * and the /api/register route (server). Keep the rules identical on both
 * sides so the UX and the database stay in sync.
 */

export const ALLOWED_MIME_TYPES = [
  "image/jpeg",
  "image/jpg",
  "image/png",
  "application/pdf",
];

export const ALLOWED_EXTENSIONS = ["jpg", "jpeg", "png", "pdf"];

/** Max upload size in bytes (5 MB). */
export const MAX_FILE_SIZE = 5 * 1024 * 1024;

export interface RegistrationInput {
  name: string;
  email: string;
  phone: string;
  address: string;
  aadhaarNumber: string;
}

export type ValidationErrors = Partial<Record<keyof RegistrationInput, string>>;

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
// Indian mobile: optional +91 / 91 / 0 prefix, then a 6-9 leading 10-digit number.
const INDIAN_PHONE_RE = /^(?:\+91|91|0)?[6-9]\d{9}$/;
const AADHAAR_RE = /^\d{12}$/;

export function normalizePhone(phone: string): string {
  return phone.replace(/[\s-]/g, "");
}

export function normalizeAadhaar(aadhaar: string): string {
  return aadhaar.replace(/[\s-]/g, "");
}

export function validateRegistration(
  input: RegistrationInput
): ValidationErrors {
  const errors: ValidationErrors = {};

  if (!input.name || input.name.trim().length < 2) {
    errors.name = "Full name is required (min 2 characters).";
  }

  if (!input.email || !EMAIL_RE.test(input.email.trim())) {
    errors.email = "Enter a valid email address.";
  }

  const phone = normalizePhone(input.phone || "");
  if (!phone) {
    errors.phone = "Phone number is required.";
  } else if (!INDIAN_PHONE_RE.test(phone)) {
    errors.phone = "Enter a valid Indian mobile number.";
  }

  if (!input.address || input.address.trim().length < 5) {
    errors.address = "Address is required (min 5 characters).";
  }

  const aadhaar = normalizeAadhaar(input.aadhaarNumber || "");
  if (!aadhaar) {
    errors.aadhaarNumber = "Aadhaar number is required.";
  } else if (!AADHAAR_RE.test(aadhaar)) {
    errors.aadhaarNumber = "Aadhaar number must be exactly 12 digits.";
  }

  return errors;
}

export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}
