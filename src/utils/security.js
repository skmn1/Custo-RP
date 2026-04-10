/**
 * Security & validation utilities for ESS (Employee Self-Service).
 *
 * Provides:
 * - IBAN format validation (ISO 13616)
 * - IBAN / national ID masking for display
 * - Profile field allowlist validation
 * - File upload MIME type validation via magic bytes
 */

// ─── IBAN Validation (ISO 13616) ────────────────────────────────────────────

/**
 * IBAN length table per country code (ISO 13616).
 * Not exhaustive — covers EU/EEA and common SEPA countries.
 */
const IBAN_LENGTHS = {
  AL: 28, AD: 24, AT: 20, AZ: 28, BH: 22, BY: 28, BE: 16, BA: 20,
  BR: 29, BG: 22, CR: 22, HR: 21, CY: 28, CZ: 24, DK: 18, DO: 28,
  TL: 23, EE: 20, FO: 18, FI: 18, FR: 27, GE: 22, DE: 22, GI: 23,
  GR: 27, GL: 18, GT: 28, HU: 28, IS: 26, IQ: 23, IE: 22, IL: 23,
  IT: 27, JO: 30, KZ: 20, XK: 20, KW: 30, LV: 21, LB: 28, LI: 21,
  LT: 20, LU: 20, MK: 19, MT: 31, MR: 27, MU: 30, MC: 27, MD: 24,
  ME: 22, NL: 18, NO: 15, PK: 24, PS: 29, PL: 28, PT: 25, QA: 29,
  RO: 24, LC: 32, SM: 27, SA: 24, RS: 22, SC: 31, SK: 24, SI: 19,
  ES: 24, SE: 24, CH: 21, TN: 24, TR: 26, UA: 29, AE: 23, GB: 22,
  VG: 24,
};

/**
 * Validates an IBAN string:
 * 1. Strips spaces and converts to uppercase
 * 2. Length: 15–34 characters
 * 3. Structure: 2 letter country code + 2 check digits + BBAN
 * 4. Country-specific length validation (if in table)
 * 5. ISO 13616 modular arithmetic check (mod-97)
 *
 * @param {string} iban
 * @returns {{ valid: boolean, error?: string }}
 */
export function validateIban(iban) {
  if (!iban || typeof iban !== 'string') {
    return { valid: false, error: 'IBAN is required' };
  }

  const cleaned = iban.replace(/\s+/g, '').toUpperCase();

  if (cleaned.length < 15 || cleaned.length > 34) {
    return { valid: false, error: 'IBAN must be 15–34 characters' };
  }

  // Structure: 2 letters + 2 digits + alphanumeric BBAN
  if (!/^[A-Z]{2}\d{2}[A-Z0-9]+$/.test(cleaned)) {
    return { valid: false, error: 'Invalid IBAN structure' };
  }

  const country = cleaned.slice(0, 2);
  const expectedLength = IBAN_LENGTHS[country];
  if (expectedLength && cleaned.length !== expectedLength) {
    return { valid: false, error: `IBAN for ${country} must be ${expectedLength} characters` };
  }

  // ISO 13616 check digit validation (mod-97)
  // Move first 4 chars to end, replace letters with digits (A=10, B=11, …, Z=35)
  const rearranged = cleaned.slice(4) + cleaned.slice(0, 4);
  const numericStr = rearranged.replace(/[A-Z]/g, (ch) => String(ch.charCodeAt(0) - 55));

  // Compute mod-97 on the large number (process in chunks to avoid BigInt)
  let remainder = 0;
  for (let i = 0; i < numericStr.length; i++) {
    remainder = (remainder * 10 + parseInt(numericStr[i], 10)) % 97;
  }

  if (remainder !== 1) {
    return { valid: false, error: 'Invalid IBAN check digits' };
  }

  return { valid: true };
}

// ─── Masking helpers ────────────────────────────────────────────────────────

/**
 * Masks an IBAN to show only the country code, check digits, and last 4 characters.
 * e.g. "FR76 3000 6000 0112 3456 7890 189" → "FR76 •••• •••• •••• •••• 0189"
 *
 * @param {string} iban
 * @returns {string}
 */
export function maskIban(iban) {
  if (!iban) return '';
  const cleaned = iban.replace(/\s+/g, '');
  if (cleaned.length <= 8) return cleaned;
  const prefix = cleaned.slice(0, 4);
  const suffix = cleaned.slice(-4);
  const middleLen = cleaned.length - 8;
  const masked = '•'.repeat(middleLen);
  // Format in groups of 4
  const full = prefix + masked + suffix;
  return full.replace(/(.{4})/g, '$1 ').trim();
}

/**
 * Masks a national ID number, showing only the last 3 characters.
 * e.g. "1 85 05 78 006 084 42" → "•••••••••••••• 42"
 *
 * @param {string} nationalId
 * @returns {string}
 */
export function maskNationalId(nationalId) {
  if (!nationalId) return '';
  const cleaned = nationalId.replace(/\s+/g, '');
  if (cleaned.length <= 3) return cleaned;
  return '•'.repeat(cleaned.length - 3) + cleaned.slice(-3);
}

// ─── Profile field allowlists ───────────────────────────────────────────────

export const ALLOWED_EMPLOYEE_FIELDS = [
  'address_line1', 'address_line2', 'city', 'postal_code', 'country',
  'phone', 'nationality', 'birth_date', 'national_id_type', 'national_id_number',
  'profile_photo_key',
];

export const ALLOWED_BANK_FIELDS = [
  'bank_iban', 'bank_bic', 'bank_name', 'bank_account_holder',
];

/**
 * Validates that a field name is in the allowed profile fields list.
 * Prevents SQL injection via dynamic field name interpolation.
 *
 * @param {string} fieldName
 * @returns {boolean}
 */
export function isAllowedProfileField(fieldName) {
  return ALLOWED_EMPLOYEE_FIELDS.includes(fieldName) || ALLOWED_BANK_FIELDS.includes(fieldName);
}

// ─── File upload validation ─────────────────────────────────────────────────

/**
 * Accepted MIME types and their magic byte signatures for upload validation.
 */
const ACCEPTED_FILE_SIGNATURES = [
  { mime: 'application/pdf',  ext: 'pdf',  bytes: [0x25, 0x50, 0x44, 0x46] },           // %PDF
  { mime: 'image/jpeg',       ext: 'jpg',  bytes: [0xFF, 0xD8, 0xFF] },                  // JPEG SOI
  { mime: 'image/png',        ext: 'png',  bytes: [0x89, 0x50, 0x4E, 0x47] },            // PNG header
];

/**
 * Dangerous file types that must always be rejected regardless of content.
 */
const BLOCKED_EXTENSIONS = [
  'exe', 'sh', 'bat', 'cmd', 'com', 'msi', 'ps1', 'vbs', 'js',
  'html', 'htm', 'svg', 'xml', 'xhtml',
];

/** Maximum upload file size in bytes (5 MB). */
export const MAX_UPLOAD_SIZE = 5 * 1024 * 1024;

/**
 * Validates an uploaded file by checking:
 * 1. File is not null/empty
 * 2. Extension is not in the blocked list
 * 3. File size does not exceed maximum
 * 4. Magic bytes match an accepted MIME type
 *
 * @param {File} file - The File object from input[type=file]
 * @returns {Promise<{ valid: boolean, error?: string, mime?: string }>}
 */
export async function validateUploadFile(file) {
  if (!file) {
    return { valid: false, error: 'No file provided' };
  }

  // Check extension
  const ext = (file.name || '').split('.').pop().toLowerCase();
  if (BLOCKED_EXTENSIONS.includes(ext)) {
    return { valid: false, error: `File type .${ext} is not allowed` };
  }

  // Check size
  if (file.size > MAX_UPLOAD_SIZE) {
    return { valid: false, error: `File exceeds maximum size of ${MAX_UPLOAD_SIZE / 1024 / 1024}MB` };
  }

  // Read first 8 bytes for magic byte validation
  const header = await readFileHeader(file, 8);

  for (const sig of ACCEPTED_FILE_SIGNATURES) {
    if (matchesSignature(header, sig.bytes)) {
      return { valid: true, mime: sig.mime };
    }
  }

  return { valid: false, error: 'Unsupported file type. Accepted formats: PDF, JPEG, PNG' };
}

/**
 * Reads the first N bytes from a File object.
 * @param {File} file
 * @param {number} n
 * @returns {Promise<Uint8Array>}
 */
function readFileHeader(file, n) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(new Uint8Array(reader.result));
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsArrayBuffer(file.slice(0, n));
  });
}

/**
 * Checks if a byte array starts with the given signature bytes.
 * @param {Uint8Array} header
 * @param {number[]} signature
 * @returns {boolean}
 */
function matchesSignature(header, signature) {
  if (header.length < signature.length) return false;
  return signature.every((byte, i) => header[i] === byte);
}

// ─── Response sanitisation ──────────────────────────────────────────────────

/**
 * Fields that must never appear in ESS API responses.
 * Used by automated response checking in tests.
 */
export const FORBIDDEN_RESPONSE_FIELDS = [
  'profile_photo_key',
  'document_key',
  'password_hash',
  'token',
];

/**
 * Checks an API response object for forbidden fields (deep scan).
 * Returns an array of found forbidden field names.
 *
 * @param {any} obj - The response object to scan
 * @param {string[]} forbidden - List of forbidden field names
 * @returns {string[]} - Forbidden fields found
 */
export function findForbiddenFields(obj, forbidden = FORBIDDEN_RESPONSE_FIELDS) {
  const found = new Set();
  const scan = (o) => {
    if (o == null || typeof o !== 'object') return;
    if (Array.isArray(o)) {
      o.forEach(scan);
      return;
    }
    for (const key of Object.keys(o)) {
      if (forbidden.includes(key)) found.add(key);
      scan(o[key]);
    }
  };
  scan(obj);
  return [...found];
}
