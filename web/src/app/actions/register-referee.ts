'use server';

import { createServerSupabase } from '@/lib/supabase/server';
import { RefereeRegistrationSchema } from '@/lib/validations/referee';
import { revalidatePath } from 'next/cache';

export async function registerRefereeAction(formData: FormData) {
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
            residentialDistrictId: formData.get('residentialDistrictId'),
            taluka: formData.get('taluka') || undefined,
            city: formData.get('city') || undefined,
            pincode: formData.get('pincode'),
            fullAddress: formData.get('fullAddress'),
            affiliatedDistrictId: formData.get('affiliatedDistrictId'),
            refereeGrade: formData.get('refereeGrade'),
            examYear: formData.get('examYear') || undefined,
            experienceYears: formData.get('experienceYears') || 0,
            termsAccepted: formData.get('termsAccepted') === 'on',
        };

        const parsed = RefereeRegistrationSchema.safeParse(rawData);
        if (!parsed.success) {
            return { success: false, errors: parsed.error.flatten().fieldErrors };
        }

        const supabase = await createServerSupabase();

        const photoFile = formData.get('photoFile') as File;
        const idProofFile = formData.get('idProofFile') as File;
        const certificateFile = formData.get('certificateFile') as File;

        if (!photoFile || !idProofFile || !certificateFile) {
            return {
                success: false,
                error: 'सर्व आवश्यक कागदपत्रे (फोटो, ओळख पुरावा, पंच प्रमाणपत्र) आवश्यक आहेत',
            };
        }

        const uploadDoc = async (file: File, prefix: string) => {
            const ext = file.name.split('.').pop();
            const path = `referee_${prefix}_${crypto.randomUUID()}.${ext}`;
            const buffer = Buffer.from(await file.arrayBuffer());
            const { error } = await supabase.storage.from('player-documents').upload(path, buffer, {
                contentType: file.type,
                upsert: false,
            });
            if (error) throw new Error(`Upload failed: ${error.message}`);
            return path;
        };

        const [photoPath, idProofPath, certificatePath] = await Promise.all([
            uploadDoc(photoFile, 'photo'),
            uploadDoc(idProofFile, 'id'),
            uploadDoc(certificateFile, 'cert'),
        ]);

        const { data, error } = await supabase.from('referees').insert({
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
            affiliated_district_id: parsed.data.affiliatedDistrictId,
            referee_grade: parsed.data.refereeGrade,
            exam_year: parsed.data.examYear || null,
            experience_years: parsed.data.experienceYears,
            photo_path: photoPath,
            id_proof_path: idProofPath,
            certificate_path: certificatePath,
            status: 'PENDING',
        }).select('id').single();

        if (error) throw new Error(error.message);

        revalidatePath('/register/referee');
        return { success: true, trackingId: data.id };
    } catch (err: any) {
        return { success: false, error: err.message || 'Server error occurred' };
    }
}