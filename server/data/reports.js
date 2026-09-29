// DEMO REPORTS — eRTMAC-NWIS Sample Historical Reports
// All content is illustrative sample data — clearly labelled DEMO DATA

const reports = [
  {
    id: 1,
    title: "Daily Drilling Report #212",
    asset: "MW-27",
    date: "14 Jun 2024",
    type: "DDR",
    status: "Verified",
    wellId: "MW-27",
    depth: "3,840–3,850 m",
    formation: "Fatehgarh Sandstone",
    summary:
      "Directional drilling continued in the 8½″ section with stable hydraulics. Torque increased while drilling the current formation interval and was flagged for engineer review. Cuttings returns remained stable throughout the shift.",
    metrics: [
      ["Current depth", "3,847 m MD"],
      ["Formation", "Fatehgarh Sandstone"],
      ["Mud weight", "11.6 ppg"],
      ["ROP", "18.6 m/h"],
      ["Torque", "22.8 kft-lb"],
      ["WOB", "14.2 klbf"],
      ["Flow rate", "910 gpm"],
    ],
    event:
      "Torque increased 18% over the last 40 m while drilling through the current interval. Trend flagged as matching MW-19 pre-stall signature.",
    notes:
      "Circulation and cuttings returns remain stable. Monitor torque response at the next connection before resuming full drilling parameters. Engineer has acknowledged alert and is reviewing hole cleaning parameters.",
    relevance:
      "Pattern is relevant to a historical offset-well pack-off event in MW-19 (Drilling Report #147, 12 Mar 2023) and has been flagged for engineer review. Historical similarity: 92% — high confidence.",
    source: "DDR-212 · Tour 2",
    related: "MW-19 · 2023 pack-off precursor",
    verificationStatus: "Verified",
    verifier: "Operations Assurance",
    dataLabel: "DEMO DATA · Sample Historical Report",
  },
  {
    id: 2,
    title: "Torque Trend Evidence Pack",
    asset: "MW-27",
    date: "14 Jun 2024",
    type: "EVIDENCE",
    status: "Verified",
    wellId: "MW-27",
    depth: "3,840–3,850 m",
    formation: "Fatehgarh Sandstone",
    summary:
      "Consolidated telemetry, trend overlays, and offset-well evidence supporting the current MW-27 torque alert. Evidence pack generated from live telemetry and approved historical records.",
    metrics: [
      ["Review window", "Last 40 m"],
      ["Torque change", "+18%"],
      ["Historical Similarity", "92%"],
      ["Evidence items", "4 verified"],
      ["Telemetry rate", "1 sec"],
      ["Model confidence", "High"],
      ["Reviewer", "Operations Assurance"],
    ],
    event:
      "Sustained torque rise with reduced ROP mirrors the onset signature recorded before the MW-19 pack-off. Supporting Evidence: 4 verified historical records confirm pattern relevance.",
    notes:
      "Evidence pack generated from live telemetry and approved historical records. No unverified sources included. All evidence items cross-referenced against Operations Assurance records.",
    relevance:
      "Directly supports alert AL-27-084 and the recommendation to review hole cleaning parameters. Primary analogue: MW-19 End of Well Report, Section 6.4.",
    source: "EV-27-0614 · Revision 1",
    related: "MW-19 · Drilling Report #147",
    verificationStatus: "Verified",
    verifier: "Operations Assurance",
    dataLabel: "DEMO DATA · Supporting Evidence Pack",
  },
  {
    id: 3,
    title: "End of Well Report — MW-19",
    asset: "MW-19",
    date: "12 Mar 2023",
    type: "EOWR",
    status: "Verified",
    wellId: "MW-19",
    depth: "3,890–3,910 m",
    formation: "Fatehgarh Sandstone",
    summary:
      "Final operational record for MW-19, including 8½″ section performance, non-productive time summary, observed events, and lessons learned. Pack-off precursor event at 3,906 m is now a primary reference for the Fatehgarh Sandstone interval.",
    metrics: [
      ["Final depth", "4,112 m MD"],
      ["Formation", "Fatehgarh Sandstone"],
      ["Average ROP", "17.9 m/h"],
      ["Section NPT", "4.8 h"],
      ["Peak torque", "25.1 kft-lb"],
      ["Event depth", "3,906 m"],
      ["Record owner", "Well Delivery"],
    ],
    event:
      "Pack-off precursor developed after progressive torque increase and reduced cuttings return at 3,890–3,906 m. Condition escalated over 40 m with torque rising from 18.4 to 25.1 kft-lb.",
    notes:
      "Condition was mitigated by stopping drilling, circulating bottoms-up, and conditioning the hole for 3.2 hours. Full recovery achieved before resuming drilling. Lessons learned: earlier intervention at torque threshold reduces NPT.",
    relevance:
      "Primary historical analogue for current MW-27 torque behaviour with 92% pattern similarity. This record is cited in the MW-27 Torque Trend Evidence Pack (EV-27-0614).",
    source: "EOWR-MW19 · Section 6.4",
    related: "MW-27 · Alert AL-27-084",
    verificationStatus: "Verified",
    verifier: "Well Delivery / Operations Assurance",
    dataLabel: "DEMO DATA · Sample Historical Report",
  },
  {
    id: 4,
    title: "BOP Inspection Record",
    asset: "PAD B-02",
    date: "10 Jun 2024",
    type: "HSE",
    status: "Review due",
    wellId: "PAD B-02",
    depth: "Surface system",
    formation: "N/A · equipment assurance",
    summary:
      "Weekly BOP control-system and pressure assurance inspection record for PAD B-02. All physical checks passed. Engineer signature attachment remains due for evidence completion before end of shift.",
    metrics: [
      ["Inspection", "Weekly"],
      ["Annular test", "Pass"],
      ["Ram test", "Pass"],
      ["Accumulator", "3,000 psi"],
      ["Function test", "Complete"],
      ["Exceptions", "None"],
      ["Next due", "17 Jun 2024"],
    ],
    event:
      "No operational defect observed. All BOP systems functional. Engineer signature attachment remains due to complete the evidence record.",
    notes:
      "All physical checks passed without exception. Upload signed checklist before the end of the current shift to close the low-severity evidence reminder.",
    relevance:
      "Supports the low-severity evidence reminder in the active risk register. Historical reference: PAD A-07 weekly verification template used as compliance baseline.",
    source: "HSE-BOP-0610",
    related: "PAD B-02 · Evidence alert",
    verificationStatus: "Review due",
    verifier: "HSE / Operations Assurance",
    dataLabel: "DEMO DATA · Sample HSE Record",
  },
  {
    id: 5,
    title: "Daily Drilling Report #206",
    asset: "MW-21",
    date: "06 Jun 2024",
    type: "DDR",
    status: "Verified",
    wellId: "MW-21",
    depth: "3,605–3,612 m",
    formation: "Barmer Hill",
    summary:
      "8½″ section drilling in Barmer Hill formation. Mud weight drift of 0.3 ppg below section plan observed. Engineer flagged for review. Pit volume stable; no influx indicators.",
    metrics: [
      ["Current depth", "3,612 m MD"],
      ["Formation", "Barmer Hill"],
      ["Mud weight", "11.3 ppg (plan: 11.6 ppg)"],
      ["ROP", "12.4 m/h"],
      ["WOB", "12.8 klbf"],
      ["RPM", "108"],
      ["Flow rate", "840 gpm"],
    ],
    event:
      "Mud weight drifted 0.3 ppg below plan over the last 7 m. No visible influx. Pit volume stable. Historical Similarity: 78% match to MW-08 Barmer Hill section mud-weight event.",
    notes:
      "Engineer review in progress. Circulating bottoms-up before any mud weight adjustment. Flow check negative.",
    relevance:
      "Matches two Barmer Hill section incidents in MW-08 (Nov 2021) involving transient influx after mud-weight deviation. Supporting Evidence: End of Section Report MW-08.",
    source: "DDR-206 · Tour 1",
    related: "MW-08 · Barmer Hill section report",
    verificationStatus: "Verified",
    verifier: "Drilling Engineer / Operations Assurance",
    dataLabel: "DEMO DATA · Sample Historical Report",
  },
  {
    id: 6,
    title: "Stuck Pipe Incident Report — MW-14",
    asset: "MW-14",
    date: "22 Sep 2022",
    type: "EOWR",
    status: "Verified",
    wellId: "MW-14",
    depth: "4,330–4,380 m",
    formation: "Fatehgarh Sandstone",
    summary:
      "Stuck pipe event at 4,340 m in the Fatehgarh Sandstone interval during final section approach. NPT of 18.4 hours incurred. Remediation successful. Well suspended for further assessment.",
    metrics: [
      ["Event depth", "4,340 m MD"],
      ["Formation", "Fatehgarh Sandstone"],
      ["NPT", "18.4 h"],
      ["WOB at incident", "17.8 klbf"],
      ["Torque at incident", "26.4 kft-lb"],
      ["Remediation", "Back-reaming + jarring"],
      ["Final status", "Suspended"],
    ],
    event:
      "Drill string became stuck after ROP dropped and torque exceeded 26 kft-lb threshold. Differential sticking suspected in tight Fatehgarh interval. Pipe freed after 18.4 hours of remediation.",
    notes:
      "Lessons learned: reduce WOB when torque exceeds 24 kft-lb in tight Fatehgarh intervals. Maintain circulation at all times in this formation window. This interval is now a reference event for directional wells approaching 4,300+ m in the Fatehgarh Sandstone.",
    relevance:
      "MW-14 stuck pipe event provides supporting historical evidence for torque threshold management in Fatehgarh Sandstone wells including MW-27 and MW-19.",
    source: "IR-MW14-2022 · Section 4",
    related: "MW-27 · Torque monitoring",
    verificationStatus: "Verified",
    verifier: "Well Delivery / HSE / Operations Assurance",
    dataLabel: "DEMO DATA · Sample Incident Report",
  },
];

module.exports = { reports };
