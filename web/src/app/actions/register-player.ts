'use server';

import { createServerSupabase } from '@/lib/supabase/server';
import { PlayerRegistrationSchema } from '@/lib/validations/player';
import { revalidatePath } from 'next/cache';

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

        // Mandatory Document Uploads Validation
        const photoFile = formData.get('photoFile') as File;
        const aadharFile = formData.get('aadharFile') as File;
        const idProofFile = formData.get('idProofFile') as File;
        const dobProofFile = formData.get('dobProofFile') as File;
        const otherDocFile = formData.get('otherDocFile') as File | null;

        if (!photoFile || !aadharFile || !idProofFile || !dobProofFile) {
            return {
                success: false,
                error: 'All 4 mandatory documents are required / सर्व ४ मुख्य कागदपत्रे आवश्यक आहेत'
            };
        }

        const uploadFile = async (file: File, prefix: string) => {
            const ext = file.name.split('.').pop();
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
        const recordsToInsert = payload.players.map((p, idx) => {
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