import { z } from 'zod';

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB[cite: 18, 20]
const ACCEPTED_IMAGE_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'application/pdf']; //[cite: 20]

export const PlayerRegistrationSchema = z.object({
    // 1. Personal Details (वैयक्तिक माहिती)[cite: 18]
    firstName: z.string().min(2, 'First name is required / प्रथम नाव आवश्यक आहे'), //[cite: 18, 19]
    middleName: z.string().min(2, 'Middle name is required / मधले नाव आवश्यक आहे'), //[cite: 18, 19]
    surname: z.string().min(2, 'Surname is required / आडनाव आवश्यक आहे'), //[cite: 18, 19]
    fatherName: z.string().optional(), //[cite: 18, 19]
    motherName: z.string().optional(), //[cite: 18, 19]
    aadharNo: z.string().regex(/^\d{12}$/, 'Aadhaar must be exactly 12 digits / आधार कार्ड १२ अंकी असावे'), //[cite: 18, 19]
    gender: z.enum(['MALE', 'FEMALE'], { message: 'Gender is required / लिंग निवडा' }), //[cite: 18, 19]
    dob: z.string().refine((d) => !isNaN(Date.parse(d)), 'Valid date of birth required / वैध जन्मतारीख आवश्यक'), //[cite: 18, 19]

    // 2. Contact Details (संपर्क तपशील)[cite: 18]
    mobileNo: z.string().regex(/^[6-9]\d{9}$/, 'Enter valid 10-digit mobile number / वैध १० अंकी मोबाईल नंबर टाका'), //[cite: 18, 19]
    reMobileNo: z.string(), //[cite: 18, 19]
    email: z.string().email('Enter valid email address / वैध ईमेल पत्ता टाका'), //[cite: 18, 19]
    reEmail: z.string(), //[cite: 18, 19]

    // 3. Residential & Playing Representation (पत्ता व जिल्हा)[cite: 18]
    residentialDistrictId: z.string().uuid('Select residential district / राहणारा जिल्हा निवडा'), //[cite: 18, 19]
    taluka: z.string().optional(), //[cite: 18, 19]
    city: z.string().optional(), //[cite: 18, 19]
    pincode: z.string().regex(/^\d{6}$/, 'Enter 6-digit pincode / ६ अंकी पिनकोड टाका'), //[cite: 18, 19]
    fullAddress: z.string().min(5, 'Full address is required / संपूर्ण पत्ता आवश्यक आहे'), //[cite: 18, 19]
    playingDistrictId: z.string().uuid('Select playing district / खेळणारा जिल्हा निवडा'), //[cite: 18, 19]

    // 4. Document Files (Validation for file presence and size)[cite: 18, 20]
    termsAccepted: z.literal(true, {
        message: 'You must accept the terms / अटी व शर्ती मान्य करणे आवश्यक आहे',
    }),
}).refine((data) => data.mobileNo === data.reMobileNo, {
    message: 'Mobile numbers do not match / मोबाईल नंबर जुळत नाहीत', //[cite: 19]
    path: ['reMobileNo'],
}).refine((data) => data.email === data.reEmail, {
    message: 'Email addresses do not match / ईमेल पत्ते जुळत नाहीत', //[cite: 19]
    path: ['reEmail'],
});

export type PlayerRegistrationInput = z.infer<typeof PlayerRegistrationSchema>;