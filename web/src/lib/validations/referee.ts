import { z } from 'zod';

export const RefereeRegistrationSchema = z.object({
    firstName: z.string().min(2, 'First name is required'),
    middleName: z.string().min(2, 'Middle name is required'),
    surname: z.string().min(2, 'Surname is required'),
    fatherName: z.string().optional(),
    motherName: z.string().optional(),
    aadharNo: z.string().regex(/^\d{12}$/, 'Valid 12-digit Aadhaar number required'),
    gender: z.enum(['MALE', 'FEMALE']),
    dob: z.string().min(1, 'Date of birth is required'),
    mobileNo: z.string().regex(/^[6-9]\d{9}$/, 'Valid 10-digit mobile number required'),
    reMobileNo: z.string().regex(/^[6-9]\d{9}$/, 'Re-enter mobile number'),
    email: z.string().email('Valid email address required'),
    reEmail: z.string().email('Re-enter email address'),
    residentialDistrictId: z.string().uuid('Select residential district'),
    taluka: z.string().optional(),
    city: z.string().optional(),
    pincode: z.string().regex(/^\d{6}$/, 'Valid 6-digit PIN code required'),
    fullAddress: z.string().min(5, 'Complete residential address required'),
    affiliatedDistrictId: z.string().uuid('Select affiliated district'),
    refereeGrade: z.string().min(1, 'Select referee grade / exam level'),
    examYear: z.string().optional(),
    experienceYears: z.coerce.number().min(0).default(0),
    termsAccepted: z.boolean().refine((val) => val === true, 'You must accept the terms'),
}).refine((data) => data.mobileNo === data.reMobileNo, {
    message: 'Mobile numbers do not match',
    path: ['reMobileNo'],
}).refine((data) => data.email.toLowerCase() === data.reEmail.toLowerCase(), {
    message: 'Email addresses do not match',
    path: ['reEmail'],
});