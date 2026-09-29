// DEMO AI ASSISTANT — eRTMAC-NWIS Retrieval-Based Response Logic
// This is NOT a live LLM. Responses are built from structured query-to-event
// retrieval against the demo dataset.
// Clearly labelled: "AI-assisted decision support · Demo data · Engineer verification required"

const { wells } = require("./wells");
const { events, getNearbyWells } = require("./events");
const { reports } = require("./reports");

/**
 * Categorize query intent with precise multi-word & domain-specific matching.
 * Specifically avoids matching generic individual tokens like "mud" or "depth".
 */
function detectIntent(query) {
  const q = query.toLowerCase().trim();

  // 1. Mud Loss / Lost Circulation (must not be confused with generic mud weight or influx)
  if (
    /(?:mud|fluid|circulation)\s*loss|lost\s*circulation|loss\s*of\s*returns|seepage\s*loss|loss\s*zone|curing\s*loss|lcm\b/i.test(
      q
    )
  ) {
    return {
      category: "MUD_LOSS",
      label: "Mud Loss & Lost Circulation",
      targetTypes: ["Lost circulation"],
      targetTags: ["mud-loss", "lost-circulation", "fluid-loss", "lcm", "seepage", "loss"],
      negativeTags: ["influx", "kick", "gas-kick", "gas-show"],
      analysisPrefix:
        "Documented lost circulation and mud loss events identified in offset well records at comparable depths:",
      recommendation:
        "Historical mitigation records in this field show mud loss in fractured intervals is successfully arrested by pumping a 25–30 bbl medium LCM pill and adding calcium carbonate bridging agent. Maintain continuous pit volume monitoring and reduce annular flow rate. Engineer Verification Required.",
    };
  }

  // 2. Influx / Kick / Well Control (must not return lost circulation or torque)
  if (
    /\b(?:influx|kick|gas\s*kick|fluid\s*kick|well\s*control|pit\s*gain|flow\s*check|shut-?in|kill\s*sheet|choke\s*manifold)\b/i.test(
      q
    )
  ) {
    return {
      category: "INFLUX_KICK",
      label: "Well Control & Influx / Kick",
      targetTypes: ["Well control"],
      targetTags: ["influx", "kick", "gas-kick", "well-control", "pit-gain", "shut-in"],
      negativeTags: ["mud-loss", "lost-circulation", "lcm"],
      analysisPrefix:
        "Documented well control, fluid influx, and kick incidents identified in offset well records:",
      recommendation:
        "Historical data indicates transient influxes following mud-weight deviations are effectively mitigated by immediate well shut-in and circulation out via choke manifold (Wait and Weight method). Conduct a mandatory flow check and confirm pit volume before resuming drilling. Engineer Verification Required.",
    };
  }

  // 3. Stuck Pipe / Differential Sticking (must not return torque-only or mud-loss)
  if (
    /\b(?:stuck\s*pipe|differential\s*sticking|mechanical\s*sticking|pipe\s*stuck|stuck\s*string|freeing\s*pipe|jarring\s*downward)\b/i.test(
      q
    )
  ) {
    return {
      category: "STUCK_PIPE",
      label: "Stuck Pipe & Differential Sticking",
      targetTypes: ["Stuck pipe"],
      targetTags: ["stuck-pipe", "differential-sticking", "pipe-stuck", "string-stuck", "jarring"],
      negativeTags: ["mud-loss", "lost-circulation", "gas-show"],
      analysisPrefix:
        "Historical stuck pipe and differential sticking incidents identified in comparable formations:",
      recommendation:
        "Historical offset records show high risk of differential sticking in tight sandstone sections when torque exceeds 24 kft-lb during stationary intervals. Recommended mitigations: immediate downward jarring, pumping lubricant/spotting fluid, and continuous pipe movement. Engineer Verification Required.",
    };
  }

  // 4. Torque & Drag / Pack-Off Precursors
  if (
    /\b(?:torque|torque\s*increase|torque\s*spike|drag|pack-?off|motor\s*stall|tight\s*hole|tight\s*spot|overpull)\b/i.test(
      q
    )
  ) {
    return {
      category: "TORQUE_DRAG",
      label: "Torque & Drag / Pack-off",
      targetTypes: ["Torque & drag"],
      targetTags: ["torque", "torque-increase", "torque-spike", "drag", "pack-off", "motor-stall", "tight-spot"],
      negativeTags: ["mud-loss", "lost-circulation", "influx", "kick"],
      analysisPrefix:
        "Documented torque escalation, drag, and pack-off precursor events identified in offset well records:",
      recommendation:
        "Historical patterns in the Fatehgarh Sandstone indicate torque escalation typically stems from cuttings accumulation in the 8½″ directional section. Recommended actions: (1) circulate bottoms-up, (2) verify torque stabilization before continuing, (3) reduce WOB to stay within approved section limits. Engineer Verification Required.",
    };
  }

  // 5. Connection Gas / Gas Shows
  if (/\b(?:connection\s*gas|gas\s*show|gas\s*spike|high\s*gas|background\s*gas)\b/i.test(q)) {
    return {
      category: "GAS_SHOW",
      label: "Connection Gas & Gas Shows",
      targetTypes: ["Well control"],
      targetTags: ["gas-show", "connection-gas", "gas"],
      negativeTags: ["mud-loss", "lost-circulation"],
      analysisPrefix:
        "Documented connection gas and gas show events recorded in offset wells in this section:",
      recommendation:
        "Connection gas shows in this formation interval are manageable with an incremental 0.2 ppg mud-weight elevation if readings exceed 4.0% over two consecutive connections. Maintain continuous degassing. Engineer Verification Required.",
    };
  }

  // 6. Offset Well Comparison
  if (
    /\b(?:nearby\s*wells?|offset\s*wells?|compare\s*wells?|offset\s*analysis|similarity|closest)\b/i.test(
      q
    )
  ) {
    return {
      category: "OFFSET_COMPARISON",
      label: "Offset Well Spatial & Historical Similarity",
      targetTypes: [],
      targetTags: [],
      negativeTags: [],
      analysisPrefix: "Spatial and historical offset well analysis based on current field intelligence:",
      recommendation:
        "Review offset wells ranked by Historical Similarity to benchmark ROP, section NPT, and expected lithological boundaries before entering target reservoir depth. Engineer Verification Required.",
    };
  }

  // 7. General Operational Risk / Alerts
  if (/\b(?:risks?|alerts?|active\s*alerts?|risk\s*register|priority)\b/i.test(q)) {
    return {
      category: "GENERAL_RISK",
      label: "Operational Risk Register",
      targetTypes: [],
      targetTags: [],
      negativeTags: [],
      analysisPrefix: "Summary of prioritized operational risks currently requiring attention:",
      recommendation:
        "Open alerts require engineer acknowledgement and verification prior to drilling parameter changes. Refer to the Risk & Alerts page to review supporting evidence for each active item. Engineer Verification Required.",
    };
  }

  // 8. Well-specific inquiry fallback (e.g. "Tell me about MW-14" or "MW-27 status")
  const wellMatch = wells.find((w) => q.includes(w.id.toLowerCase()));
  if (wellMatch) {
    return {
      category: "WELL_SPECIFIC",
      label: `Well Profile: ${wellMatch.id}`,
      well: wellMatch,
      targetTypes: [],
      targetTags: [],
      negativeTags: [],
      analysisPrefix: `Operational and historical status for well ${wellMatch.id}:`,
      recommendation: `Review the Active Well and Historical Intelligence views for full telemetry and associated evidence records regarding ${wellMatch.id}. Engineer Verification Required.`,
    };
  }

  // Default Fallback
  return {
    category: "DEFAULT",
    label: "Field Intelligence Overview",
    targetTypes: [],
    targetTags: [],
    negativeTags: [],
    analysisPrefix:
      "The query was matched against the operational demo dataset across 6 wells and verified historical records:",
    recommendation:
      "For specific operational guidance, query historical parameters such as 'mud loss', 'influx/kick', 'torque increase', or 'stuck pipe'. Engineer Verification Required.",
  };
}

/**
 * Core retrieval engine: matches events from the real dataset strictly
 * aligned with the classified intent, penalizing mismatched categories.
 */
function retrieveEventsForIntent(intent, activeWellId) {
  if (intent.category === "OFFSET_COMPARISON") {
    const nearby = getNearbyWells(activeWellId || "MW-27");
    return nearby.slice(0, 3).map((w) => ({
      well: w.wellId,
      event: `Historical analogue — ${w.status}`,
      depth: w.finalDepth,
      formation: "See well record",
      historicalSimilarity: w.similarity,
      report: `Offset Well Record · ${w.distance}`,
      outcome: `Avg ROP: ${w.avgROP} · NPT: ${w.npt}`,
    }));
  }

  if (intent.category === "WELL_SPECIFIC" && intent.well) {
    const wellEvents = events.filter((e) => e.wellId === intent.well.id);
    if (wellEvents.length > 0) {
      return wellEvents.slice(0, 3).map((e) => ({
        well: e.well,
        event: e.title,
        depth: e.depth,
        formation: e.formation,
        historicalSimilarity: e.similarity,
        report: e.report,
        outcome: e.outcome,
      }));
    }
  }

  // Score all events against the target criteria
  const scored = events.map((event) => {
    // When intent specifies target criteria, disqualify any event that has neither matching type nor tag
    const hasTypeMatch = Boolean(intent.targetTypes?.includes(event.type));
    const hasTagMatch = Boolean(
      event.tags && intent.targetTags?.some((t) => event.tags.includes(t))
    );

    if (intent.targetTypes?.length > 0 || intent.targetTags?.length > 0) {
      if (!hasTypeMatch && !hasTagMatch) {
        return { event, score: -100 };
      }
    }

    // Reject events containing negative tags for this category
    const hasNegativeTag = (intent.negativeTags || []).some((neg) =>
      event.tags?.includes(neg)
    );
    if (hasNegativeTag) {
      return { event, score: -100 };
    }

    let score = 0;
    if (hasTypeMatch) score += 40;
    if (hasTagMatch) score += 30;
    if (event.wellId === activeWellId) score += 10;
    if (event.verified) score += 5;

    return { event, score };
  });

  const matched = scored
    .filter((s) => s.score > 0)
    .sort((a, b) => b.score - a.score)
    .map((s) => s.event);

  if (matched.length > 0) {
    return matched.slice(0, 3).map((e) => ({
      well: e.well,
      event: e.title,
      depth: e.depth,
      formation: e.formation,
      historicalSimilarity: e.similarity,
      report: e.report,
      outcome: e.outcome,
    }));
  }

  // If no strict match found for general/default queries, return high-confidence verified records
  return events.slice(0, 2).map((e) => ({
    well: e.well,
    event: e.title,
    depth: e.depth,
    formation: e.formation,
    historicalSimilarity: e.similarity,
    report: e.report,
    outcome: e.outcome,
  }));
}

function buildAssistantResponse(question, activeWellId) {
  const currentWell = activeWellId || "MW-27";
  const intent = detectIntent(question);
  const findings = retrieveEventsForIntent(intent, currentWell);

  const nearby = getNearbyWells(currentWell);
  const topSimilarity = nearby.length > 0 ? nearby[0].similarity : "92%";

  let analysisText = "";
  if (intent.category === "MUD_LOSS") {
    analysisText = `Analysis of nearby offset wells shows ${findings.length} documented lost-circulation and mud-loss occurrences in the field. These events took place within depleted fractured sand intervals where annular pressure exceeded formation breakdown limits.`;
  } else if (intent.category === "INFLUX_KICK") {
    analysisText = `Review of field records reveals ${findings.length} documented kick and formation fluid influx incidents. These occurred primarily when mud weight drifted below pore pressure margins during connection sequences or circulation stops.`;
  } else if (intent.category === "STUCK_PIPE") {
    analysisText = `Query identified ${findings.length} historical stuck pipe and differential sticking records. The historical analogue indicates high susceptibility in tight Fatehgarh Sandstone intervals when drill string exposure to stationary differential pressure is prolonged.`;
  } else if (intent.category === "TORQUE_DRAG") {
    analysisText = `Torque trend signature matches ${findings.length} historical torque escalation and pack-off precursor events with up to ${topSimilarity} Historical Similarity. The onset pattern mirrors cuttings accumulation before mechanical stalling.`;
  } else if (intent.category === "GAS_SHOW") {
    analysisText = `Identified ${findings.length} connection gas show records in the current formation interval. Gas levels peaked between 3.4% and 4.1% during connections without sustaining active wellhead flow.`;
  } else if (intent.category === "OFFSET_COMPARISON") {
    analysisText = `There are ${nearby.length} documented offset wells within 10 km of ${currentWell}. Historical Similarity rankings are based on formation correlation, section geometry, and drilling performance.`;
  } else {
    analysisText = `${intent.analysisPrefix} Grounded in verified offset records across the Barmer Basin demo dataset.`;
  }

  return {
    question,
    activeWell: currentWell,
    category: intent.category,
    analysis: analysisText,
    findings,
    recommendation: intent.recommendation,
    meta: {
      label: "AI-assisted decision support · Demo data · Engineer verification required",
      categoryMatched: intent.label,
      dataSource: `${wells.length} demo wells · ${events.length} historical events · ${reports.length} sample reports`,
      disclaimer:
        "This response is generated from demo/sample data only. No live OIL data, WITSML connection, or production predictive model is active. All decisions must be verified against approved operational records.",
      confidence: intent.category !== "DEFAULT" ? "High — domain-specific retrieval" : "Standard",
    },
  };
}

module.exports = { buildAssistantResponse, detectIntent };
