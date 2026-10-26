// Allowed MIME types for MKKA documents
export const ALLOWED_FILE_TYPES = [
    "image/jpeg",
    "image/png",
    "image/webp",
    "application/pdf",
];

// Maximum allowed size: 2MB (2 * 1024 * 1024 bytes)
export const MAX_FILE_SIZE_BYTES = 2 * 1024 * 1024;

export function validateUploadedFile(file: File): { valid: boolean; error?: string } {
    if (!file || file.size === 0) {
        return { valid: false, error: "फाइल रिकामी किंवा अवैध आहे (File is missing or empty)" };
    }

    // 1. Size Validation (Max 2MB)
    if (file.size > MAX_FILE_SIZE_BYTES) {
        return {
            valid: false,
            error: `फाइलचा आकार २MB पेक्षा जास्त असू नये. (File size exceeds 2MB limit: ${(file.size / (1024 * 1024)).toFixed(1)}MB)`,
        };
    }

    // 2. MIME Type Validation
    if (!ALLOWED_FILE_TYPES.includes(file.type)) {
        return {
            valid: false,
            error: "केवळ JPG, PNG किंवा PDF फॉरमॅटला परवानगी आहे (Only JPG, PNG, or PDF formats allowed)",
        };
    }

    return { valid: true };
}