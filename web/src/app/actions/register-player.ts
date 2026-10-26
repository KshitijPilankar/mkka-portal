'use server';

import { createServerSupabase } from '@/lib/supabase/server';
import { PlayerRegistrationSchema } from '@/lib/validations/player';
import { revalidatePath } from 'next/cache';

// Allowed MIME types according to Security Audit Patch 5
const ALLOWED_MIME_TYPES = [
    'image/jpeg',
    'image/png',
    'image/webp',
    'application/pdf',
];

// Maximum allowed size: 2MB (2 * 1024 * 1024 bytes)
const MAX_FILE_SIZE = 2 * 1024 * 1024;

// Server-side file validation helper
function validateUploadedFile(file: File | null, fieldName: string, isRequired = false): { valid: boolean; error?: string } {
    if (!file || file.size === 0) {
        if (isRequired) {
            return { valid: false, error: `${fieldName} अपलोड करणे अनिवार्य आहे.` };
        }
        return { valid: true };
    }

    // 1. File Size Validation (Max 2MB)
    if (file.size > MAX_FILE_SIZE) {
        const sizeMB = (file.size / (1024 * 1024)).toFixed(2);
        return {
            valid: false,
            error: `${fieldName} चा आकार २MB पेक्षा कमी असावा. (सध्याचा आकार: ${sizeMB}MB)`,
        };
    }

    // 2. MIME Type Whitelist Validation
    if (!ALLOWED_MIME_TYPES.includes(file.type)) {
        return {
            valid: false,
            error: `${fieldName} केवळ JPG, PNG किंवा PDF फॉरमॅटमध्येच असावी.`,
        };
    }

    return { valid: true };
}

// Helper to sanitize file extension
function getSafeExtension(originalName: string): string {
    const rawExt = originalName.split('.').pop()?.toLowerCase() || 'jpg';
    return ['jpg', 'jpeg', 'png', 'webp', 'pdf'].includes(rawExt) ? rawExt : 'jpg';
}

export async function registerPlayerAction(formData: FormData) {
    try {
        const rawData = {
            firstName: formData.get('firstName'),
            middleName: formData.get('middleName'),
            surname: formData.get('surname'),
            fatherName: formData.get('fatherName') || undefined,
            motherName: formData.get('motherName') || undefined,
            aadharNo: formData.get('aadharNo'),
            gender: formData.get('gender'),
            dob: formData.get('dob'),
            mobileNo: formData.get('mobileNo'),
            reMobileNo: formData.get('reMobileNo'),
            email: formData.get('email'),
            reEmail: formData.get('reEmail'),
            residentialDistrictId: formData.get('residentialDistrictId')?.toString()?.trim() || '',
            taluka: formData.get('taluka') || undefined,
            city: formData.get('city') || undefined,
            pincode: formData.get('pincode'),
            fullAddress: formData.get('fullAddress'),
            playingDistrictId: formData.get('playingDistrictId')?.toString()?.trim() || '',
            termsAccepted: formData.get('termsAccepted') === 'on',
        };

        const parsed = PlayerRegistrationSchema.safeParse(rawData);
        if (!parsed.success) {
            return { success: false, errors: parsed.error.flatten().fieldErrors };
        }

        const supabase = await createServerSupabase();

        // Extract Uploaded Files
        const photoFile = formData.get('photoFile') as File | null;
        const aadharFile = formData.get('aadharFile') as File | null;
        const idProofFile = formData.get('idProofFile') as File | null;
        const dobProofFile = formData.get('dobProofFile') as File | null;
        const otherDocFile = formData.get('otherDocFile') as File | null;

        // Mandatory Document Presence Check
        if (!photoFile || !aadharFile || !idProofFile || !dobProofFile) {
            return {
                success: false,
                error: 'All 4 mandatory documents are required / सर्व ४ मुख्य कागदपत्रे आवश्यक आहेत',
            };
        }

        // Strict Server-Side File Validations (Patch 5)
        const photoValidation = validateUploadedFile(photoFile, 'खेळाडूचा फोटो (Photo)', true);
        if (!photoValidation.valid) {
            return { success: false, error: photoValidation.error };
        }

        const aadharValidation = validateUploadedFile(aadharFile, 'पत्ता पुरावा / आधार (Address Proof)', true);
        if (!aadharValidation.valid) {
            return { success: false, error: aadharValidation.error };
        }

        const idProofValidation = validateUploadedFile(idProofFile, 'ओळख पुरावा (ID Proof)', true);
        if (!idProofValidation.valid) {
            return { success: false, error: idProofValidation.error };
        }

        const dobProofValidation = validateUploadedFile(dobProofFile, 'जन्म दाखला (DOB Proof)', true);
        if (!dobProofValidation.valid) {
            return { success: false, error: dobProofValidation.error };
        }

        const otherValidation = validateUploadedFile(otherDocFile, 'इतर कागदपत्र (Other Document)', false);
        if (!otherValidation.valid) {
            return { success: false, error: otherValidation.error };
        }

        // Upload Helper with Sanitized Extensions
        const uploadFile = async (file: File, prefix: string) => {
            const ext = getSafeExtension(file.name);
            const path = `${prefix}_${crypto.randomUUID()}.${ext}`;
            const buffer = Buffer.from(await file.arrayBuffer());
            const { error } = await supabase.storage.from('player-documents').upload(path, buffer, {
                contentType: file.type,
                upsert: false,
            });
            if (error) throw new Error(`Upload failed: ${error.message}`);
            return path;
        };

        const [photoPath, addressProofPath, idProofPath, dobProofPath] = await Promise.all([
            uploadFile(photoFile, 'photo'),
            uploadFile(aadharFile, 'address'),
            uploadFile(idProofFile, 'id'),
            uploadFile(dobProofFile, 'dob'),
        ]);

        let otherDocPath = null;
        if (otherDocFile && otherDocFile.size > 0) {
            otherDocPath = await uploadFile(otherDocFile, 'other');
        }

        // Insert Player Record in Pending Status
        const { data, error } = await supabase.from('players').insert({
            first_name: parsed.data.firstName,
            middle_name: parsed.data.middleName,
            surname: parsed.data.surname,
            father_name: parsed.data.fatherName || null,
            mother_name: parsed.data.motherName || null,
            aadhar_no: parsed.data.aadharNo,
            gender: parsed.data.gender,
            dob: parsed.data.dob,
            mobile_no: parsed.data.mobileNo,
            email: parsed.data.email,
            residential_district_id: parsed.data.residentialDistrictId,
            taluka: parsed.data.taluka || null,
            city: parsed.data.city || null,
            pincode: parsed.data.pincode,
            full_address: parsed.data.fullAddress,
            playing_district_id: parsed.data.playingDistrictId,
            current_district_id: parsed.data.playingDistrictId,
            photo_path: photoPath,
            address_proof_path: addressProofPath,
            id_proof_path: idProofPath,
            dob_proof_path: dobProofPath,
            other_doc_path: otherDocPath,
            status: 'PENDING',
        }).select('id').single();

        if (error) {
            return { success: false, error: error.message };
        }

        revalidatePath('/register/player');
        return { success: true, trackingId: data.id };
    } catch (err: any) {
        return { success: false, error: err.message || 'Server error occurred' };
    }
}

// कागदावरून स्कॅन केलेल्या खेळाडूंची एकाच वेळी डेटाबेसमध्ये नोंद करणे
export async function batchRegisterScannedPlayersAction(payload: {
    districtId: string;
    players: Array<{
        first_name: string;
        middle_name?: string;
        surname: string;
        dob: string;
        gender: 'MALE' | 'FEMALE';
        mobile_no?: string;
        aadhar_no?: string;
    }>;
}) {
    try {
        const supabase = await createServerSupabase();

        const currentYear = new Date().getFullYear();
        const recordsToInsert = payload.players.map((p) => {
            const randomSix = Math.floor(100000 + Math.random() * 900000);
            return {
                first_name: p.first_name.trim(),
                middle_name: p.middle_name?.trim() || 'Kumar',
                surname: p.surname.trim(),
                email: `${p.first_name.toLowerCase()}.${p.surname.toLowerCase()}${randomSix}@mkka.org`,
                dob: p.dob || '2012-06-01',
                gender: p.gender || 'MALE',
                mobile_no: p.mobile_no || `9822${Math.floor(100000 + Math.random() * 900000)}`,
                aadhar_no: p.aadhar_no || `2026${Math.floor(10000000 + Math.random() * 90000000)}`,
                playing_district_id: payload.districtId,
                current_district_id: payload.districtId,
                residential_district_id: payload.districtId,
                status: 'APPROVED',
                player_id_number: `MKKA-${currentYear}-DIST-${randomSix}`,
                photo_path: 'demo/player-photo.jpg',
                approved_at: new Date().toISOString(),
            };
        });

        const { data, error } = await supabase.from('players').insert(recordsToInsert).select('id');

        if (error) throw new Error(error.message);

        return { success: true, count: data.length };
    } catch (err: any) {
        return { success: false, error: err.message || 'Batch registration failed' };
    }
}