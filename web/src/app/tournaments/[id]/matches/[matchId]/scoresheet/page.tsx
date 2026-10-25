'use client';

import React, { useEffect, useState, Suspense } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { getMatchScoresheetDetailsAction } from '@/app/actions/match-actions';

const CHECKBOX_IMG = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAGQAAABkAgMAAAANjH3HAAAAAXNSR0IB2cksfwAAAAlwSFlzAAALEwAACxMBAJqcGAAAAAxQTFRFAAAAAAAAAAAAAAAANek3lgAAAAR0Uk5TACDf/6B8FicAAAE9SURBVHicdc25dQJAEATRGQcFgSLBJCGUCU8JIYKBIHAEe+8c3eV+o1RwelMihxeT44PJ5UpEbycih9eTyPHxS+RyPWMpmy8sZfONpWx+sJTNHUrdCJS6wVI3WOoGSttAaRsobQOlbZD0DZK+QdI3SPoGyNgAGRsgYwNkbLLMTZa5yTI3WeYmydokWZska5NkbaLsTZS9ibI3UfYmiNkEMZsgZhPEbLzYjRe78WI3XuzGids4cRsnbuPEbaz4jRW/seI3VvzGSNgYCRsjYWMkbLbEzZa42RI3W+JmSdosSZslabMkbabkzZS8mZI3U/JmCNgMAZshYDMEbLqgTRe06YI2XdCmCdw0gZsmcNMEbqrgTRW8qYI3VfCmCNkUIZsiZFOEbETZRpRtRNlGlG1E/8hG9E02RchG9J9s5AP/0KrNoSWEbwAAAABJRU5ErkJggg==";

function ScoresheetView() {
    const params = useParams();
    const id = params?.id as string;
    const matchId = params?.matchId as string;

    const [loading, setLoading] = useState(true);
    const [data, setData] = useState<any>(null);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        async function fetchScoresheet() {
            if (!matchId) return;
            setLoading(true);
            const res = await getMatchScoresheetDetailsAction(matchId);
            if (res.success && res.match) {
                setData(res);
            } else {
                setError(res.error || 'गुणपत्रिका माहिती लोड करता आली नाही.');
            }
            setLoading(false);
        }
        fetchScoresheet();
    }, [matchId]);

    if (loading) {
        return (
            <div className="min-h-screen bg-white flex flex-col items-center justify-center p-6 text-[#6750A4]">
                <div className="w-10 h-10 border-4 border-[#6750A4] border-t-transparent rounded-full animate-spin mb-4" />
                <p className="font-bold text-sm">अधिकृत गुणपत्रिका तयार होत आहे... / Generating Official Scoresheet...</p>
            </div>
        );
    }

    if (error || !data) {
        return (
            <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-6 text-center space-y-4">
                <div className="text-red-600 font-bold text-sm">{error || 'सामना माहिती उपलब्ध नाही.'}</div>
                <Link href={`/tournaments/${id}`} className="px-5 py-2.5 rounded-full bg-[#6750A4] text-white text-xs font-bold">
                    ← स्पर्धा केंद्राकडे परत जा
                </Link>
            </div>
        );
    }

    const { match, teamASquad, teamBSquad } = data;

    const teamAPlayers = Array.from({ length: 15 }, (_, i) => {
        const p = teamASquad?.tournament_squad_players?.[i];
        return p?.player
            ? `${p.player.surname || ''} ${p.player.first_name || ''} ${p.player.middle_name || ''}`.trim().toUpperCase()
            : '';
    });

    const teamBPlayers = Array.from({ length: 15 }, (_, i) => {
        const p = teamBSquad?.tournament_squad_players?.[i];
        return p?.player
            ? `${p.player.surname || ''} ${p.player.first_name || ''} ${p.player.middle_name || ''}`.trim().toUpperCase()
            : '';
    });

    return (
        <div className="min-h-screen bg-gray-200 p-2 md:p-6 print:p-0 print:bg-white text-black font-sans">
            <style jsx global>{`
        @page {
          size: A4 portrait;
          margin: 2mm 3mm;
        }
        @media print {
          html, body {
            background: white !important;
            padding: 0 !important;
            margin: 0 !important;
            width: 100%;
          }
          .no-print {
            display: none !important;
          }
          .official-table {
            page-break-inside: avoid !important;
          }
        }
        .official-table {
          width: 100%;
          border-collapse: collapse;
          border: 1px solid black;
          font-family: Arial, Helvetica, sans-serif;
          text-transform: uppercase;
        }
        .official-table th,
        .official-table td {
          border: 1px solid black;
          padding: 1px 2px;
          line-height: normal;
        }
        .h01 {
          font-size: 16px;
          font-weight: 900;
          color: #000;
          line-height: 1.2;
          letter-spacing: 0.5px;
        }
        .h02 {
          font-size: 13px;
          font-weight: normal;
          color: #000;
          line-height: 1.2;
        }
        .h03 {
          font-size: 11.5px;
          font-weight: normal;
          color: #000;
          line-height: 1.2;
        }
        .h04 {
          font-size: 11px;
          font-weight: bold;
          color: #000;
          line-height: 1.2;
        }
        .h05 {
          font-size: 10px;
          font-weight: bold;
          color: #000;
          line-height: 1.2;
        }
        .nrm {
          font-size: 9.5px;
          font-weight: normal;
          color: #000;
          line-height: 1.15;
        }
        .sml {
          font-size: 8.5px;
          font-weight: normal;
          color: #000;
          line-height: 1.1;
        }
        .sml-white {
          font-size: 8.5px;
          font-weight: bold;
          color: #ffffff;
          line-height: 1.1;
        }
      `}</style>

            {/* Screen Toolbar */}
            <div className="max-w-[1000px] mx-auto mb-4 flex justify-between items-center no-print bg-white p-3 rounded-2xl shadow-sm border border-gray-300">
                <Link
                    href={`/tournaments/${id}/matches/${matchId}`}
                    className="text-xs font-bold text-[#6750A4] hover:underline"
                >
                    ← थेट सामना कक्षाकडे परत जा (Back to Scorer)
                </Link>
                <button
                    onClick={() => window.print()}
                    className="px-6 py-2 rounded-full bg-[#6750A4] text-white text-xs font-bold hover:bg-[#523e85] shadow-md transition-all flex items-center gap-2 cursor-pointer active:scale-95"
                >
                    🖨️ अधिकृत गुणपत्रिका प्रिंट करा (Print Official Scoresheet)
                </button>
            </div>

            {/* Scoresheet Sheet */}
            <div className="max-w-[1000px] mx-auto bg-white p-3 print:p-0 shadow-lg print:shadow-none border border-gray-400 print:border-none">
                <table className="official-table">
                    <tbody>
                        {/* R1: Header with Logo */}
                        <tr>
                            <td colSpan={9} rowSpan={6} align="center" valign="middle" style={{ borderBottom: '1px solid #fff' }}>
                                <div className="flex flex-col items-center justify-center p-0.5">
                                    {/* eslint-disable-next-line @next/next/no-img-element */}
                                    <img
                                        src="/mkka-logo.png"
                                        alt="MKKA Official Logo"
                                        className="w-[100px] h-[100px] object-contain"
                                    />
                                </div>
                            </td>
                            <td colSpan={20} rowSpan={2} className="h01" align="center" valign="middle">
                                MAHARASHTRA KHO-KHO ASSOCIATION
                            </td>
                            <td colSpan={7} rowSpan={2} align="center" className="nrm" valign="middle">
                                AFFILIATED<br />
                                <strong>KHO KHO FEDERATION OF INDIA</strong><br />
                                MAHARASHTRA OLYMPIC ASSOCIATION
                            </td>
                            <td colSpan={8} align="center" className="h02">
                                <strong>SCORESHEET</strong>
                            </td>
                        </tr>

                        {/* R2: Symbols */}
                        <tr>
                            <td colSpan={8} align="center">
                                <span className="h05">SYMBOLS</span>
                            </td>
                        </tr>

                        {/* R3: Tournament Name */}
                        <tr>
                            <td colSpan={27} rowSpan={2}>
                                <span className="h02">TOURNAMENT : </span>
                                <span className="h02 font-bold">{match.tournament?.name_mr || match.tournament?.name_en}</span>
                            </td>
                            <td colSpan={3} className="sml">SIMPLE TOUCH</td>
                            <td width="2%" align="center" className="sml font-bold">S</td>
                            <td colSpan={3} className="sml">POST DIVE</td>
                            <td width="2%" align="center" className="sml font-bold">P</td>
                        </tr>

                        {/* R4: Late Entry & Dive */}
                        <tr>
                            <td colSpan={3} className="sml">LATE ENTRY</td>
                            <td width="2%" align="center" className="sml font-bold">L</td>
                            <td colSpan={3} className="sml">DIVE</td>
                            <td width="2%" align="center" className="sml font-bold">D</td>
                        </tr>

                        {/* R5: Venue */}
                        <tr>
                            <td colSpan={27}>
                                <span className="h03 font-bold">VENUE : </span>
                                <span className="h03">{match.tournament?.venue_ground || 'शिवछत्रपती क्रीडानगरी, बालेवाडी, पुणे'}</span>
                            </td>
                            <td colSpan={3} className="sml">OUT OF FIELD</td>
                            <td width="2%" align="center" className="sml font-bold">O</td>
                            <td colSpan={3} className="sml">TAP</td>
                            <td width="2%" align="center" className="sml font-bold">T</td>
                        </tr>

                        {/* R6: Date, Time, Court, Match No */}
                        <tr>
                            <td colSpan={6} className="nrm">DATE : {new Date(match.scheduled_time).toLocaleDateString('en-IN')}</td>
                            <td colSpan={6} className="nrm">TIME : {new Date(match.scheduled_time).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}</td>
                            <td colSpan={5} className="nrm">COURT NO. : {match.court_number}</td>
                            <td colSpan={4} className="nrm">MATCH NO. : #{match.match_number}</td>
                            <td colSpan={4} align="center" className="nrm">{match.round_type === 'LEAGUE' ? 'LEAGUE' : 'KNOCK OUT'}</td>
                            <td colSpan={2} align="center" className="nrm font-bold">MORNING</td>
                            <td colSpan={3} className="sml">WARNING</td>
                            <td width="2%" align="center" className="sml font-bold">W</td>
                            <td colSpan={3} className="sml">BLUE CARD</td>
                            <td width="2%" align="center" className="sml font-bold">B</td>
                        </tr>

                        {/* R7: Section, Group, Toss */}
                        <tr>
                            <td colSpan={9} rowSpan={2} align="center" className="h03" style={{ borderTop: '1px solid #fff' }}>
                                <strong>MAHARASHTRA KHO KHO ASSOCIATION</strong>
                            </td>
                            <td colSpan={6} className="nrm">
                                SECTION : {match.tournament?.category === 'SENIOR' ? 'SENIOR MEN / WOMEN' : 'SUB-JUNIOR (U-14)'}
                            </td>
                            <td colSpan={6} align="center" className="nrm">MEN / WOMEN / BOYS / GIRLS</td>
                            <td colSpan={5} align="center" className="nrm">GROUP : {match.pool || 'A'}</td>
                            <td colSpan={4} align="center" className="nrm">TOSS WON BY TEAM : A / B</td>
                            <td colSpan={4} align="center" className="nrm">CHOICE - DEFENCE / CHASE</td>
                            <td colSpan={2} align="center" className="nrm font-bold">EVENING</td>
                            <td colSpan={3} className="sml">SUDDEN ATTACK</td>
                            <td width="2%" align="center" className="sml font-bold">SA</td>
                            <td colSpan={3} className="sml">YELLOW CARD</td>
                            <td width="2%" align="center" className="sml font-bold">Y</td>
                        </tr>

                        {/* R8: Team A & Team B Names */}
                        <tr>
                            <td colSpan={13}>
                                <span className="nrm"><strong>TEAM A :</strong></span>{' '}
                                <span className="h04">{match.team_a?.name_mr} ({match.team_a?.code})</span>
                            </td>
                            <td colSpan={14}>
                                <span className="nrm"><strong>TEAM B :</strong></span>{' '}
                                <span className="h04">{match.team_b?.name_mr} ({match.team_b?.code})</span>
                            </td>
                            <td colSpan={3} className="sml">TURN CLOSE</td>
                            <td width="2%" align="center" className="sml font-bold">][</td>
                            <td colSpan={3} className="sml">RED CARD</td>
                            <td width="2%" align="center" className="sml font-bold">F</td>
                        </tr>

                        {/* R9: Header for Players */}
                        <tr>
                            <td width="2%" rowSpan={2} align="center" className="nrm font-bold">CHEST</td>
                            <td colSpan={8} align="center" className="nrm"><strong>NAME OF PLAYERS</strong></td>
                            <td width="2%">&nbsp;</td>
                            <td colSpan={8} align="center" className="nrm font-bold">DEFENCE - TURNS</td>
                            <td colSpan={4} align="center" className="nrm font-bold">CHASE - TURNS</td>
                            <td width="2%" rowSpan={2} align="center" className="nrm font-bold">CHEST</td>
                            <td colSpan={8} align="center" className="nrm"><strong>NAME OF PLAYERS</strong></td>
                            <td width="2%">&nbsp;</td>
                            <td colSpan={8} align="center" className="nrm font-bold">DEFENCE - TURNS</td>
                            <td colSpan={4} align="center" className="nrm font-bold">CHASE - TURNS</td>
                        </tr>

                        {/* R10: Turns Subheaders */}
                        <tr>
                            <td colSpan={8} className="h04">TEAM A</td>
                            <td width="2%" align="center" className="nrm font-bold">W</td>
                            <td colSpan={3} align="center" className="nrm">I</td>
                            <td colSpan={2} align="center" className="nrm">II</td>
                            <td colSpan={2} align="center" className="nrm">III</td>
                            <td width="2%" align="center" className="nrm">IV</td>
                            <td width="2%" align="center" className="nrm">I</td>
                            <td width="2%" align="center" className="nrm">II</td>
                            <td width="2%" align="center" className="nrm">III</td>
                            <td width="2%" align="center" className="nrm">IV</td>
                            <td colSpan={8} className="h04">TEAM B</td>
                            <td width="2%" align="center" className="nrm font-bold">W</td>
                            <td colSpan={3} align="center" className="nrm">I</td>
                            <td colSpan={2} align="center" className="nrm">II</td>
                            <td colSpan={2} align="center" className="nrm">III</td>
                            <td width="2%" align="center" className="nrm">IV</td>
                            <td width="2%" align="center" className="nrm">I</td>
                            <td width="2%" align="center" className="nrm">II</td>
                            <td width="2%" align="center" className="nrm">III</td>
                            <td width="2%" align="center" className="nrm">IV</td>
                        </tr>

                        {/* R11 to R25: 15 Players Rows */}
                        {Array.from({ length: 15 }).map((_, idx) => (
                            <tr key={idx} className="h-[16px]">
                                {/* Team A */}
                                <td width="2%" align="center" className="nrm font-bold font-mono">{idx + 1}</td>
                                <td colSpan={8}>
                                    <span className="nrm">{teamAPlayers[idx]}</span>
                                </td>
                                <td width="2%" align="center">
                                    <img src={CHECKBOX_IMG} width="12" height="12" alt="check" />
                                </td>
                                <td width="2%">&nbsp;</td>
                                <td width="2%">&nbsp;</td>
                                <td width="2%">&nbsp;</td>
                                <td width="2%">&nbsp;</td>
                                <td width="2%">&nbsp;</td>
                                <td width="2%">&nbsp;</td>
                                <td width="2%">&nbsp;</td>
                                <td width="2%">&nbsp;</td>
                                <td width="2%">&nbsp;</td>
                                <td width="2%">&nbsp;</td>
                                <td width="2%">&nbsp;</td>
                                <td width="2%">&nbsp;</td>

                                {/* Team B */}
                                <td width="2%" align="center" className="nrm font-bold font-mono">{idx + 1}</td>
                                <td colSpan={8}>
                                    <span className="nrm">{teamBPlayers[idx]}</span>
                                </td>
                                <td width="2%" align="center">
                                    <img src={CHECKBOX_IMG} width="12" height="12" alt="check" />
                                </td>
                                <td width="2%">&nbsp;</td>
                                <td width="2%">&nbsp;</td>
                                <td width="2%">&nbsp;</td>
                                <td width="2%">&nbsp;</td>
                                <td width="2%">&nbsp;</td>
                                <td width="2%">&nbsp;</td>
                                <td width="2%">&nbsp;</td>
                                <td width="2%">&nbsp;</td>
                                <td width="2%">&nbsp;</td>
                                <td width="2%">&nbsp;</td>
                                <td width="2%">&nbsp;</td>
                                <td width="2%">&nbsp;</td>
                            </tr>
                        ))}

                        {/* R26: Manager */}
                        <tr>
                            <td colSpan={9}>
                                <span className="nrm"><strong>MANAGER :</strong> {teamASquad?.manager_name ? teamASquad.manager_name.toUpperCase() : ''}</span>
                            </td>
                            <td align="center">
                                <img src={CHECKBOX_IMG} width="12" height="12" alt="check" />
                            </td>
                            <td rowSpan={3} align="center" className="sml font-bold leading-tight">
                                B<br />A<br />T<br />C<br />H
                            </td>
                            <td rowSpan={3}>&nbsp;</td>
                            <td width="2%" rowSpan={3}>&nbsp;</td>
                            <td rowSpan={3}>&nbsp;</td>
                            <td colSpan={8} align="center" className="nrm font-bold">SUBSTITUTES</td>
                            <td colSpan={9}>
                                <span className="nrm"><strong>MANAGER :</strong> {teamBSquad?.manager_name ? teamBSquad.manager_name.toUpperCase() : ''}</span>
                            </td>
                            <td align="center">
                                <img src={CHECKBOX_IMG} width="12" height="12" alt="check" />
                            </td>
                            <td rowSpan={3} align="center" className="sml font-bold leading-tight">
                                B<br />A<br />T<br />C<br />H
                            </td>
                            <td rowSpan={3}>&nbsp;</td>
                            <td width="2%" rowSpan={3}>&nbsp;</td>
                            <td rowSpan={3}>&nbsp;</td>
                            <td colSpan={8} align="center" className="nrm font-bold">SUBSTITUTES</td>
                        </tr>

                        {/* R27: Coach */}
                        <tr>
                            <td colSpan={9}>
                                <span className="nrm"><strong>COACH :</strong> {teamASquad?.coach_name ? teamASquad.coach_name.toUpperCase() : ''}</span>
                            </td>
                            <td align="center"><img src={CHECKBOX_IMG} width="12" height="12" alt="check" /></td>
                            {Array.from({ length: 8 }).map((_, i) => (
                                <td key={`sub-a-${i}`} align="center"><img src={CHECKBOX_IMG} width="12" height="12" alt="check" /></td>
                            ))}
                            <td colSpan={9}>
                                <span className="nrm"><strong>COACH :</strong> {teamBSquad?.coach_name ? teamBSquad.coach_name.toUpperCase() : ''}</span>
                            </td>
                            <td align="center"><img src={CHECKBOX_IMG} width="12" height="12" alt="check" /></td>
                            {Array.from({ length: 8 }).map((_, i) => (
                                <td key={`sub-b-${i}`} align="center"><img src={CHECKBOX_IMG} width="12" height="12" alt="check" /></td>
                            ))}
                        </tr>

                        {/* R28: Supporting Staff */}
                        <tr>
                            <td colSpan={9} className="nrm"><strong>SUPPORTING STAFF :</strong></td>
                            <td align="center"><img src={CHECKBOX_IMG} width="12" height="12" alt="check" /></td>
                            {Array.from({ length: 8 }).map((_, i) => (
                                <td key={`staff-a-${i}`} align="center"><img src={CHECKBOX_IMG} width="12" height="12" alt="check" /></td>
                            ))}
                            <td colSpan={9} className="nrm"><strong>SUPPORTING STAFF :</strong></td>
                            <td align="center"><img src={CHECKBOX_IMG} width="12" height="12" alt="check" /></td>
                            {Array.from({ length: 8 }).map((_, i) => (
                                <td key={`staff-b-${i}`} align="center"><img src={CHECKBOX_IMG} width="12" height="12" alt="check" /></td>
                            ))}
                        </tr>

                        {/* R29 */}
                        <tr>
                            <td colSpan={2} className="sml">LATE ENTRY - B</td>
                            <td colSpan={3} align="center" className="sml">OUT OF FIELD - B</td>
                            <td colSpan={2} align="center" className="sml">WARNING - B</td>
                            <td colSpan={3} align="center" className="sml">DREAM RUN - B</td>
                            <td colSpan={12} align="center" className="sml font-bold">BATCHES OF 'B'</td>
                            <td colSpan={2} className="sml">LATE ENTRY - A</td>
                            <td colSpan={3} align="center" className="sml">OUT OF FIELD - A</td>
                            <td colSpan={2} align="center" className="sml">WARNING - A</td>
                            <td colSpan={3} align="center" className="sml">DREAM RUN - A</td>
                            <td colSpan={12} align="center" className="sml font-bold">BATCHES OF 'A'</td>
                        </tr>

                        {/* R30 */}
                        <tr>
                            <td colSpan={2} rowSpan={2}>&nbsp;</td>
                            <td colSpan={3} rowSpan={2}>&nbsp;</td>
                            <td colSpan={2} rowSpan={2}>&nbsp;</td>
                            <td colSpan={2} rowSpan={2} style={{ borderRight: '1px solid #fff' }}>&nbsp;</td>
                            <td style={{ borderBottom: '1px solid #fff' }}>&nbsp;</td>
                            <td colSpan={3} align="center" className="nrm">I</td>
                            <td colSpan={4} align="center" className="nrm">II</td>
                            <td colSpan={4} align="center" className="nrm">III</td>
                            <td align="center" className="nrm">IV</td>
                            <td colSpan={2} rowSpan={2}>&nbsp;</td>
                            <td colSpan={3} rowSpan={2}>&nbsp;</td>
                            <td colSpan={2} rowSpan={2}>&nbsp;</td>
                            <td colSpan={2} rowSpan={2} style={{ borderRight: '1px solid #fff' }}>&nbsp;</td>
                            <td style={{ borderBottom: '1px solid #fff' }}>&nbsp;</td>
                            <td colSpan={3} align="center" className="nrm">I</td>
                            <td colSpan={4} align="center" className="nrm">II</td>
                            <td colSpan={4} align="center" className="nrm">III</td>
                            <td align="center" className="nrm">IV</td>
                        </tr>

                        {/* R31 */}
                        <tr>
                            <td style={{ borderTop: '1px solid #fff' }}>&nbsp;</td>
                            {Array.from({ length: 12 }).map((_, i) => (
                                <td key={`b1-${i}`} rowSpan={4}>&nbsp;</td>
                            ))}
                            <td style={{ borderTop: '1px solid #fff' }}>&nbsp;</td>
                            {Array.from({ length: 12 }).map((_, i) => (
                                <td key={`b2-${i}`} rowSpan={4}>&nbsp;</td>
                            ))}
                        </tr>

                        {/* R32 */}
                        <tr>
                            <td colSpan={2} rowSpan={2}>&nbsp;</td>
                            <td colSpan={3} rowSpan={2}>&nbsp;</td>
                            <td colSpan={2} rowSpan={2}>&nbsp;</td>
                            <td colSpan={2} rowSpan={2} style={{ borderRight: '1px solid #fff' }}>&nbsp;</td>
                            <td style={{ borderBottom: '1px solid #fff' }}>&nbsp;</td>
                            <td colSpan={2} rowSpan={2}>&nbsp;</td>
                            <td colSpan={3} rowSpan={2}>&nbsp;</td>
                            <td colSpan={2} rowSpan={2}>&nbsp;</td>
                            <td colSpan={2} rowSpan={2} style={{ borderRight: '1px solid #fff' }}>&nbsp;</td>
                            <td style={{ borderBottom: '1px solid #fff' }}>&nbsp;</td>
                        </tr>

                        {/* R33 */}
                        <tr>
                            <td style={{ borderTop: '1px solid #fff' }}>&nbsp;</td>
                            <td style={{ borderTop: '1px solid #fff' }}>&nbsp;</td>
                        </tr>

                        {/* R34 */}
                        <tr>
                            <td colSpan={10} align="center" className="nrm font-bold bg-gray-50">POINTS SCORED BY TEAM - A</td>
                            <td colSpan={10} align="center" className="nrm font-bold bg-gray-50">POINTS SCORED BY TEAM - B</td>
                        </tr>

                        {/* R35 to R39: Set 1 of Running Score */}
                        <tr>
                            <td colSpan={3} className="sml font-bold">DEF. - B - NO.</td>
                            {Array.from({ length: 19 }).map((_, i) => <td key={`d1-${i}`} width="2%">&nbsp;</td>)}
                            <td colSpan={3} className="sml font-bold">DEF. - A - NO.</td>
                            {Array.from({ length: 19 }).map((_, i) => <td key={`d2-${i}`} width="2%">&nbsp;</td>)}
                        </tr>
                        <tr>
                            <td colSpan={3} className="sml font-bold">ATC. - A - NO.</td>
                            {Array.from({ length: 19 }).map((_, i) => <td key={`a1-${i}`} width="2%">&nbsp;</td>)}
                            <td colSpan={3} className="sml font-bold">ATC. - B - NO.</td>
                            {Array.from({ length: 19 }).map((_, i) => <td key={`a2-${i}`} width="2%">&nbsp;</td>)}
                        </tr>
                        <tr>
                            <td colSpan={3} className="sml font-bold">RUN TIME</td>
                            {Array.from({ length: 19 }).map((_, i) => <td key={`rt1-${i}`} width="2%">&nbsp;</td>)}
                            <td colSpan={3} className="sml font-bold">RUN TIME</td>
                            {Array.from({ length: 19 }).map((_, i) => <td key={`rt2-${i}`} width="2%">&nbsp;</td>)}
                        </tr>
                        <tr>
                            <td colSpan={3} className="sml font-bold">PER TIME</td>
                            {Array.from({ length: 19 }).map((_, i) => <td key={`pt1-${i}`} width="2%">&nbsp;</td>)}
                            <td colSpan={3} className="sml font-bold">PER TIME</td>
                            {Array.from({ length: 19 }).map((_, i) => <td key={`pt2-${i}`} width="2%">&nbsp;</td>)}
                        </tr>
                        <tr>
                            <td colSpan={3} className="sml font-bold">SYMBOL</td>
                            {Array.from({ length: 19 }).map((_, i) => <td key={`sy1-${i}`} width="2%">&nbsp;</td>)}
                            <td colSpan={3} className="sml font-bold">SYMBOL</td>
                            {Array.from({ length: 19 }).map((_, i) => <td key={`sy2-${i}`} width="2%">&nbsp;</td>)}
                        </tr>

                        {/* R40 to R44: Set 2 of Running Score */}
                        <tr>
                            <td colSpan={3} className="sml font-bold">DEF. - B - NO.</td>
                            {Array.from({ length: 19 }).map((_, i) => <td key={`d3-${i}`} width="2%">&nbsp;</td>)}
                            <td colSpan={3} className="sml font-bold">DEF. - A - NO.</td>
                            {Array.from({ length: 19 }).map((_, i) => <td key={`d4-${i}`} width="2%">&nbsp;</td>)}
                        </tr>
                        <tr>
                            <td colSpan={3} className="sml font-bold">ATC. - A - NO.</td>
                            {Array.from({ length: 19 }).map((_, i) => <td key={`a3-${i}`} width="2%">&nbsp;</td>)}
                            <td colSpan={3} className="sml font-bold">ATC. - B - NO.</td>
                            {Array.from({ length: 19 }).map((_, i) => <td key={`a4-${i}`} width="2%">&nbsp;</td>)}
                        </tr>
                        <tr>
                            <td colSpan={3} className="sml font-bold">RUN TIME</td>
                            {Array.from({ length: 19 }).map((_, i) => <td key={`rt3-${i}`} width="2%">&nbsp;</td>)}
                            <td colSpan={3} className="sml font-bold">RUN TIME</td>
                            {Array.from({ length: 19 }).map((_, i) => <td key={`rt4-${i}`} width="2%">&nbsp;</td>)}
                        </tr>
                        <tr>
                            <td colSpan={3} className="sml font-bold">PER TIME</td>
                            {Array.from({ length: 19 }).map((_, i) => <td key={`pt3-${i}`} width="2%">&nbsp;</td>)}
                            <td colSpan={3} className="sml font-bold">PER TIME</td>
                            {Array.from({ length: 19 }).map((_, i) => <td key={`pt4-${i}`} width="2%">&nbsp;</td>)}
                        </tr>
                        <tr>
                            <td colSpan={3} className="sml font-bold">SYMBOL</td>
                            {Array.from({ length: 19 }).map((_, i) => <td key={`sy3-${i}`} width="2%">&nbsp;</td>)}
                            <td colSpan={3} className="sml font-bold">SYMBOL</td>
                            {Array.from({ length: 19 }).map((_, i) => <td key={`sy4-${i}`} width="2%">&nbsp;</td>)}
                        </tr>

                        {/* R45: Summary Header */}
                        <tr>
                            <td colSpan={2} className="sml font-bold">POINTS</td>
                            <td width="2%" className="sml font-bold">TURNS</td>
                            <td colSpan={2} align="center" className="sml font-bold">I</td>
                            <td colSpan={2} align="center" className="sml font-bold">II</td>
                            <td colSpan={2} align="center" className="sml font-bold">III</td>
                            <td colSpan={2} align="center" className="sml font-bold">IV</td>
                            <td colSpan={2} rowSpan={2} align="center" className="sml font-bold">
                                GRAND<br />TOTAL
                            </td>
                            <td colSpan={9} className="sml font-bold">REMARKS:</td>
                            <td colSpan={7} rowSpan={2} className="sml" valign="top">
                                SCORER - 1 :<br />NAME :
                            </td>
                            <td colSpan={7} rowSpan={2} className="sml" valign="top">
                                UMPIRE - 1 :<br />NAME :
                            </td>
                            <td colSpan={8} rowSpan={2} className="sml" valign="top">
                                POST UMPIRE - 1 :<br />NAME :
                            </td>
                        </tr>

                        {/* R46: Sub-header */}
                        <tr>
                            <td colSpan={2} className="sml font-bold">SCORED BY</td>
                            <td width="2%" align="center">
                                <img src={CHECKBOX_IMG} width="12" height="12" alt="check" />
                            </td>
                            <td width="2%" align="center" className="sml">S</td>
                            <td width="2%" align="center" style={{ backgroundColor: '#5F5F5F' }} className="sml-white">DR</td>
                            <td width="2%" align="center" className="sml">S</td>
                            <td width="2%" align="center" style={{ backgroundColor: '#5F5F5F' }} className="sml-white">DR</td>
                            <td width="2%" align="center" className="sml">S</td>
                            <td width="2%" align="center" style={{ backgroundColor: '#5F5F5F' }} className="sml-white">DR</td>
                            <td colSpan={2} align="center" className="sml font-bold">TIME</td>
                            <td colSpan={9}>&nbsp;</td>
                        </tr>

                        {/* R47: Team A Score (Left blank for manual pen entry) */}
                        <tr>
                            <td colSpan={3} rowSpan={2} className="nrm font-bold">
                                TEAM - A ({match.team_a?.code})
                            </td>
                            <td width="2%" rowSpan={2}>&nbsp;</td>
                            <td width="2%" rowSpan={2}>&nbsp;</td>
                            <td width="2%" rowSpan={2}>&nbsp;</td>
                            <td width="2%" rowSpan={2}>&nbsp;</td>
                            <td width="2%" rowSpan={2}>&nbsp;</td>
                            <td width="2%" rowSpan={2}>&nbsp;</td>
                            <td colSpan={2} rowSpan={2}>&nbsp;</td>
                            <td colSpan={2} rowSpan={2} align="center" className="h04 font-mono font-black text-sm">
                                &nbsp;
                            </td>
                            <td colSpan={9}>&nbsp;</td>
                            <td colSpan={7} rowSpan={2} className="sml" valign="top">
                                SCORER - 2 :<br />NAME :
                            </td>
                            <td colSpan={7} rowSpan={2} className="sml" valign="top">
                                UMPIRE - 2 :<br />NAME :
                            </td>
                            <td colSpan={8} rowSpan={2} className="sml" valign="top">
                                POST UMPIRE - 2 :<br />NAME :
                            </td>
                        </tr>

                        {/* R48 */}
                        <tr>
                            <td colSpan={9}>&nbsp;</td>
                        </tr>

                        {/* R49: Team B Score (Left blank for manual pen entry) */}
                        <tr>
                            <td colSpan={3} rowSpan={2} className="nrm font-bold">
                                TEAM - B ({match.team_b?.code})
                            </td>
                            <td width="2%" rowSpan={2}>&nbsp;</td>
                            <td width="2%" rowSpan={2}>&nbsp;</td>
                            <td width="2%" rowSpan={2}>&nbsp;</td>
                            <td width="2%" rowSpan={2}>&nbsp;</td>
                            <td width="2%" rowSpan={2}>&nbsp;</td>
                            <td width="2%" rowSpan={2}>&nbsp;</td>
                            <td colSpan={2} rowSpan={2}>&nbsp;</td>
                            <td colSpan={2} rowSpan={2} align="center" className="h04 font-mono font-black text-sm">
                                &nbsp;
                            </td>
                            <td colSpan={9}>&nbsp;</td>
                            <td width="2%" colSpan={7} rowSpan={3} valign="top" className="sml">
                                DUGOUT - 1 & 2 :<br />NAME :
                            </td>
                            <td width="2%" colSpan={7} rowSpan={3} valign="top" className="sml">
                                TIMEKEEPER :<br />NAME :
                            </td>
                            <td width="2%" colSpan={8} rowSpan={3} valign="top" className="sml">
                                REFEREE :<br />NAME :
                            </td>
                        </tr>

                        {/* R50 */}
                        <tr>
                            <td colSpan={9}>&nbsp;</td>
                        </tr>

                        {/* R51: Result (Left blank for manual pen entry) */}
                        <tr>
                            <td colSpan={11} className="nrm font-bold" style={{ borderRight: '1px solid #fff' }}>
                                RESULT : TEAM A/B
                            </td>
                            <td colSpan={11} className="nrm font-bold" style={{ borderLeft: '1px solid #fff' }}>
                                WON BY &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; POINTS
                            </td>
                        </tr>

                        {/* R52: 44 Columns Width Def */}
                        <tr className="h-0 border-none p-0 m-0">
                            {Array.from({ length: 44 }).map((_, i) => (
                                <td key={`grid-col-${i}`} width="2%" className="h-0 p-0 border-none m-0" />
                            ))}
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>
    );
}

export default function MatchScoresheetPage() {
    return (
        <Suspense
            fallback={
                <div className="min-h-screen bg-white flex flex-col items-center justify-center p-6 text-[#6750A4]">
                    <div className="w-10 h-10 border-4 border-[#6750A4] border-t-transparent rounded-full animate-spin mb-4" />
                    <p className="font-bold text-sm">लोड होत आहे...</p>
                </div>
            }
        >
            <ScoresheetView />
        </Suspense>
    );
}