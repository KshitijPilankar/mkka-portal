import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
    try {
        const formData = await req.formData();
        const file = formData.get('image') as File;

        if (!file) {
            return NextResponse.json({ success: false, error: 'कृपया फोटो किंवा इमेज निवडा.' }, { status: 400 });
        }

        const apiKey = process.env.GEMINI_API_KEY;
        if (!apiKey) {
            return NextResponse.json({ success: false, error: 'GEMINI_API_KEY कॉन्फिगर केलेली नाही.' }, { status: 500 });
        }

        // Convert file to base64
        const bytes = await file.arrayBuffer();
        const base64Data = Buffer.from(bytes).toString('base64');
        const mimeType = file.type || 'image/jpeg';

        const prompt = `
You are an expert OCR and Computer Vision document parser for the Maharashtra Kho-Kho Association (MKKA).
Analyze this image of a paper-written or printed players roster / team entry list.
Extract all the players listed on this sheet into a clean JSON array.

For each player, extract:
1. "first_name": English transliterated first name (capitalized, e.g. "Rahul", "Aditya")
2. "middle_name": English transliterated middle/father name (if present, else empty "")
3. "surname": English transliterated surname/last name (e.g. "Patil", "Jadhav")
4. "dob": Date of birth in YYYY-MM-DD format (if only DD/MM/YYYY is written, convert to YYYY-MM-DD. If missing, estimate a valid birth year or leave "")
5. "gender": "MALE" or "FEMALE" (infer from category context or default "MALE")
6. "mobile_no": 10-digit mobile if present, else ""
7. "aadhar_no": 12-digit Aadhar if present, else ""

Return ONLY a valid JSON array of objects without markdown formatting or code fences:
[
  {
    "first_name": "Rahul",
    "middle_name": "Kashinath",
    "surname": "Jadhav",
    "dob": "2012-04-15",
    "gender": "MALE",
    "mobile_no": "9822100001",
    "aadhar_no": "200000000001"
  }
]
`;

        const response = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
            {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    contents: [
                        {
                            parts: [
                                { text: prompt },
                                {
                                    inline_data: {
                                        mime_type: mimeType,
                                        data: base64Data,
                                    },
                                },
                            ],
                        },
                    ],
                    generationConfig: {
                        temperature: 0.1,
                        response_mime_type: 'application/json',
                    },
                }),
            }
        );

        const result = await response.json();
        const rawText = result.candidates?.[0]?.content?.parts?.[0]?.text;

        if (!rawText) {
            return NextResponse.json({ success: false, error: 'इमेजमधून मजकूर वाचता आला नाही.' }, { status: 500 });
        }

        const cleanJson = rawText.replace(/```json/g, '').replace(/```/g, '').trim();
        const parsedPlayers = JSON.parse(cleanJson);

        return NextResponse.json({ success: true, players: parsedPlayers });
    } catch (err: any) {
        return NextResponse.json({ success: false, error: err.message || 'Parsing failed' }, { status: 500 });
    }
}