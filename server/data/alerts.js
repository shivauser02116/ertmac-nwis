// DEMO ALERTS — eRTMAC-NWIS Sample Data
// All alerts are illustrative demo data. Labels: "DEMO DATA"

let alerts = [
  {
    id: 1,
    severity: "HIGH",
    title: "Elevated torque trend approaching threshold",
    well: "MW-27",
    time: "12 min ago",
    owner: "Drilling",
    copy: "Torque increased 18% over the last 40 m. Pattern matches historical pack-off precursors.",
    state: "Open",
    depth: "3,840–3,850 m MD",
    formation: "Fatehgarh Sandstone",
    historicalWell: "MW-19",
    historicalEvent: "Pack-off precursor before motor stall at 3,906 m",
    historicalSimilarity: "92% · high confidence",
    potentialRisk: "Potential Historical Risk: Pack-off / motor stall if current trend continues without intervention.",
    supportingEvidence: "Torque Trend Evidence Pack · EV-27-0614 · 4 verified telemetry records match MW-19 pre-stall signature.",
    report: "Torque Trend Evidence Pack · EV-27-0614",
    action:
      "Review hole cleaning parameters, circulate bottoms-up, and verify torque response before continuing the interval.",
    engineerNote: "Engineer Verification Required — Do not continue drilling until torque response is confirmed stable.",
  },
  {
    id: 2,
    severity: "MEDIUM",
    title: "Mud weight outside planned window",
    well: "MW-21",
    time: "34 min ago",
    owner: "Fluids",
    copy: "Measured mud weight is 0.3 ppg below the current section plan.",
    state: "Open",
    depth: "3,612 m MD",
    formation: "Barmer Hill",
    historicalWell: "MW-08",
    historicalEvent: "Transient influx after mud-weight deviation at 3,590 m",
    historicalSimilarity: "78% · medium confidence",
    potentialRisk: "Potential Historical Risk: Transient well control event if mud weight not restored to program.",
    supportingEvidence: "Daily Drilling Report #206 · MW-08 End of Section Report · 2 comparable Barmer Hill incidents.",
    report: "Daily Drilling Report #206",
    action:
      "Confirm pit volume and flow check, then restore mud weight to the approved section program.",
    engineerNote: "Engineer Verification Required — Confirm wellbore pressure balance before resuming drilling.",
  },
  {
    id: 3,
    severity: "LOW",
    title: "BOP inspection evidence due",
    well: "PAD B-02",
    time: "Due today",
    owner: "HSE",
    copy: "Required weekly verification record has not yet been attached.",
    state: "Open",
    depth: "Surface system",
    formation: "N/A · equipment assurance",
    historicalWell: "PAD A-07",
    historicalEvent: "Weekly BOP assurance verification — compliance record",
    historicalSimilarity: "Policy match",
    potentialRisk: "Potential Historical Risk: Regulatory non-compliance if inspection evidence not filed by end of shift.",
    supportingEvidence: "BOP Inspection Record · HSE-BOP-0610 · PAD A-07 weekly verification template.",
    report: "BOP Inspection Record · HSE-BOP-0610",
    action:
      "Attach the signed inspection checklist and obtain Operations Assurance verification.",
    engineerNote: "Engineer Verification Required — Signed checklist must be uploaded before shift close.",
  },
  {
    id: 4,
    severity: "MEDIUM",
    title: "Connection gas review in progress",
    well: "MW-32",
    time: "1 h ago",
    owner: "Drilling",
    copy: "Connection gas reading of 3.4% flagged at 2,835 m. Engineer review accepted; monitoring next two connections.",
    state: "Acknowledged",
    depth: "2,835–2,841 m MD",
    formation: "Thumbli Formation",
    historicalWell: "MW-14",
    historicalEvent: "Connection gas show — Thumbli Formation at 2,810 m",
    historicalSimilarity: "81% · medium confidence",
    potentialRisk: "Potential Historical Risk: Sustained influx if gas trend increases without mud weight adjustment.",
    supportingEvidence: "DDR #198 · MW-14 formation evaluation log · PAD B-02 Thumbli gas history.",
    report: "DDR #198",
    action: "Continue monitoring next two connections. Increase mud weight by 0.2 ppg if gas trend exceeds 4.0%.",
    engineerNote: "Engineer Verification Required — Review gas readings at next connection before resuming full WOB.",
  },
  {
    id: 5,
    severity: "LOW",
    title: "Sensor calibration variance",
    well: "MW-27",
    time: "Yesterday",
    owner: "Instrumentation",
    copy: "Torque sensor calibration variance of ±1.2 kft-lb detected during pre-tour checks. Calibration completed and evidence verified.",
    state: "Resolved",
    depth: "3,640 m MD",
    formation: "N/A · instrument check",
    historicalWell: "MW-19",
    historicalEvent: "Sensor calibration record — 2023 pre-production check",
    historicalSimilarity: "Record match",
    potentialRisk: "Potential Historical Risk: Data quality issue — misread torque could mask early warning signals.",
    supportingEvidence: "Calibration Certificate CC-441 · Instrumentation log · MW-19 2023 calibration reference.",
    report: "Calibration Certificate CC-441",
    action: "No further action required. Evidence verified and filed.",
    engineerNote: "Resolved — Calibration complete. No operational impact confirmed.",
  },
];

function getAlerts() {
  return alerts;
}

function updateAlert(id, state) {
  const idx = alerts.findIndex((a) => a.id === id);
  if (idx === -1) return null;
  alerts[idx] = { ...alerts[idx], state };
  return alerts[idx];
}

module.exports = { getAlerts, updateAlert };
