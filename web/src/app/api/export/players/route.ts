import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import ExcelJS from "exceljs";
import { createServerClient } from "@supabase/ssr";

function calculateAgeSection(dobString: string): string {
    if (!dobString) return "N/A";
    const birthDate = new Date(dobString);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
        age--;
    }
    if (age < 14) return "Sub Junior (१४ वर्षांखालील)";
    if (age <= 18) return "Junior (१४ ते १८ वर्षे)";
    return "Senior (१८ वर्षांवरील)";
}

export async function GET(request: NextRequest) {
    try {
        const cookieStore = await cookies();
        const adminAuthCookie = cookieStore.get("mkka_admin_auth")?.value;
        const adminSession = cookieStore.get("mkka_admin_session")?.value;

        if (adminAuthCookie !== "authenticated_mkka_admin_2026" && adminSession !== "authenticated") {
            return NextResponse.json({ error: "Unauthorized access" }, { status: 401 });
        }

        const { searchParams } = new URL(request.url);
        const districtId = searchParams.get("districtId");
        const exportAll = searchParams.get("all") === "true";

        const supabase = createServerClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
            {
                cookies: {
                    get(name: string) {
                        return cookieStore.get(name)?.value;
                    },
                    set() { },
                    remove() { },
                },
            }
        );

        let query = supabase
            .from("players")
            .select(`
        id,
        tracking_id,
        first_name,
        middle_name,
        surname,
        father_name,
        mother_name,
        gender,
        dob,
        mobile_no,
        email,
        taluka,
        city,
        pincode,
        full_address,
        status,
        state_no,
        federation_no,
        created_at,
        photo_path,
        address_proof_path,
        id_proof_path,
        dob_proof_path,
        other_doc_path,
        playing_district:districts!players_playing_district_id_fkey(name_en, name_mr, code),
        residential_district:districts!players_residential_district_id_fkey(name_en, name_mr, code)
      `)
            .order("created_at", { ascending: false });

        if (!exportAll && districtId) {
            query = query.eq("playing_district_id", districtId);
        }

        const { data: players, error } = await query;

        if (error) {
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        const workbook = new ExcelJS.Workbook();
        workbook.creator = "Maharashtra Kho-Kho Association (MKKA)";
        workbook.lastModifiedBy = "MKKA Scrutiny Management";
        workbook.created = new Date();

        const worksheet = workbook.addWorksheet("Players Registry", {
            views: [{ state: "frozen", ySplit: 2 }],
        });

        worksheet.mergeCells("A1:U1");
        const titleCell = worksheet.getCell("A1");
        titleCell.value = "MAHARASHTRA KHO-KHO ASSOCIATION (MKKA) - OFFICIAL PLAYERS REGISTRY";
        titleCell.font = { name: "Arial", size: 14, bold: true, color: { argb: "FFFFFFFF" } };
        titleCell.fill = {
            type: "pattern",
            pattern: "solid",
            fgColor: { argb: "FF4A148C" },
        };
        titleCell.alignment = { horizontal: "center", vertical: "middle" };
        worksheet.getRow(1).height = 36;

        worksheet.getRow(2).values = [
            "Sr. No / अ.क्र.",
            "State No / राज्य क्र.",
            "Federation No / राष्ट्रीय क्र.",
            "Player Full Name / खेळाडूचे संपूर्ण नाव",
            "Father Name / वडिलांचे नाव",
            "Mother Name / आईचे नाव",
            "Gender / लिंग",
            "Date of Birth / जन्मदिनांक",
            "Age Section / वयोगट",
            "Mobile / मोबाईल क्र.",
            "Email / ईमेल",
            "Playing District / खेळणारा जिल्हा",
            "Residential District / राहणारा जिल्हा",
            "Taluka / तालुका",
            "City / शहर",
            "Pincode / पिनकोड",
            "Full Address / संपूर्ण पत्ता",
            "Status / सद्यस्थिती",
            "Application Tracking ID / अर्ज नोंदणी क्र.",
            "Registration Date / नोंदणी दिनांक",
            "Storage Document Path / कागदपत्र फोल्डर",
        ];

        const headerRow = worksheet.getRow(2);
        headerRow.height = 28;
        headerRow.eachCell((cell) => {
            cell.font = { name: "Arial", size: 10, bold: true, color: { argb: "FFFFFFFF" } };
            cell.fill = {
                type: "pattern",
                pattern: "solid",
                fgColor: { argb: "FF6750A4" },
            };
            cell.alignment = { horizontal: "center", vertical: "middle", wrapText: true };
            cell.border = {
                top: { style: "thin", color: { argb: "FFCAC4D0" } },
                left: { style: "thin", color: { argb: "FFCAC4D0" } },
                bottom: { style: "medium", color: { argb: "FF4A148C" } },
                right: { style: "thin", color: { argb: "FFCAC4D0" } },
            };
        });

        if (players && players.length > 0) {
            players.forEach((player: any, index: number) => {
                const fullName = `${player.first_name || ""} ${player.middle_name || ""} ${player.surname || ""}`.trim();
                const playingDist = player.playing_district ? `${player.playing_district.name_mr} (${player.playing_district.name_en})` : "N/A";
                const resDist = player.residential_district ? `${player.residential_district.name_mr} (${player.residential_district.name_en})` : "N/A";
                const ageSec = calculateAgeSection(player.dob);
                const regDate = player.created_at ? new Date(player.created_at).toLocaleDateString("en-GB") : "N/A";
                const docFolder = player.photo_path ? player.photo_path.split("/").slice(0, -1).join("/") : "documents/players/" + (player.tracking_id || "");

                const row = worksheet.addRow([
                    index + 1,
                    player.state_no || "Pending Approval",
                    player.federation_no || "Not Assigned",
                    fullName,
                    player.father_name || "N/A",
                    player.mother_name || "N/A",
                    player.gender === "MALE" ? "Male / पुरुष" : "Female / महिला",
                    player.dob || "N/A",
                    ageSec,
                    player.mobile_no || "N/A",
                    player.email || "N/A",
                    playingDist,
                    resDist,
                    player.taluka || "N/A",
                    player.city || "N/A",
                    player.pincode || "N/A",
                    player.full_address || "N/A",
                    player.status || "PENDING",
                    player.tracking_id || "N/A",
                    regDate,
                    docFolder,
                ]);

                row.height = 22;
                row.eachCell((cell, colNumber) => {
                    cell.font = { name: "Arial", size: 9 };
                    cell.alignment = {
                        vertical: "middle",
                        horizontal: [1, 2, 3, 7, 8, 9, 10, 16, 18, 20].includes(colNumber) ? "center" : "left",
                    };
                    cell.border = {
                        top: { style: "thin", color: { argb: "FFE0E0E0" } },
                        left: { style: "thin", color: { argb: "FFE0E0E0" } },
                        bottom: { style: "thin", color: { argb: "FFE0E0E0" } },
                        right: { style: "thin", color: { argb: "FFE0E0E0" } },
                    };
                });
            });
        }

        worksheet.columns = [
            { width: 10 },
            { width: 20 },
            { width: 18 },
            { width: 28 },
            { width: 22 },
            { width: 22 },
            { width: 14 },
            { width: 15 },
            { width: 22 },
            { width: 16 },
            { width: 26 },
            { width: 25 },
            { width: 25 },
            { width: 18 },
            { width: 18 },
            { width: 12 },
            { width: 35 },
            { width: 16 },
            { width: 38 },
            { width: 16 },
            { width: 40 },
        ];

        const buffer = await workbook.xlsx.writeBuffer();
        const fileName = exportAll
            ? `MKKA_All_Districts_Players_${new Date().toISOString().split("T")[0]}.xlsx`
            : `MKKA_District_Players_${districtId}_${new Date().toISOString().split("T")[0]}.xlsx`;

        return new NextResponse(buffer, {
            status: 200,
            headers: {
                "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
                "Content-Disposition": `attachment; filename="${fileName}"`,
            },
        });
    } catch (err: any) {
        return NextResponse.json({ error: err.message || "Failed to generate Excel export" }, { status: 500 });
    }
}