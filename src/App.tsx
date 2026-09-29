import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type KeyboardEvent,
  type ReactNode,
} from "react";

// ─── Types ──────────────────────────────────────────────────────────────────

type Page =
  | "Overview"
  | "Active Well"
  | "Nearby / Offset Wells"
  | "Historical Intelligence"
  | "Risk & Alerts"
  | "Reports & Evidence"
  | "AI Assistant"
  | "Profile / Account";

type IconName =
  | "grid"
  | "activity"
  | "map"
  | "history"
  | "alert"
  | "report"
  | "spark"
  | "search"
  | "bell"
  | "chevron"
  | "arrow"
  | "more"
  | "check"
  | "well"
  | "user"
  | "settings"
  | "help"
  | "logout"
  | "download"
  | "filter"
  | "send"
  | "clock";

type WellId = "MW-27" | "MW-21" | "MW-19" | "MW-32" | "MW-14" | "PAD B-02";

type WellOverviewData = {
  depth: string;
  depthValue: string;
  status: string;
  formation: string;
  activity: string;
  alerts: string;
  history: string;
  rop: string;
  wob: string;
  rpm: string;
  flow: string;
  performanceStatus: string;
  performanceTone: "green" | "amber" | "blue" | "gray";
  chartPath: string;
  chartEndY: number;
  insight: string;
  evidence: string;
  hookLoad?: string;
  torque?: string;
  standpipe?: string;
  mudWeight?: string;
  ecd?: string;
  gas?: string;
  timeToTD?: string;
  field?: string;
  pad?: string;
  type?: string;
  section?: string;
  targetDepth?: string;
  ropPlan?: string;
  timeline?: { time: string; event: string; status: string }[];
};

type AlertState = "Open" | "Acknowledged" | "Resolved";
type RiskItem = {
  id: number;
  severity: "HIGH" | "MEDIUM" | "LOW";
  title: string;
  well: string;
  time: string;
  owner: string;
  copy: string;
  state: AlertState;
  depth: string;
  formation: string;
  historicalWell: string;
  historicalEvent: string;
  historicalSimilarity: string;
  potentialRisk: string;
  supportingEvidence: string;
  report: string;
  action: string;
  engineerNote?: string;
};

// ─── Fallback inline data (used while API loads / if API is unavailable) ────

const wellData: Record<WellId, WellOverviewData> = {
  "MW-27": {
    depth: "3,847 m MD", depthValue: "3,847", status: "Drilling", formation: "Fatehgarh Sandstone", activity: "Directional drilling · 8½″ section", alerts: "1 high · torque trend", history: "4 comparable events",
    rop: "18.6 m/h", wob: "14.2 klbf", rpm: "126", flow: "910 gpm", performanceStatus: "ON PLAN", performanceTone: "green",
    chartPath: "M0 174 C80 168 100 148 160 151 S250 132 300 136 S370 109 430 115 S510 87 570 91 S650 54 760 48", chartEndY: 48,
    insight: "Torque response at 3,840–3,850 m resembles the pre-stall pattern recorded in offset well MW-19.", evidence: "Based on 4 verified records",
    hookLoad: "247 klbf", torque: "22.8 kft-lb", standpipe: "3,420 psi", mudWeight: "11.6 ppg", ecd: "12.1 ppg", gas: "1.8 %", timeToTD: "17.4 h",
    timeline: [
      { time: "18:00", event: "Run in hole", status: "done" },
      { time: "20:24", event: "Drilling 8½″ section", status: "done" },
      { time: "01:10", event: "Directional drilling", status: "current" },
      { time: "05:30", event: "Connection & survey", status: "planned" },
    ],
  },
  "MW-21": {
    depth: "3,612 m MD", depthValue: "3,612", status: "Drilling", formation: "Barmer Hill", activity: "Circulating before connection", alerts: "1 medium · mud weight", history: "2 comparable events",
    rop: "12.4 m/h", wob: "12.8 klbf", rpm: "108", flow: "840 gpm", performanceStatus: "WATCH", performanceTone: "amber",
    chartPath: "M0 182 C70 176 120 158 170 164 S245 137 310 145 S390 128 450 132 S525 101 590 111 S680 86 760 94", chartEndY: 94,
    insight: "Mud-weight drift at 3,605–3,612 m resembles two Barmer Hill circulation events and remains within the engineer review window.", evidence: "Based on 3 verified records",
    hookLoad: "231 klbf", torque: "19.1 kft-lb", standpipe: "3,180 psi", mudWeight: "11.3 ppg", ecd: "11.9 ppg", gas: "0.9 %", timeToTD: "26.1 h",
    timeline: [
      { time: "14:00", event: "Drill 8½″ section", status: "done" },
      { time: "22:10", event: "Mud weight check", status: "done" },
      { time: "01:30", event: "Circulate bottoms-up", status: "current" },
      { time: "04:00", event: "Resume drilling", status: "planned" },
    ],
  },
  "MW-19": {
    depth: "4,112 m MD", depthValue: "4,112", status: "Completed", formation: "Fatehgarh Sandstone", activity: "Production handover", alerts: "No open alerts", history: "Pack-off event · 2023",
    rop: "17.9 m/h", wob: "13.6 klbf", rpm: "118", flow: "875 gpm", performanceStatus: "COMPLETED", performanceTone: "blue",
    chartPath: "M0 186 C65 171 110 178 155 150 S235 145 290 118 S365 126 420 96 S495 104 545 73 S625 82 680 51 S730 43 760 35", chartEndY: 35,
    insight: "The completed MW-19 interval records a pack-off precursor at 3,906 m that now serves as verified historical evidence for nearby wells.", evidence: "Based on 7 verified records",
    hookLoad: "—", torque: "—", standpipe: "—", mudWeight: "—", ecd: "—", gas: "—", timeToTD: "Completed",
    timeline: [
      { time: "Final", event: "Well completed", status: "done" },
      { time: "TD", event: "TD at 4,112 m", status: "done" },
      { time: "P&A", event: "Plug and abandon section", status: "done" },
      { time: "HOC", event: "Handover complete", status: "done" },
    ],
  },
  "MW-32": {
    depth: "2,841 m MD", depthValue: "2,841", status: "Drilling", formation: "Thumbli Formation", activity: "Drilling 12¼″ section", alerts: "1 medium · connection gas show", history: "3 comparable events",
    rop: "21.3 m/h", wob: "16.4 klbf", rpm: "142", flow: "960 gpm", performanceStatus: "WATCH", performanceTone: "amber",
    chartPath: "M0 168 C60 162 100 152 155 158 S230 140 290 128 S360 134 420 119 S500 107 560 98 S640 88 760 82", chartEndY: 82,
    insight: "Elevated connection gas at 2,835–2,841 m (3.4%) matches Thumbli Formation gas shows documented in MW-14 and PAD B-02 historical records.", evidence: "Based on 3 verified records",
    hookLoad: "218 klbf", torque: "16.2 kft-lb", standpipe: "2,890 psi", mudWeight: "10.8 ppg", ecd: "11.4 ppg", gas: "3.4 %", timeToTD: "35.6 h",
    timeline: [
      { time: "08:00", event: "Spud 12¼″ section", status: "done" },
      { time: "15:30", event: "Gas show flagged", status: "done" },
      { time: "18:45", event: "Drilling with monitoring", status: "current" },
      { time: "06:00", event: "Next connection survey", status: "planned" },
    ],
  },
  "MW-14": {
    depth: "4,380 m MD", depthValue: "4,380", status: "Suspended", formation: "Fatehgarh Sandstone", activity: "Well suspended — NPT review", alerts: "No open alerts", history: "Stuck pipe event · 2022",
    rop: "0.0 m/h", wob: "0.0 klbf", rpm: "0", flow: "0 gpm", performanceStatus: "SUSPENDED", performanceTone: "gray",
    chartPath: "M0 188 C55 178 90 170 140 165 S210 158 270 142 S340 152 400 136 S470 128 530 119 S610 112 680 108 S740 105 760 102", chartEndY: 102,
    insight: "MW-14 was suspended after a stuck pipe event at 4,340 m in the Fatehgarh Sandstone — this interval is now a reference event for nearby directional wells.", evidence: "Based on 5 verified records",
    hookLoad: "—", torque: "—", standpipe: "—", mudWeight: "12.1 ppg", ecd: "—", gas: "—", timeToTD: "Suspended",
    timeline: [
      { time: "Final", event: "Stuck pipe incident", status: "done" },
      { time: "TD", event: "NPT — 18.4 h", status: "done" },
      { time: "Remediation", event: "Well control procedures", status: "done" },
      { time: "Current", event: "Suspended · under review", status: "current" },
    ],
  },
  "PAD B-02": {
    depth: "2,986 m MD", depthValue: "2,986", status: "Producing", formation: "Thumbli Formation", activity: "Routine integrity monitoring", alerts: "1 low · evidence due", history: "BOP inspection history",
    rop: "0.0 m/h", wob: "0.0 klbf", rpm: "0", flow: "Production", performanceStatus: "STABLE", performanceTone: "green",
    chartPath: "M0 61 C95 62 145 58 220 62 S345 64 420 60 S545 58 620 62 S705 59 760 60", chartEndY: 60,
    insight: "PAD B-02 remains operationally stable; the current intelligence item is a BOP inspection evidence reminder due this shift.", evidence: "Based on 5 assurance records",
    hookLoad: "—", torque: "—", standpipe: "—", mudWeight: "—", ecd: "—", gas: "—", timeToTD: "Producing",
    timeline: [
      { time: "Daily", event: "Production monitoring", status: "current" },
      { time: "Weekly", event: "BOP inspection due", status: "current" },
      { time: "Monthly", event: "Integrity survey", status: "planned" },
      { time: "Q3", event: "Workover assessment", status: "planned" },
    ],
  },
};

const initialRisks: RiskItem[] = [
  { id: 1, severity: "HIGH", title: "Elevated torque trend approaching threshold", well: "MW-27", time: "12 min ago", owner: "Drilling", copy: "Torque increased 18% over the last 40 m. Pattern matches historical pack-off precursors.", state: "Open", depth: "3,840–3,850 m MD", formation: "Fatehgarh Sandstone", historicalWell: "MW-19", historicalEvent: "Pack-off precursor before motor stall at 3,906 m", historicalSimilarity: "92% · high confidence", potentialRisk: "Potential Historical Risk: Pack-off / motor stall if current trend continues without intervention.", supportingEvidence: "Torque Trend Evidence Pack · EV-27-0614 · 4 verified telemetry records match MW-19 pre-stall signature.", report: "Torque Trend Evidence Pack · EV-27-0614", action: "Review hole cleaning parameters, circulate bottoms-up, and verify torque response before continuing the interval.", engineerNote: "Engineer Verification Required — Do not continue drilling until torque response is confirmed stable." },
  { id: 2, severity: "MEDIUM", title: "Mud weight outside planned window", well: "MW-21", time: "34 min ago", owner: "Fluids", copy: "Measured mud weight is 0.3 ppg below the current section plan.", state: "Open", depth: "3,612 m MD", formation: "Barmer Hill", historicalWell: "MW-08", historicalEvent: "Transient influx after mud-weight deviation", historicalSimilarity: "78% · medium confidence", potentialRisk: "Potential Historical Risk: Transient well control event if mud weight not restored.", supportingEvidence: "Daily Drilling Report #206 · MW-08 End of Section Report · 2 comparable Barmer Hill incidents.", report: "Daily Drilling Report #206", action: "Confirm pit volume and flow check, then restore mud weight to the approved section program.", engineerNote: "Engineer Verification Required — Confirm wellbore pressure balance before resuming drilling." },
  { id: 3, severity: "LOW", title: "BOP inspection evidence due", well: "PAD B-02", time: "Due today", owner: "HSE", copy: "Required weekly verification record has not yet been attached.", state: "Open", depth: "Surface system", formation: "N/A · equipment assurance", historicalWell: "PAD A-07", historicalEvent: "Weekly BOP assurance verification", historicalSimilarity: "Policy match", potentialRisk: "Potential Historical Risk: Regulatory non-compliance if inspection evidence not filed.", supportingEvidence: "BOP Inspection Record · HSE-BOP-0610 · PAD A-07 weekly verification template.", report: "BOP Inspection Record · HSE-BOP-0610", action: "Attach the signed inspection checklist and obtain Operations Assurance verification.", engineerNote: "Engineer Verification Required — Signed checklist must be uploaded before shift close." },
  { id: 4, severity: "MEDIUM", title: "Connection gas review in progress", well: "MW-32", time: "1 h ago", owner: "Drilling", copy: "Engineer review accepted; monitoring next two connections.", state: "Acknowledged", depth: "2,835–2,841 m MD", formation: "Thumbli Formation", historicalWell: "MW-14", historicalEvent: "Connection gas response — Thumbli Formation at 2,810 m", historicalSimilarity: "81%", potentialRisk: "Potential Historical Risk: Sustained influx if gas trend increases.", supportingEvidence: "DDR #198 · MW-14 formation evaluation log · PAD B-02 Thumbli gas history.", report: "DDR #198", action: "Continue monitoring. Increase mud weight by 0.2 ppg if gas trend exceeds 4.0%.", engineerNote: "Engineer Verification Required — Review gas readings at next connection." },
  { id: 5, severity: "LOW", title: "Sensor calibration variance", well: "MW-27", time: "Yesterday", owner: "Instrumentation", copy: "Calibration completed and evidence verified.", state: "Resolved", depth: "3,640 m MD", formation: "N/A", historicalWell: "MW-19", historicalEvent: "Sensor calibration record", historicalSimilarity: "Record match", potentialRisk: "No active risk — resolved.", supportingEvidence: "Calibration Certificate CC-441 · Instrumentation log.", report: "Calibration Certificate CC-441", action: "No further action.", engineerNote: "Resolved — Calibration complete. No operational impact confirmed." },
];

// ─── SVG Icons ───────────────────────────────────────────────────────────────

const paths: Record<IconName, ReactNode> = {
  grid: <><rect x="3" y="3" width="7" height="7" rx="1" /><rect x="14" y="3" width="7" height="7" rx="1" /><rect x="3" y="14" width="7" height="7" rx="1" /><rect x="14" y="14" width="7" height="7" rx="1" /></>,
  activity: <><path d="M4 19V9m5 10V5m6 14V8m5 11V3" /><path d="M2 19h20" /></>,
  map: <><path d="m3 6 6-3 6 3 6-3v15l-6 3-6-3-6 3Z" /><path d="M9 3v15m6-12v15" /></>,
  history: <><path d="M3 12a9 9 0 1 0 3-6.7L3 8" /><path d="M3 3v5h5m4-2v6l4 2" /></>,
  alert: <><path d="M12 3 2.7 20h18.6Z" /><path d="M12 9v4m0 3h.01" /></>,
  report: <><path d="M6 2h9l4 4v16H6Z" /><path d="M15 2v5h5M9 12h6m-6 4h6" /></>,
  spark: <><path d="m12 2 1.7 5.3L19 9l-5.3 1.7L12 16l-1.7-5.3L5 9l5.3-1.7Z" /><path d="m19 15 .8 2.2L22 18l-2.2.8L19 21l-.8-2.2L16 18l2.2-.8Z" /></>,
  search: <><circle cx="11" cy="11" r="7" /><path d="m16 16 5 5" /></>,
  bell: <><path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9" /><path d="M10 21h4" /></>,
  chevron: <path d="m9 18 6-6-6-6" />,
  arrow: <path d="m5 12 14 0m-5-5 5 5-5 5" />,
  more: <><circle cx="5" cy="12" r="1" /><circle cx="12" cy="12" r="1" /><circle cx="19" cy="12" r="1" /></>,
  check: <path d="m5 12 4 4L19 6" />,
  well: <><path d="M5 21 10 3h4l5 18M7 14h10M8 9h8M4 21h16" /></>,
  user: <><circle cx="12" cy="8" r="4" /><path d="M4 21a8 8 0 0 1 16 0" /></>,
  settings: <><circle cx="12" cy="12" r="3" /><path d="M19.4 15a2 2 0 0 0 .4 2.2l.1.1-2.6 2.6-.1-.1A2 2 0 0 0 15 19.4a2 2 0 0 0-1.2 1.8V22h-3.6v-.8A2 2 0 0 0 9 19.4a2 2 0 0 0-2.2.4l-.1.1-2.6-2.6.1-.1A2 2 0 0 0 4.6 15a2 2 0 0 0-1.8-1.2H2v-3.6h.8A2 2 0 0 0 4.6 9a2 2 0 0 0-.4-2.2l-.1-.1 2.6-2.6.1.1A2 2 0 0 0 9 4.6a2 2 0 0 0 1.2-1.8V2h3.6v.8A2 2 0 0 0 15 4.6a2 2 0 0 0 2.2-.4l.1-.1 2.6 2.6-.1.1A2 2 0 0 0 19.4 9a2 2 0 0 0 1.8 1.2h.8v3.6h-.8a2 2 0 0 0-1.8 1.2Z" /></>,
  help: <><circle cx="12" cy="12" r="10" /><path d="M9.5 9a2.7 2.7 0 1 1 3.7 2.5c-1.2.5-1.2 1.2-1.2 2m0 3h.01" /></>,
  logout: <><path d="M10 17v3H3V4h7v3m5 10 5-5-5-5m5 5H9" /></>,
  download: <><path d="M12 3v12m-5-5 5 5 5-5" /><path d="M5 21h14" /></>,
  filter: <path d="M3 5h18l-7 8v6l-4 2v-8Z" />,
  send: <><path d="m3 3 18 9-18 9 4-9Z" /><path d="M7 12h14" /></>,
  clock: <><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></>,
};

function Icon({ name, size = 18 }: { name: IconName; size?: number }) {
  return <svg className="icon" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{paths[name]}</svg>;
}

function Action({ children, icon, kind = "default", onClick, className = "" }: { children: ReactNode; icon?: IconName; kind?: "default" | "primary" | "ghost" | "danger"; onClick?: () => void; className?: string }) {
  const keyboard = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key === "Enter" || event.key === " ") onClick?.();
  };
  return <div role="button" tabIndex={0} onClick={onClick} onKeyDown={keyboard} className={`button lift-button button-${kind} ${className}`}>{icon && <Icon name={icon} size={16} />}<span>{children}</span></div>;
}

function Card({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <section className={`card ${className}`}>{children}</section>;
}

function Kicker({ children }: { children: ReactNode }) {
  return <div className="kicker">{children}</div>;
}

function Status({ children, tone = "green" }: { children: ReactNode; tone?: "green" | "amber" | "red" | "blue" | "gray" }) {
  return <span className={`status status-${tone}`}><i />{children}</span>;
}

// ─── API hook ────────────────────────────────────────────────────────────────

function useApi<T>(url: string | null, deps: unknown[] = []): { data: T | null; loading: boolean; error: string | null } {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const memoUrl = url;
  useEffect(() => {
    if (!memoUrl) return;
    setLoading(true);
    setError(null);
    fetch(memoUrl)
      .then((r) => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        return r.json();
      })
      .then((d) => { setData(d); setLoading(false); })
      .catch((e) => { setError(e.message); setLoading(false); });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [memoUrl, ...deps]);

  return { data, loading, error };
}

// ─── Navigation ──────────────────────────────────────────────────────────────

const nav: { page: Page; icon: IconName }[] = [
  { page: "Overview", icon: "grid" },
  { page: "Active Well", icon: "activity" },
  { page: "Nearby / Offset Wells", icon: "map" },
  { page: "Historical Intelligence", icon: "history" },
  { page: "Risk & Alerts", icon: "alert" },
  { page: "Reports & Evidence", icon: "report" },
  { page: "AI Assistant", icon: "spark" },
];

function Sidebar({ page, navigate, openAlertCount }: { page: Page; navigate: (page: Page) => void; openAlertCount: number }) {
  return <aside className="sidebar">
    <div className="brand">
      <div className="brand-mark"><Icon name="well" size={22} /></div>
      <div><strong>DRILLWISE</strong><span>INTELLIGENCE PLATFORM</span></div>
    </div>
    <div className="nav-label">WORKSPACE</div>
    <nav className="nav-list">
      {nav.map((item) => <div role="button" tabIndex={0} key={item.page} onClick={() => navigate(item.page)} className={`nav-item ${page === item.page ? "active" : ""}`}><Icon name={item.icon} /><span>{item.page}</span>{item.page === "Risk & Alerts" && openAlertCount > 0 && <b>{openAlertCount}</b>}</div>)}
    </nav>
    <div className="sidebar-bottom">
      <div className="field-context"><span>ACTIVE FIELD</span><strong>Barmer Basin — RJ-ON-90/1</strong><small>Operational · 14 wells</small></div>
      <div role="button" tabIndex={0} onClick={() => navigate("Profile / Account")} className={`profile-card ${page === "Profile / Account" ? "active" : ""}`}>
        <div className="avatar">RP</div>
        <div className="profile-copy"><strong>Rajesh P.</strong><span>Drilling Engineer (Auth Ops)</span><small>DEMO MODE</small></div>
        <Icon name="chevron" size={15} />
      </div>
    </div>
  </aside>;
}

// ─── Header / Search / Notifications ─────────────────────────────────────────

const notifications = [
  { title: "Potential Historical Risk detected", meta: "MW-27 torque signature · 12 min ago", page: "Risk & Alerts" as Page },
  { title: "Historical well match found", meta: "MW-19 · 92% similarity", page: "Historical Intelligence" as Page },
  { title: "New supporting evidence available", meta: "Torque Trend Evidence Pack", page: "Reports & Evidence" as Page },
  { title: "Alert requires engineer review", meta: "MW-21 mud weight variance", page: "Risk & Alerts" as Page },
];

function Header({ page, navigate, selectWell }: { page: Page; navigate: (page: Page) => void; selectWell: (well: string) => void }) {
  const [searchOpen, setSearchOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [read, setRead] = useState<number[]>([]);

  const searchRecords: { title: string; meta: string; kind: string; page: Page; well?: WellId }[] = [
    { title: "MW-27", meta: "Active well · Drilling at 3,847 m", kind: "WELL", page: "Active Well", well: "MW-27" },
    { title: "MW-21", meta: "Active well · Mud weight variance", kind: "WELL", page: "Active Well", well: "MW-21" },
    { title: "MW-19", meta: "Offset well · 92% similarity", kind: "WELL", page: "Active Well", well: "MW-19" },
    { title: "MW-32", meta: "Active well · Connection gas monitoring", kind: "WELL", page: "Active Well", well: "MW-32" },
    { title: "MW-14", meta: "Suspended well · Stuck pipe history", kind: "WELL", page: "Active Well", well: "MW-14" },
    { title: "PAD B-02", meta: "Producing · BOP evidence due", kind: "WELL", page: "Active Well", well: "PAD B-02" },
    { title: "Daily Drilling Report #212", meta: "MW-27 · Verified · 14 Jun 2024", kind: "REPORT", page: "Reports & Evidence" },
    { title: "Torque Trend Evidence Pack", meta: "MW-27 · Supporting evidence", kind: "EVIDENCE", page: "Reports & Evidence" },
    { title: "End of Well Report — MW-19", meta: "MW-19 · Verified · 12 Mar 2023", kind: "REPORT", page: "Reports & Evidence" },
    { title: "Elevated torque trend approaching threshold", meta: "HIGH · MW-27 · Open", kind: "ALERT", page: "Risk & Alerts" },
    { title: "Connection gas review in progress", meta: "MEDIUM · MW-32 · Acknowledged", kind: "ALERT", page: "Risk & Alerts" },
    { title: "Torque response before motor stall", meta: "MW-19 · Historical intelligence", kind: "HISTORY", page: "Historical Intelligence" },
    { title: "Stuck pipe — Fatehgarh Sandstone", meta: "MW-14 · Historical intelligence", kind: "HISTORY", page: "Historical Intelligence" },
  ];

  useEffect(() => {
    const shortcut = (event: globalThis.KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setSearchOpen(true);
        setNotificationsOpen(false);
      }
      if (event.key === "Escape") {
        setSearchOpen(false);
        setNotificationsOpen(false);
      }
    };
    window.addEventListener("keydown", shortcut);
    return () => window.removeEventListener("keydown", shortcut);
  }, []);

  const subtitle: Record<Page, string> = {
    "Overview": "Operational overview and field intelligence",
    "Active Well": "Live drilling parameters and well status",
    "Nearby / Offset Wells": "Spatial intelligence and offset analysis",
    "Historical Intelligence": "Evidence from comparable drilling programs",
    "Risk & Alerts": "Prioritized operational risks requiring attention",
    "Reports & Evidence": "Verified reports, records, and supporting evidence",
    "AI Assistant": "Operational intelligence grounded in your field data",
    "Profile / Account": "Manage your operator profile and preferences",
  };

  const results = searchRecords.filter((record) => `${record.title} ${record.meta} ${record.kind}`.toLowerCase().includes(query.toLowerCase()));
  const openResult = (record: (typeof searchRecords)[number]) => {
    if (record.well) selectWell(record.well);
    navigate(record.page);
    setSearchOpen(false);
    setQuery("");
  };

  return <header className="topbar">
    <div><Kicker>RAJASTHAN OPERATIONS / {page.toUpperCase()}</Kicker><div className="page-title">{page}</div><p>{subtitle[page]}</p></div>
    <div className="header-tools">
      <div className={`global-search ${searchOpen ? "active" : ""}`} role="search" onClick={() => { setSearchOpen(true); setNotificationsOpen(false); }}>
        <Icon name="search" size={16} />
        <div className="search-input" contentEditable={searchOpen} suppressContentEditableWarning onInput={(event) => setQuery(event.currentTarget.textContent || "")} data-placeholder="Search wells, reports, alerts..." />
        {query ? <div role="button" tabIndex={0} className="clear-search" onClick={(event) => { event.stopPropagation(); setQuery(""); event.currentTarget.parentElement?.querySelector<HTMLElement>(".search-input")?.replaceChildren(); }}>×</div> : <kbd>⌘ K</kbd>}
      </div>
      <div role="button" tabIndex={0} className="icon-button" onClick={() => { setNotificationsOpen(!notificationsOpen); setSearchOpen(false); }}><Icon name="bell" />{read.length < notifications.length && <i />}</div>
      {searchOpen && <div className="header-popover search-popover">
        <div className="popover-head"><div><Kicker>GLOBAL SEARCH</Kicker><strong>{query ? `${results.length} matches` : "Search across field intelligence"}</strong></div><Action kind="ghost" onClick={() => { setSearchOpen(false); setQuery(""); }}>Close</Action></div>
        <div className="search-results">{results.map((record) => <div role="button" tabIndex={0} key={record.title} onClick={() => openResult(record)}><span className="result-kind">{record.kind}</span><div><strong>{record.title}</strong><p>{record.meta}</p></div><Icon name="arrow" size={15} /></div>)}{results.length === 0 && <div className="no-results">No wells, reports, alerts, or historical records match this search.</div>}</div>
      </div>}
      {notificationsOpen && <div className="header-popover notification-popover">
        <div className="popover-head"><div><Kicker>NOTIFICATIONS</Kicker><strong>{notifications.length - read.length} unread</strong></div><Action kind="ghost" onClick={() => setNotificationsOpen(false)}>Close</Action></div>
        <div className="notification-list">{notifications.map((item, index) => <div role="button" tabIndex={0} key={item.title} className={read.includes(index) ? "read" : ""} onClick={() => { setRead((current) => [...new Set([...current, index])]); navigate(item.page); setNotificationsOpen(false); }}><i /><div><strong>{item.title}</strong><p>{item.meta}</p></div><Icon name="chevron" size={14} /></div>)}</div>
        <Action kind="ghost" className="mark-read" onClick={() => setRead(notifications.map((_, index) => index))}>Mark all as read</Action>
      </div>}
    </div>
  </header>;
}

// ─── Shared components ───────────────────────────────────────────────────────

function Metric({ label, value, note, trend }: { label: string; value: string; note: string; trend?: "up" | "down" | "flat" }) {
  return <Card className="metric"><div className="metric-top"><span>{label}</span><Icon name="more" size={16} /></div><strong>{value}</strong><div className={`metric-note ${trend || ""}`}>{trend === "up" ? "↗" : trend === "down" ? "↘" : "—"} {note}</div></Card>;
}

function DepthChart({ data, chartId = "default" }: { data: WellOverviewData; chartId?: string }) {
  const gradientId = `area-${chartId.replace(/[^a-z0-9-]/gi, "-")}`;
  return <div className="chart">
    <div className="chart-grid">{[0, 1, 2, 3].map((i) => <i key={i} />)}</div>
    <svg viewBox="0 0 760 210" preserveAspectRatio="none">
      <defs><linearGradient id={gradientId} x1="0" x2="0" y1="0" y2="1"><stop offset="0%" stopColor="#d6a553" stopOpacity=".35" /><stop offset="100%" stopColor="#d6a553" stopOpacity="0" /></linearGradient></defs>
      <path d={`${data.chartPath} V210 H0Z`} fill={`url(#${gradientId})`} />
      <path d={data.chartPath} fill="none" stroke="#d6a553" strokeWidth="3" />
      <circle cx="760" cy={data.chartEndY} r="5" fill="#0f1113" stroke="#d6a553" strokeWidth="3" />
    </svg>
    <div className="chart-axis"><span>06:00</span><span>10:00</span><span>14:00</span><span>18:00</span><span>22:00</span><span>NOW</span></div>
  </div>;
}

function MapPanel({ selected, onWell }: { selected: WellId; onWell: (well: WellId) => void }) {
  const markers: { well: WellId; className: string; short: string }[] = [
    { well: "MW-27", className: "marker-main", short: "27" },
    { well: "MW-21", className: "marker-one", short: "21" },
    { well: "MW-19", className: "marker-two", short: "19" },
    { well: "PAD B-02", className: "marker-three", short: "B2" },
    { well: "MW-32", className: "marker-four", short: "32" },
    { well: "MW-14", className: "marker-five", short: "14" },
  ];
  return <div className="map-panel">
    <div className="map-roads"><i /><i /><i /><i /></div>
    <div className="map-label label-a">PAD A-07</div><div className="map-label label-b">MANGALA</div><div className="map-label label-c">BHAGYAM</div>
    {markers.map((marker) => <div role="button" tabIndex={0} key={marker.well} onClick={() => onWell(marker.well)} className={`marker ${marker.className} ${selected === marker.well ? "marker-active" : ""}`}><span>{selected === marker.well ? <Icon name="well" size={16} /> : marker.short}</span>{selected === marker.well && <b>{marker.well}</b>}</div>)}
    <div className="map-scale">5 KM</div>
  </div>;
}

// ─── Pages ───────────────────────────────────────────────────────────────────

function Overview({ navigate, selectedWell, selectWell }: { navigate: (page: Page) => void; selectedWell: WellId; selectWell: (well: WellId) => void }) {
  const well = wellData[selectedWell];
  const { data: alertData } = useApi<{ counts: { open: number } }>("/api/alerts", []);
  const openCount = alertData?.counts?.open ?? 3;

  return <div className="page-content">
    <div className="summary-strip"><Status>FIELD ONLINE</Status><span>Last sync 12 sec ago</span><div /><span>Shift B · 18:00–06:00</span><span className="weather">27°C · NW 11 km/h</span></div>
    <div className="metrics-grid"><Metric label="ACTIVE WELLS" value="06" note="3 drilling, 2 producing, 1 suspended" trend="up" /><Metric label="DAILY PRODUCTION" value="18.4k" note="bbl / day · +2.4%" trend="up" /><Metric label="OPEN RISKS" value={String(openCount).padStart(2, "0")} note="Requiring field review" trend="down" /><Metric label="NPT THIS MONTH" value="4.7h" note="16% below target" trend="up" /></div>
    <div className="overview-main">
      <Card className="performance-card">
        <div className="card-header"><div><Kicker>DRILLING PERFORMANCE</Kicker><div className="card-title">{selectedWell} · Current depth</div></div><div className="depth-value"><strong>{well.depthValue}</strong><span>m MD</span></div></div>
        <DepthChart data={well} chartId={`overview-${selectedWell}`} />
        <div className="chart-stats"><div><span>ROP</span><strong>{well.rop}</strong></div><div><span>WOB</span><strong>{well.wob}</strong></div><div><span>RPM</span><strong>{well.rpm}</strong></div><div><span>FLOW</span><strong>{well.flow}</strong></div><Status tone={well.performanceTone}>{well.performanceStatus}</Status></div>
      </Card>
      <Card className="map-card"><div className="card-header"><div><Kicker>FIELD MAP</Kicker><div className="card-title">Live well activity</div></div><Action kind="ghost" onClick={() => navigate("Nearby / Offset Wells")}>Open map</Action></div><MapPanel selected={selectedWell} onWell={selectWell} /><div className="map-well-detail"><div><Kicker>SELECTED WELL</Kicker><strong>{selectedWell}</strong></div><span>{well.depth}<small>{well.status}</small></span><span>{well.formation}<small>{well.activity}</small></span><span>{well.alerts}<small>{well.history}</small></span><Action kind="ghost" onClick={() => navigate("Active Well")}>View well</Action></div></Card>
    </div>
    <div className="bottom-grid">
      <Card><div className="card-header"><div><Kicker>ATTENTION REQUIRED</Kicker><div className="card-title">Active alerts</div></div><span className="count">{openCount} OPEN</span></div>
        <div className="alert-list"><div><span className="severity high">HIGH</span><div><strong>Elevated torque trend</strong><p>MW-27 · 12 min ago</p></div><Icon name="chevron" /></div><div><span className="severity med">MED</span><div><strong>Mud weight variance</strong><p>MW-21 · 34 min ago</p></div><Icon name="chevron" /></div><div><span className="severity low">LOW</span><div><strong>Inspection evidence due</strong><p>PAD B-02 · Today</p></div><Icon name="chevron" /></div></div>
        <Action kind="ghost" onClick={() => navigate("Risk & Alerts")} className="full-action">View all alerts <Icon name="arrow" size={15} /></Action>
      </Card>
      <Card><div className="card-header"><div><Kicker>AI FIELD NOTE · {selectedWell}</Kicker><div className="card-title">Pattern detected</div></div><div className="ai-orb"><Icon name="spark" size={17} /></div></div><p className="insight">{well.insight}</p><div className="evidence"><Icon name="report" size={15} /><span>{well.evidence}</span></div><Action kind="primary" onClick={() => navigate("AI Assistant")}>Review with AI <Icon name="arrow" size={15} /></Action></Card>
    </div>
  </div>;
}

function ActiveWell({ navigate, selectedWell }: { navigate: (page: Page) => void; selectedWell: WellId }) {
  const well = wellData[selectedWell];
  const { data: apiWell } = useApi<{ well: typeof well & { hookLoad?: string; torque?: string; standpipe?: string; mudWeight?: string; ecd?: string; gas?: string } }>(`/api/wells/${encodeURIComponent(selectedWell)}`, [selectedWell]);

  const hookLoad = apiWell?.well?.hookLoad ?? well.hookLoad ?? "247 klbf";
  const torque = apiWell?.well?.torque ?? well.torque ?? "22.8 kft-lb";
  const standpipe = apiWell?.well?.standpipe ?? well.standpipe ?? "3,420 psi";
  const mudWeight = apiWell?.well?.mudWeight ?? well.mudWeight ?? "11.6 ppg";
  const ecd = apiWell?.well?.ecd ?? well.ecd ?? "12.1 ppg";
  const gas = apiWell?.well?.gas ?? well.gas ?? "1.8 %";

  const parameters: [string, string, string][] = [
    ["Hook load", hookLoad === "—" ? "N/A" : hookLoad, "NORMAL"],
    ["Torque", torque === "—" ? "N/A" : torque, torque !== "—" && parseFloat(torque) > 22 ? "WATCH" : "NORMAL"],
    ["Standpipe", standpipe === "—" ? "N/A" : standpipe, "NORMAL"],
    ["Mud weight", mudWeight === "—" ? "N/A" : mudWeight, well.performanceTone === "amber" ? "WATCH" : "NORMAL"],
    ["ECD", ecd === "—" ? "N/A" : ecd, "NORMAL"],
    ["Gas", gas === "—" ? "N/A" : gas, parseFloat(gas) > 3 ? "WATCH" : "NORMAL"],
  ];

  const timeline = well.timeline ?? [
    { time: "18:00", event: "Run in hole", status: "done" },
    { time: "20:24", event: "Drilling", status: "done" },
    { time: "01:10", event: "Current operation", status: "current" },
    { time: "05:30", event: "Next planned", status: "planned" },
  ];

  const statusTone: Record<string, "green" | "amber" | "blue" | "gray"> = {
    "Drilling": "green", "Completed": "blue", "Producing": "green", "Suspended": "gray",
  };

  return <div className="page-content">
    <div className="well-hero"><div><Status tone={statusTone[well.status] ?? "green"}>{well.status.toUpperCase()}</Status><div className="well-title">{selectedWell} <span>•</span> {apiWell?.well?.field ?? "MANGALA FIELD"}</div><p>{apiWell?.well?.pad ?? "Pad A-07"} · {apiWell?.well?.type ?? "Directional"} well · Section {apiWell?.well?.section ?? "8½″"}</p></div><div className="well-actions"><Action icon="history" onClick={() => navigate("Historical Intelligence")}>View History</Action><Action kind="primary" icon="report" onClick={() => navigate("Reports & Evidence")}>View Historical Evidence</Action></div></div>
    <div className="metrics-grid three">
      <Metric label="MEASURED DEPTH" value={well.depth} note={`Target ${apiWell?.well?.targetDepth ?? "4,126 m"}`} trend="up" />
      <Metric label="CURRENT ROP" value={well.rop} note={`Plan ${apiWell?.well?.ropPlan ?? "17.2 m/h"}`} trend="up" />
      <Metric label="TIME TO TD" value={apiWell?.well?.timeToTD ?? well.timeToTD ?? "—"} note={well.status === "Drilling" ? "Estimate · on schedule" : well.status} />
    </div>
    <div className="active-grid">
      <Card className="live-card"><div className="card-header"><div><Kicker>LIVE TELEMETRY</Kicker><div className="card-title">Drilling parameters</div></div><Status>{well.status === "Drilling" ? "LIVE · 1 SEC" : "HISTORICAL"}</Status></div>
        {/* STATE SYNC FIX: chart now uses selected well data */}
        <DepthChart data={well} chartId={`active-${selectedWell}`} />
        <div className="legend"><span><i className="gold" />Actual ROP</span><span><i className="gray" />Planned ROP</span></div>
      </Card>
      <Card><div className="card-header"><div><Kicker>WELL PARAMETERS</Kicker><div className="card-title">Current readings</div></div></div><div className="parameter-list">{parameters.map(([label, value, state]) => <div key={label}><span>{label}</span><strong>{value}</strong><small className={state === "WATCH" ? "watch" : ""}>{state}</small></div>)}</div></Card>
    </div>
    <Card><div className="card-header"><div><Kicker>OPERATION TIMELINE</Kicker><div className="card-title">Last 12 hours</div></div><Action kind="ghost">Shift report</Action></div>
      <div className="timeline">{timeline.map((entry) => <div key={entry.time}><span>{entry.time}</span><i className={entry.status === "done" ? "done" : entry.status === "current" ? "current" : ""} /><strong>{entry.event}</strong><small>{entry.status === "done" ? "Completed" : entry.status === "current" ? "In progress" : "Planned"}</small></div>)}</div>
    </Card>
  </div>;
}

function NearbyWells({ navigate, selectedWell, selectWell }: { navigate: (page: Page) => void; selectedWell: WellId; selectWell: (well: WellId) => void }) {
  const [compare, setCompare] = useState(false);
  const [filter, setFilter] = useState(false);
  const { data: nearbyData } = useApi<{ nearby: { wellId: string; distance: string; finalDepth: string; similarity: string; status: string; avgROP: string; npt: string }[] }>(`/api/wells/${encodeURIComponent(selectedWell)}/nearby`, [selectedWell]);

  const wells = nearbyData?.nearby ?? [
    { wellId: "MW-19", distance: "1.8 km", finalDepth: "4,112 m", similarity: "92%", status: "Completed", avgROP: "17.9 m/h", npt: "4.8 h" },
    { wellId: "MW-23", distance: "3.2 km", finalDepth: "3,980 m", similarity: "87%", status: "Producing", avgROP: "16.4 m/h", npt: "3.1 h" },
    { wellId: "BH-14", distance: "6.7 km", finalDepth: "4,305 m", similarity: "81%", status: "Completed", avgROP: "15.2 m/h", npt: "6.2 h" },
    { wellId: "MW-11", distance: "8.1 km", finalDepth: "3,764 m", similarity: "78%", status: "Suspended", avgROP: "14.8 m/h", npt: "5.4 h" },
  ];

  const currentWell = wellData[selectedWell];
  const filteredWells = filter ? wells.filter((w) => w.status === "Completed") : wells;

  return <div className="page-content">
    <div className="toolbar"><div className="search-box"><Icon name="search" size={16} /><span>Search offset wells · {selectedWell} context</span></div><Action icon="filter" onClick={() => setFilter(!filter)}>Filter {filter ? "· Completed" : ""}</Action><Action kind="primary" onClick={() => setCompare(!compare)}>{compare ? "Close Comparison" : "Compare Wells"}</Action></div>
    {compare ? <Card><div className="card-header"><div><Kicker>COMPARISON VIEW</Kicker><div className="card-title">{selectedWell} vs. {wells[0]?.wellId ?? "MW-19"} vs. {wells[1]?.wellId ?? "MW-23"}</div></div><Status tone="blue">{wells.length + 1} WELLS</Status></div>
      <div className="comparison">
        <div><span>WELL</span><strong>{selectedWell}</strong>{wells.slice(0, 2).map((w) => <strong key={w.wellId}>{w.wellId}</strong>)}</div>
        <div><span>Final / current depth</span><b>{currentWell.depth}</b>{wells.slice(0, 2).map((w) => <b key={w.wellId}>{w.finalDepth}</b>)}</div>
        <div><span>Average ROP</span><b>{currentWell.rop}</b>{wells.slice(0, 2).map((w) => <b key={w.wellId}>{w.avgROP}</b>)}</div>
        <div><span>NPT</span><b>—</b>{wells.slice(0, 2).map((w) => <b key={w.wellId}>{w.npt}</b>)}</div>
        <div><span>Historical Similarity</span><b>Current</b>{wells.slice(0, 2).map((w) => <b key={w.wellId}>{w.similarity}</b>)}</div>
      </div>
    </Card> : null}
    <div className="nearby-grid">
      <Card className="large-map"><div className="card-header floating"><Kicker>14 WELLS WITHIN 10 KM · SELECTED {selectedWell}</Kicker><div className="map-controls">+<span>−</span></div></div><MapPanel selected={selectedWell} onWell={selectWell} /></Card>
      <Card><div className="card-header"><div><Kicker>OFFSET WELLS</Kicker><div className="card-title">Ranked by Historical Similarity</div></div></div>
        <div className="offset-list">{filteredWells.map((well, index) => <div className="offset-item" key={well.wellId}><span className="well-rank">{String(index + 1).padStart(2, "0")}</span><div><strong>{well.wellId}</strong><p>{well.distance} away · {well.status}</p></div><span className="similarity">{well.similarity}</span><Action kind="ghost" onClick={() => { selectWell(well.wellId as WellId); navigate("Active Well"); }}>View Well</Action></div>)}</div>
      </Card>
    </div>
  </div>;
}

function Historical({ navigate, selectedWell }: { navigate: (page: Page) => void; selectedWell: WellId }) {
  const [active, setActive] = useState("Torque & drag");
  const { data: historyData } = useApi<{ events: { id: string; well: string; date: string; type: string; title: string; depth: string; formation: string; description: string; outcome: string; similarity: string; verified: boolean; report: string; tags?: string[] }[] }>(`/api/wells/${encodeURIComponent(selectedWell)}/history`, [selectedWell]);

  const allEvents = historyData?.events ?? [];
  const filteredEvents = active === "All" ? allEvents : allEvents.filter((e) => e.type.toLowerCase().includes(active.toLowerCase().replace(" & ", "").replace(" ", "-").split("-")[0]));

  const topics: { label: string; count: number }[] = [
    { label: "Torque & drag", count: allEvents.filter((e) => e.tags?.some?.((t: string) => t.includes("torque")) || e.type === "Torque & drag").length || 24 },
    { label: "Stuck pipe", count: allEvents.filter((e) => e.tags?.some?.((t: string) => t.includes("stuck")) || e.type === "Stuck pipe").length || 18 },
    { label: "Lost circulation", count: allEvents.filter((e) => e.tags?.some?.((t: string) => t.includes("loss")) || e.type === "Mud & fluids").length || 15 },
    { label: "Well control", count: allEvents.filter((e) => e.tags?.some?.((t: string) => t.includes("gas")) || e.type === "Well control").length || 9 },
    { label: "Equipment failure", count: 12 },
  ];

  const displayEvents = filteredEvents.length > 0 ? filteredEvents : allEvents.slice(0, 4);

  return <div className="page-content">
    <div className="toolbar"><div className="search-box wide"><Icon name="search" /><span>Search historical records, events, and evidence · {selectedWell} context</span></div><Action icon="filter">All sources</Action><Action icon="clock">Last 5 years</Action></div>
    <div className="history-grid">
      <Card className="topic-card"><Kicker>INTELLIGENCE TOPICS</Kicker>{topics.map((topic, i) => <div role="button" tabIndex={0} onClick={() => setActive(topic.label)} className={`topic ${active === topic.label ? "active" : ""}`} key={topic.label}><span>0{i + 1}</span><strong>{topic.label}</strong><b>{topic.count}</b></div>)}</Card>
      <Card><div className="card-header"><div><Kicker>HISTORICAL INTELLIGENCE · {selectedWell} CONTEXT</Kicker><div className="card-title">{active}</div></div><span className="count">{displayEvents.length} RECORDS</span></div>
        <div className="history-stats">
          <div><span>Comparable events</span><strong>{String(displayEvents.length).padStart(2, "0")}</strong></div>
          <div><span>Successful mitigations</span><strong>86%</strong></div>
          <div><span>Median downtime</span><strong>3.2 h</strong></div>
        </div>
        <div className="record-list">{displayEvents.slice(0, 4).map((r) => <div key={r.id ?? r.title}><div className="record-icon"><Icon name="report" /></div><div><strong>{r.well} · {r.title}</strong><p>{r.description ?? r.title}</p><small>{r.date} · {r.depth}</small></div><Status tone={r.verified ? "green" : "gray"}>{r.verified ? "Verified" : "Reviewed"}</Status><Action kind="ghost" onClick={() => navigate("Reports & Evidence")}>View Historical Evidence</Action></div>)}
        {displayEvents.length === 0 && <div style={{ padding: "20px", color: "var(--muted)", fontSize: "12px" }}>Loading historical intelligence for {selectedWell}...</div>}
        </div>
      </Card>
    </div>
  </div>;
}

function Risks({ selectedWell }: { selectedWell: WellId }) {
  const [tab, setTab] = useState<AlertState>("Open");
  const [risks, setRisks] = useState<RiskItem[]>(initialRisks);
  const [selected, setSelected] = useState<RiskItem | null>(null);
  const [confirmation, setConfirmation] = useState("");
  const [apiLoaded, setApiLoaded] = useState(false);

  // Load alerts from API on mount
  useEffect(() => {
    fetch("/api/alerts")
      .then((r) => r.json())
      .then((data) => {
        if (data.alerts && data.alerts.length > 0) {
          setRisks(data.alerts.map((a: RiskItem & { historicalSimilarity?: string }) => ({
            ...a,
            // Map API field names to component field names
            historicalSimilarity: a.historicalSimilarity ?? (a as any).similarity ?? "",
          })));
          setApiLoaded(true);
        }
      })
      .catch(() => { /* use fallback */ });
  }, []);

  const updateState = (id: number, state: AlertState) => {
    // Optimistic update
    setRisks((current) => current.map((risk) => risk.id === id ? { ...risk, state } : risk));
    setSelected((current) => current?.id === id ? { ...current, state } : current);
    setConfirmation(state === "Acknowledged" ? "Alert acknowledged." : state === "Resolved" ? "Alert resolved." : "Alert reopened.");
    window.setTimeout(() => setConfirmation(""), 2200);

    // Sync to API
    fetch(`/api/alerts/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ state }),
    }).catch(() => { /* already did optimistic update */ });
  };

  const counts = (state: AlertState) => risks.filter((risk) => risk.state === state).length;
  const visible = risks.filter((risk) => risk.state === tab);

  return <div className="page-content"><div className="risk-summary"><Metric label="OPEN ALERTS" value={String(counts("Open")).padStart(2, "0")} note="Requiring field review" /><Metric label="ACKNOWLEDGED" value={String(counts("Acknowledged")).padStart(2, "0")} note="Engineer review active" /><Metric label="RESOLVED" value={String(counts("Resolved") + 16).padStart(2, "0")} note="This week" trend="up" /></div>
    {!apiLoaded && <div style={{ padding: "8px 0", color: "var(--muted)", fontSize: "10px", letterSpacing: "0.5px" }}>DEMO DATA · Sample alerts loaded</div>}
    {confirmation && <div className="toast"><Icon name="check" size={14} />{confirmation}</div>}
    <div className="tabs">{(["Open", "Acknowledged", "Resolved"] as AlertState[]).map((t) => <div role="button" tabIndex={0} key={t} onClick={() => setTab(t)} className={tab === t ? "active" : ""}>{t}<span>{counts(t)}</span></div>)}</div>
    {visible.length ? <div className="risk-list">{visible.map((risk) => <Card key={risk.id} className="risk-card"><div className={`risk-bar ${risk.severity.toLowerCase()}`} /><div className="risk-head"><span className={`severity ${risk.severity === "HIGH" ? "high" : risk.severity === "MEDIUM" ? "med" : "low"}`}>{risk.severity}</span><span>{risk.well}</span><span>{risk.time}</span><Status tone={risk.state === "Resolved" ? "green" : risk.state === "Acknowledged" ? "amber" : "red"}>{risk.state.toUpperCase()}</Status><span className="owner">OWNER · {risk.owner}</span></div><div className="risk-body"><div><strong>{risk.title}</strong><p>{risk.copy}</p></div><div>{risk.state === "Open" && <Action onClick={() => updateState(risk.id, "Acknowledged")}>Acknowledge</Action>}<Action kind="primary" onClick={() => setSelected(risk)}>Open alert</Action></div></div></Card>)}</div> : <Card className="empty-state"><Icon name="check" size={28} /><div className="card-title">No {tab.toLowerCase()} alerts</div><p>Alerts will appear here when their status changes.</p></Card>}
    {selected && <div className="modal-backdrop" onClick={() => setSelected(null)}><Card className="alert-modal"><div onClick={(event) => event.stopPropagation()}>
      <div className="card-header"><div><Kicker>ALERT DETAIL · DEMO DATA</Kicker><div className="card-title">{selected.title}</div></div><Action kind="ghost" onClick={() => setSelected(null)}>Close</Action></div>
      <div className="alert-detail-head"><span className={`severity ${selected.severity === "HIGH" ? "high" : selected.severity === "MEDIUM" ? "med" : "low"}`}>{selected.severity}</span><strong>{selected.well}</strong><Status tone={selected.state === "Resolved" ? "green" : selected.state === "Acknowledged" ? "amber" : "red"}>{selected.state.toUpperCase()}</Status></div>
      <div className="alert-detail-copy"><Kicker>CURRENT CONDITION</Kicker><p>{selected.copy}</p></div>
      <div className="alert-detail-grid">
        <div><span>RELEVANT DEPTH</span><strong>{selected.depth}</strong></div>
        <div><span>FORMATION</span><strong>{selected.formation}</strong></div>
        <div><span>RELATED HISTORICAL WELL</span><strong>{selected.historicalWell}</strong></div>
        <div><span>HISTORICAL EVENT</span><strong>{selected.historicalEvent}</strong></div>
        <div><span>HISTORICAL SIMILARITY</span><strong>{selected.historicalSimilarity}</strong></div>
        <div><span>SUPPORTING REPORT</span><strong>{selected.report}</strong></div>
      </div>
      {selected.potentialRisk && <div className="alert-detail-copy" style={{ marginTop: "12px" }}><Kicker>POTENTIAL HISTORICAL RISK</Kicker><p>{selected.potentialRisk}</p></div>}
      {selected.supportingEvidence && <div className="alert-detail-copy"><Kicker>SUPPORTING EVIDENCE</Kicker><p>{selected.supportingEvidence}</p></div>}
      <div className="recommended-action"><Icon name="alert" /><div><Kicker>RECOMMENDED ENGINEER REVIEW / ACTION</Kicker><p>{selected.action}</p></div></div>
      {selected.engineerNote && <div className="recommended-action" style={{ background: "var(--gold-soft)", borderColor: "#625139", marginTop: "8px" }}><Icon name="check" /><div><Kicker>ENGINEER VERIFICATION REQUIRED</Kicker><p>{selected.engineerNote}</p></div></div>}
      <div className="modal-actions">{selected.state === "Open" && <Action onClick={() => updateState(selected.id, "Acknowledged")}>Acknowledge</Action>} {selected.state !== "Resolved" && <Action kind="primary" onClick={() => { updateState(selected.id, "Resolved"); setTab("Resolved"); }}>Resolve</Action>}<Action kind="ghost" onClick={() => setSelected(null)}>Close</Action></div>
    </div></Card></div>}
  </div>;
}

type ReportItem = {
  id: number;
  title: string;
  asset: string;
  date: string;
  type: string;
  status: string;
  wellId: string;
  depth?: string;
  formation?: string;
  summary?: string;
  metrics?: [string, string][];
  event?: string;
  notes?: string;
  relevance?: string;
  source?: string;
  related?: string;
  verificationStatus?: string;
  verifier?: string;
  dataLabel?: string;
};

function Reports({ selectedWell }: { selectedWell: WellId }) {
  const [selected, setSelected] = useState(0);
  const { data: listData } = useApi<{ reports: ReportItem[] }>("/api/reports", []);
  const [fullReport, setFullReport] = useState<ReportItem | null>(null);

  const reportList: ReportItem[] = listData?.reports ?? [
    { id: 1, title: "Daily Drilling Report #212", asset: "MW-27", date: "14 Jun 2024", type: "DDR", status: "Verified", wellId: "MW-27" },
    { id: 2, title: "Torque Trend Evidence Pack", asset: "MW-27", date: "14 Jun 2024", type: "EVIDENCE", status: "Verified", wellId: "MW-27" },
    { id: 3, title: "End of Well Report — MW-19", asset: "MW-19", date: "12 Mar 2023", type: "EOWR", status: "Verified", wellId: "MW-19" },
    { id: 4, title: "BOP Inspection Record", asset: "PAD B-02", date: "10 Jun 2024", type: "HSE", status: "Review due", wellId: "PAD B-02" },
  ];

  const selectedId = reportList[selected]?.id;

  // Load full report detail
  useEffect(() => {
    if (!selectedId) return;
    fetch(`/api/reports/${selectedId}`)
      .then((r) => r.json())
      .then((d) => setFullReport(d.report))
      .catch(() => setFullReport(null));
  }, [selectedId]);

  const report = fullReport ?? reportList[selected];

  const defaultMetrics: [string, string][] = [
    ["Current depth", report?.depth ?? "—"],
    ["Formation", report?.formation ?? "—"],
    ["Status", report?.status ?? "—"],
    ["Asset", report?.asset ?? "—"],
    ["Date", report?.date ?? "—"],
    ["Type", report?.type ?? "—"],
    ["Verifier", report?.verifier ?? "Operations Assurance"],
  ];

  return <div className="page-content"><div className="toolbar"><div className="search-box wide"><Icon name="search" /><span>Search reports and evidence</span></div><Action icon="filter">All document types</Action><Action kind="primary" icon="report">Generate report</Action></div>
    <div className="reports-grid"><Card><div className="card-header"><div><Kicker>DOCUMENT LIBRARY · DEMO / SAMPLE DATA</Kicker><div className="card-title">Recent reports</div></div><span className="count">{reportList.length} FILES</span></div>
      <div className="report-list">{reportList.map((r, i) => <div role="button" tabIndex={0} onClick={() => setSelected(i)} key={r.id} className={selected === i ? "active" : ""}><div className="record-icon"><Icon name="report" /></div><div><strong>{r.title}</strong><p>{r.asset} · {r.date}</p></div><span>{r.type}</span><Icon name="chevron" size={15} /></div>)}</div></Card>
      <Card className="preview-card"><div className="card-header"><div><Kicker>REPORT PREVIEW · SAMPLE DATA</Kicker><div className="card-title">{report?.title ?? "Select a report"}</div></div><Action icon="download">Download</Action></div>
        {report && <div className="paper">
          <div className="paper-brand"><div className="brand-mark"><Icon name="well" /></div><span>DRILLWISE<br /><small>OPERATIONS RECORD · DEMO</small></span></div>
          <div className="paper-title">{report.title}</div>
          <div className="paper-meta">
            <span>WELL / ASSET<strong>{report.asset}</strong></span>
            <span>REPORT DATE<strong>{report.date}</strong></span>
            <span>STATUS<strong>{report.status?.toUpperCase()}</strong></span>
          </div>
          <div className="paper-section"><strong>DRILLING SUMMARY</strong><p>{report.summary ?? "Sample historical report. Full content available in the approved operational record system."}</p></div>
          <div className="paper-metrics">{(report.metrics ?? defaultMetrics).map(([label, value]) => <div key={label}><span>{label}</span><strong>{value}</strong></div>)}</div>
          <div className="paper-section two">
            <div><strong>OBSERVED EVENT</strong><p>{report.event ?? "Refer to full operational record."}</p></div>
            <div><strong>OPERATIONAL NOTES</strong><p>{report.notes ?? "Refer to full operational record."}</p></div>
          </div>
          <div className="paper-section"><strong>HISTORICAL RELEVANCE</strong><p>{report.relevance ?? "Historical similarity analysis available. Refer to supporting evidence records."}</p></div>
          <div className="paper-evidence">
            <div><span>SOURCE / REPORT REFERENCE</span><strong>{report.source ?? report.id}</strong></div>
            <div><span>RELEVANT DEPTH</span><strong>{report.depth ?? "—"}</strong></div>
            <div><span>RELATED WELL / EVENT</span><strong>{report.related ?? "—"}</strong></div>
          </div>
          <div className="verification"><Icon name="check" /><div><strong>Evidence verification: {report.verificationStatus ?? report.status}</strong><span>{report.dataLabel ?? "DEMO DATA · Prototype record · Operations Assurance workflow"}</span></div></div>
        </div>}
      </Card>
    </div>
  </div>;
}

type AiMessage = { role: "user" | "assistant"; text: string; findings?: { well: string; event: string; depth: string; formation: string; historicalSimilarity: string; report: string; outcome: string }[]; disclaimer?: string };

function Assistant({ navigate, selectedWell }: { navigate: (page: Page) => void; selectedWell: WellId }) {
  const suggestedQuestions = [
    "What caused the torque increase on " + selectedWell + "?",
    "Have nearby wells experienced mud loss around this depth?",
    `Show evidence for the recommended mitigation on ${selectedWell}`,
    "Compare nearby offset wells by historical similarity",
  ];
  const [messages, setMessages] = useState<AiMessage[]>([]);
  const [inputText, setInputText] = useState("");
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLDivElement>(null);

  const ask = useCallback((q: string) => {
    if (!q.trim() || loading) return;
    setMessages((prev) => [...prev, { role: "user", text: q }]);
    setLoading(true);
    if (inputRef.current) inputRef.current.textContent = "";
    setInputText("");

    fetch("/api/assistant", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ question: q, activeWell: selectedWell }),
    })
      .then((r) => r.json())
      .then((data) => {
        setMessages((prev) => [
          ...prev,
          {
            role: "assistant",
            text: `${data.analysis}\n\n${data.recommendation}`,
            findings: data.findings,
            disclaimer: data.meta?.disclaimer,
          },
        ]);
        setLoading(false);
      })
      .catch(() => {
        setMessages((prev) => [
          ...prev,
          {
            role: "assistant",
            text: "Unable to reach the demo API. Please ensure the backend server is running on port 3001.",
          },
        ]);
        setLoading(false);
      });
  }, [loading, selectedWell]);

  const handleSend = () => {
    const text = inputRef.current?.textContent?.trim() ?? inputText.trim();
    if (text) ask(text);
  };

  return <div className="page-content ai-layout"><div className="ai-main">
    <div className="assistant-intro"><div className="ai-large"><Icon name="spark" size={24} /></div><Kicker>DRILLWISE AI · DEMO MODE · {selectedWell}</Kicker><div className="assistant-title">How can I support your operation?</div><p>Ask about wells, risks, historical events, or verified evidence across the field. Responses grounded in demo dataset.</p></div>

    {messages.length > 0 && <div className="conversation">
      {messages.map((msg, i) => msg.role === "user"
        ? <div key={i} className="user-message">{msg.text}</div>
        : <div key={i} className="ai-message"><div className="ai-orb"><Icon name="spark" /></div><div>
          <strong>AI-assisted decision support · Demo data</strong>
          <p style={{ whiteSpace: "pre-line" }}>{msg.text}</p>
          {msg.findings && msg.findings.length > 0 && <div style={{ marginTop: "12px" }}>
            {msg.findings.map((f, fi) => <div key={fi} className="citation" style={{ marginBottom: "6px", flexDirection: "column", alignItems: "flex-start", gap: "4px" }}>
              <div style={{ display: "flex", gap: "8px", alignItems: "center" }}><Icon name="report" /><strong>{f.well} · {f.event}</strong></div>
              <span style={{ fontSize: "10px", color: "var(--muted)", paddingLeft: "22px" }}>Depth: {f.depth} · Formation: {f.formation} · Historical Similarity: {f.historicalSimilarity}</span>
              <span style={{ fontSize: "10px", color: "var(--muted-2)", paddingLeft: "22px" }}>Report: {f.report} · {f.outcome}</span>
            </div>)}
          </div>}
          <div className="citation"><Icon name="report" /><span>Demo dataset · Engineer verification required</span></div>
          <div className="response-actions"><Action kind="primary" onClick={() => navigate("Reports & Evidence")}>View supporting evidence</Action><Action onClick={() => navigate("Nearby / Offset Wells")}>Compare wells</Action></div>
        </div></div>
      )}
      {loading && <div className="ai-message"><div className="ai-orb"><Icon name="spark" /></div><div><strong>Analysing demo dataset…</strong><p>Matching against {selectedWell} context and nearby well records.</p></div></div>}
    </div>}

    {messages.length === 0 && !loading && <div className="suggested"><Kicker>SUGGESTED QUESTIONS · {selectedWell}</Kicker>{suggestedQuestions.map((q) => <div role="button" tabIndex={0} onClick={() => ask(q)} key={q}><Icon name="spark" size={16} /><span>{q}</span><Icon name="arrow" size={16} /></div>)}</div>}

    <div className="prompt-box">
      <div ref={inputRef} contentEditable suppressContentEditableWarning data-placeholder={messages.length > 0 ? "Ask a follow-up question..." : "Ask Drillwise AI..."} onInput={(e) => setInputText(e.currentTarget.textContent ?? "")} onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(); } }} style={{ flex: 1, outline: "none", minHeight: "20px" }} />
      <div role="button" tabIndex={0} onClick={handleSend} className="send-button"><Icon name="send" size={17} /></div>
    </div>
    <p className="ai-disclaimer">AI-assisted decision support · Demo data only · No live OIL data · Engineer verification required before acting on any recommendation.</p>
  </div>
    <Card className="ai-context"><div className="card-header"><div><Kicker>ACTIVE CONTEXT</Kicker><div className="card-title">What AI can see</div></div></div>
      <div className="context-well"><Icon name="well" /><div><span>SELECTED WELL</span><strong>{selectedWell}</strong><small>Demo data connected</small></div><Status>DEMO</Status></div>
      <div className="context-list">
        <div><Icon name="activity" /><span>Demo telemetry</span><Icon name="check" /></div>
        <div><Icon name="history" /><span>Historical records</span><Icon name="check" /></div>
        <div><Icon name="report" /><span>Sample reports</span><Icon name="check" /></div>
        <div><Icon name="alert" /><span>Risk register</span><Icon name="check" /></div>
      </div>
      <div className="context-note"><Icon name="help" /><p>Answers include citations so you can inspect the evidence behind each recommendation. No live OIL data.</p></div>
    </Card>
  </div>;
}

// ─── Help / Documentation ─────────────────────────────────────────────────────

const docs = [
  ["Getting Started", "Use the fixed sidebar to move between live operations, offset-well intelligence, historical evidence, alerts, reports, and the AI Assistant. Select a well from a map or list to carry its context into Active Well."],
  ["Overview", "The field summary combines live KPIs, drilling performance for the selected well, selectable map markers, active risks, and AI-detected patterns. Select a marker to update its operational detail, then open the well or full map."],
  ["Active Well", "Active Well shows the selected well's current status, depth, telemetry, parameters, and 12-hour timeline. All data updates when you select a different well. View History opens comparable events; View Historical Evidence opens verified source reports."],
  ["Nearby / Offset Wells", "The map and ranked list compare nearby wells by distance and Historical Similarity. Filter completed wells, select any marker, open a well, or use Compare Wells for side-by-side ROP and NPT."],
  ["Historical Intelligence", "Choose an intelligence topic to inspect comparable events, mitigation outcomes, downtime, and verified records. Evidence links open the source record in Reports & Evidence."],
  ["Risk & Alerts", "Open, Acknowledged, and Resolved tabs reflect the alert workflow. Acknowledge assigns engineer attention. Open alert provides current conditions, Potential Historical Risk, Supporting Evidence, and recommended action. Resolve closes the operational workflow."],
  ["Reports & Evidence", "Select any sample record to load its full preview. Each preview includes operational measurements, observed events, Historical Relevance, source references, related wells, and verification status."],
  ["AI Assistant", "Ask questions about wells, historical events, or risks. Responses are generated from demo data. Supporting Evidence and Compare Wells preserve the analysis workflow. No live OIL data or WITSML connection."],
  ["FAQ", "All data is demo/sample data. The backend API serves structured demo data from server/data/. No live OIL connection, WITSML, or production predictions. Labels: DEMO DATA / Sample Historical Report / Engineer Verification Required."],
];

type Preferences = { critical: boolean; evidence: boolean; compact: boolean };
type ProfileDetails = { name: string; role: string; organization: string; email: string; contact: string };

function EditableValue({ value, editable, onChange }: { value: string; editable: boolean; onChange: (value: string) => void }) {
  return <div className={`editable-value ${editable ? "editing" : ""}`} contentEditable={editable} suppressContentEditableWarning onInput={(event) => onChange(event.currentTarget.textContent || "")}>{value}</div>;
}

function Profile({ preferences, setPreferences, details, setDetails, onSignOut }: { preferences: Preferences; setPreferences: (value: Preferences) => void; details: ProfileDetails; setDetails: (value: ProfileDetails) => void; onSignOut: () => void }) {
  const [section, setSection] = useState("Profile Details");
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(details);
  const [saved, setSaved] = useState("");
  const [docSearch, setDocSearch] = useState("");
  const [activeDoc, setActiveDoc] = useState("Getting Started");
  const [signOutOpen, setSignOutOpen] = useState(false);
  const items: { label: string; icon: IconName }[] = [{ label: "Profile Details", icon: "user" }, { label: "Settings", icon: "settings" }, { label: "Help & Documentation", icon: "help" }, { label: "Sign Out", icon: "logout" }];
  const setPreference = (key: keyof Preferences) => {
    setPreferences({ ...preferences, [key]: !preferences[key] });
    setSaved("Settings saved");
    window.setTimeout(() => setSaved(""), 2000);
  };
  const matchingDocs = docs.filter(([title, copy]) => `${title} ${copy}`.toLowerCase().includes(docSearch.toLowerCase()));
  const currentDoc = docs.find(([title]) => title === activeDoc) || docs[0];
  return <div className="page-content profile-layout"><Card className="profile-menu">{items.map((item) => <div role="button" tabIndex={0} key={item.label} onClick={() => { if (item.label === "Sign Out") setSignOutOpen(true); else setSection(item.label); }} className={`${section === item.label ? "active" : ""} ${item.label === "Sign Out" ? "signout" : ""}`}><Icon name={item.icon} /><span>{item.label}</span><Icon name="chevron" size={15} /></div>)}</Card><Card className="profile-panel">{section === "Profile Details" && <><div className="card-header"><div><Kicker>ACCOUNT</Kicker><div className="card-title">Profile Details</div></div><div className="profile-actions">{editing ? <><Action onClick={() => { setDraft(details); setEditing(false); }}>Cancel</Action><Action kind="primary" onClick={() => { setDetails(draft); setEditing(false); setSaved("Profile changes saved"); window.setTimeout(() => setSaved(""), 2000); }}>Save Changes</Action></> : <Action onClick={() => setEditing(true)}>Edit Profile</Action>}</div></div>{saved && <div className="inline-confirmation"><Icon name="check" size={14} />{saved}</div>}<div className="profile-identity"><div className="avatar large">RP</div><div><div className="well-title">{details.name}</div><p>{details.role} · {details.organization}</p><Status tone="blue">DEMO MODE</Status></div></div><div className="details-grid editable"><div><span>NAME</span><EditableValue value={draft.name} editable={editing} onChange={(name) => setDraft({ ...draft, name })} /></div><div><span>ROLE</span><EditableValue value={draft.role} editable={editing} onChange={(role) => setDraft({ ...draft, role })} /></div><div><span>ORGANIZATION</span><EditableValue value={draft.organization} editable={editing} onChange={(organization) => setDraft({ ...draft, organization })} /></div><div><span>EMAIL</span><EditableValue value={draft.email} editable={editing} onChange={(email) => setDraft({ ...draft, email })} /></div><div><span>CONTACT NUMBER</span><EditableValue value={draft.contact} editable={editing} onChange={(contact) => setDraft({ ...draft, contact })} /></div><div><span>ACCESS</span><strong>Authorized Operations · OIL</strong></div></div></>}
      {section === "Settings" && <><Kicker>PREFERENCES</Kicker><div className="card-title">Settings</div>{saved && <div className="inline-confirmation"><Icon name="check" size={14} />{saved}</div>}<div className="settings-list"><div><div><strong>Critical alert notifications</strong><p>Receive field alerts in this workspace</p></div><span role="switch" aria-checked={preferences.critical} tabIndex={0} onClick={() => setPreference("critical")} className={`toggle ${preferences.critical ? "on" : ""}`}><i /></span></div><div><div><strong>Evidence reminders</strong><p>Notify when supporting records are due</p></div><span role="switch" aria-checked={preferences.evidence} tabIndex={0} onClick={() => setPreference("evidence")} className={`toggle ${preferences.evidence ? "on" : ""}`}><i /></span></div><div><div><strong>Compact data tables</strong><p>Show additional rows in operational views</p></div><span role="switch" aria-checked={preferences.compact} tabIndex={0} onClick={() => setPreference("compact")} className={`toggle ${preferences.compact ? "on" : ""}`}><i /></span></div></div></>}
      {section === "Help & Documentation" && <div className="docs-page"><div className="docs-head"><div><Kicker>SUPPORT · PROTOTYPE DOCUMENTATION</Kicker><div className="card-title">Help & Documentation</div></div><div className="docs-search"><Icon name="search" size={15} /><div contentEditable suppressContentEditableWarning data-placeholder="Search documentation" onInput={(event) => setDocSearch(event.currentTarget.textContent || "")} /></div></div><div className="docs-layout"><div className="docs-nav">{matchingDocs.map(([title]) => <div role="button" tabIndex={0} key={title} onClick={() => setActiveDoc(title)} className={activeDoc === title ? "active" : ""}>{title}<Icon name="chevron" size={13} /></div>)}</div><div className="doc-article"><Kicker>DRILLWISE USER GUIDE</Kicker><div className="paper-title">{currentDoc[0]}</div><p>{currentDoc[1]}</p><div className="doc-flow"><strong>Prototype data flow</strong><span>Demo dataset & records</span><Icon name="arrow" /><span>Drillwise API intelligence</span><Icon name="arrow" /><span>Engineer review & evidence</span></div></div></div></div>}
    </Card>{signOutOpen && <div className="modal-backdrop"><Card className="signout-dialog"><Icon name="logout" size={28} /><div className="card-title">Are you sure you want to sign out?</div><p>Your prototype workspace state will remain available for this session.</p><div><Action onClick={() => setSignOutOpen(false)}>Cancel</Action><Action kind="danger" onClick={onSignOut}>Sign Out</Action></div></Card></div>}</div>;
}

// ─── App shell ────────────────────────────────────────────────────────────────

function AppContent({ page, navigate, selectedWell, selectWell, preferences, setPreferences, details, setDetails, onSignOut }: { page: Page; navigate: (page: Page) => void; selectedWell: WellId; selectWell: (well: WellId) => void; preferences: Preferences; setPreferences: (value: Preferences) => void; details: ProfileDetails; setDetails: (value: ProfileDetails) => void; onSignOut: () => void }) {
  if (page === "Overview") return <Overview navigate={navigate} selectedWell={selectedWell} selectWell={selectWell} />;
  if (page === "Active Well") return <ActiveWell navigate={navigate} selectedWell={selectedWell} />;
  if (page === "Nearby / Offset Wells") return <NearbyWells navigate={navigate} selectedWell={selectedWell} selectWell={selectWell} />;
  if (page === "Historical Intelligence") return <Historical navigate={navigate} selectedWell={selectedWell} />;
  if (page === "Risk & Alerts") return <Risks selectedWell={selectedWell} />;
  if (page === "Reports & Evidence") return <Reports selectedWell={selectedWell} />;
  if (page === "AI Assistant") return <Assistant navigate={navigate} selectedWell={selectedWell} />;
  return <Profile preferences={preferences} setPreferences={setPreferences} details={details} setDetails={setDetails} onSignOut={onSignOut} />;
}

export default function App() {
  const [page, setPage] = useState<Page>("Overview");
  const [selectedWell, setSelectedWell] = useState<WellId>("MW-27");
  const [preferences, setPreferences] = useState<Preferences>({ critical: true, evidence: true, compact: false });
  const [details, setDetails] = useState<ProfileDetails>({ name: "Rajesh P.", role: "Drilling Engineer (Auth Ops)", organization: "OIL", email: "rajesh.p@oilindia.in", contact: "+91 98765 20481" });
  const [signedIn, setSignedIn] = useState(true);

  // Live alert count for sidebar badge
  const { data: alertSummary } = useApi<{ counts: { open: number } }>("/api/alerts", []);
  const openAlertCount = alertSummary?.counts?.open ?? initialRisks.filter((r) => r.state === "Open").length;

  if (!signedIn) return <div className="login-screen"><div className="login-card"><div className="brand-mark"><Icon name="well" size={22} /></div><Kicker>DRILLWISE INTELLIGENCE PLATFORM</Kicker><div className="page-title">Welcome back</div><p>Sign in to access the Rajasthan Operations workspace.</p><div className="login-fields"><div><span>WORK EMAIL</span><strong>{details.email}</strong></div><div><span>PASSWORD</span><strong>••••••••••••</strong></div></div><Action kind="primary" onClick={() => { setSignedIn(true); setPage("Overview"); }}>Sign In</Action><small>DEMO MODE · eRTMAC-NWIS PROTOTYPE · SIH26121</small></div></div>;

  return <div className={`app-shell ${preferences.compact ? "compact" : ""}`}>
    <Sidebar page={page} navigate={setPage} openAlertCount={openAlertCount} />
    <main>
      <Header page={page} navigate={setPage} selectWell={(well) => setSelectedWell(well as WellId)} />
      <AppContent page={page} navigate={setPage} selectedWell={selectedWell} selectWell={setSelectedWell} preferences={preferences} setPreferences={setPreferences} details={details} setDetails={setDetails} onSignOut={() => setSignedIn(false)} />
    </main>
  </div>;
}
