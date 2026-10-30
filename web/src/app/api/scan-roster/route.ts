import { NextRequest, NextResponse } from 'next/server';

// Sliding-window in-memory rate limiter (SEC-13: 5 requests per IP per minute)
interface RateLimitRecord {
    timestamps: number[];
}

const rateLimitStore = new Map<string, RateLimitRecord>();
const RATE_LIMIT_WINDOW_MS = 60 * 1000; // 1 minute
const MAX_REQUESTS_PER_WINDOW = 5; // max 5 requests per minute

function getClientIp(req: NextRequest): string {
    const forwarded = req.headers.get('x-forwarded-for');
    if (forwarded) {
        return forwarded.split(',')[0].trim();
    }
    const realIp = req.headers.get('x-real-ip');
    if (realIp) {
        return realIp.trim();
    }
    return '127.0.0.1';
}

function checkRateLimit(ip: string): { allowed: boolean; retryAfter: number } {
    const now = Date.now();
    const record = rateLimitStore.get(ip) || { timestamps: [] };

    // Filter out timestamps older than the sliding window
    const recent = record.timestamps.filter((ts) => now - ts < RATE_LIMIT_WINDOW_MS);

    if (recent.length >= MAX_REQUESTS_PER_WINDOW) {
        const oldest = recent[0];
        const retryAfterMs = RATE_LIMIT_WINDOW_MS - (now - oldest);
        return {
            allowed: false,
            retryAfter: Math.ceil(retryAfterMs / 1000),
        };
    }

    recent.push(now);
    rateLimitStore.set(ip, { timestamps: recent });

    // Periodic prune of inactive IPs
    if (rateLimitStore.size > 200) {
        for (const [key, val] of rateLimitStore.entries()) {
            const active = val.timestamps.filter((ts) => now - ts < RATE_LIMIT_WINDOW_MS);
            if (active.length === 0) {
                rateLimitStore.delete(key);
            } else {
                rateLimitStore.set(key, { timestamps: active });
            }
        }
    }

    return { allowed: true, retryAfter: 0 };
}

export async function POST(req: NextRequest) {
    try {
        // SEC-13 Rate Limiting Check
        const clientIp = getClientIp(req);
        const rateLimit = checkRateLimit(clientIp);

        if (!rateLimit.allowed) {
            return NextResponse.json(
                {
                    success: false,
                    error: `अति विनंत्या (Rate limit exceeded). कृपया ${rateLimit.retryAfter} सेकंदांनंतर पुन्हा प्रयत्न करा. एका मिनिटात कमाल ५ वेळा विनंती करता येईल.`,
                },
                {
                    status: 429,
                    headers: {
                        'Retry-After': String(rateLimit.retryAfter),
                    },
                }
            );
        }

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
