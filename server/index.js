// eRTMAC-NWIS Backend API Server
// Lightweight Express.js server — demo data only
// Port: 3001

const path = require("path");
const fs = require("fs");
const express = require("express");
const cors = require("cors");

const { wells } = require("./data/wells");
const { getAlerts, updateAlert } = require("./data/alerts");
const { reports } = require("./data/reports");
const {
  events,
  getEventsForWell,
  getNearbyWells,
} = require("./data/events");
const { buildAssistantResponse } = require("./data/assistant");

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// Health check
app.get("/api/health", (req, res) => {
  res.json({
    status: "ok",
    label: "eRTMAC-NWIS Demo API",
    dataMode: "DEMO DATA — Sample data only. No live OIL connection.",
    wells: wells.length,
    events: events.length,
    reports: reports.length,
    alerts: getAlerts().length,
  });
});

// GET /api/wells — all wells
app.get("/api/wells", (req, res) => {
  const summary = wells.map((w) => ({
    id: w.id,
    name: w.name,
    field: w.field,
    pad: w.pad,
    status: w.status,
    depth: w.depth,
    depthValue: w.depthValue,
    formation: w.formation,
    activity: w.activity,
    rop: w.rop,
    wob: w.wob,
    rpm: w.rpm,
    flow: w.flow,
    performanceStatus: w.performanceStatus,
    performanceTone: w.performanceTone,
    alertSummary: w.alertSummary,
    historySummary: w.historySummary,
    openAlerts: w.openAlerts,
    location: w.location,
    insight: w.insight,
    evidence: w.evidence,
    chartPath: w.chartPath,
    chartEndY: w.chartEndY,
  }));
  res.json({ wells: summary, dataLabel: "DEMO DATA" });
});

// GET /api/wells/:id — single well detail
app.get("/api/wells/:id", (req, res) => {
  const well = wells.find(
    (w) => w.id === req.params.id || w.id === decodeURIComponent(req.params.id)
  );
  if (!well) {
    return res.status(404).json({ error: "Well not found", wellId: req.params.id });
  }
  res.json({ well, dataLabel: "DEMO DATA" });
});

// GET /api/wells/:id/nearby — nearby/offset wells
app.get("/api/wells/:id/nearby", (req, res) => {
  const wellId = decodeURIComponent(req.params.id);
  const well = wells.find((w) => w.id === wellId);
  if (!well) {
    return res.status(404).json({ error: "Well not found" });
  }
  const nearby = getNearbyWells(wellId);
  res.json({
    wellId,
    nearby,
    totalCount: nearby.length,
    dataLabel: "DEMO DATA",
  });
});

// GET /api/wells/:id/history — historical events for a well
app.get("/api/wells/:id/history", (req, res) => {
  const wellId = decodeURIComponent(req.params.id);
  const wellEvents = getEventsForWell(wellId);
  res.json({
    wellId,
    events: wellEvents,
    count: wellEvents.length,
    dataLabel: "DEMO DATA",
  });
});

// GET /api/events — all historical events
app.get("/api/events", (req, res) => {
  const { type, wellId } = req.query;
  let filtered = [...events];
  if (type) {
    filtered = filtered.filter(
      (e) => e.type.toLowerCase() === type.toLowerCase()
    );
  }
  if (wellId) {
    filtered = filtered.filter((e) => e.wellId === wellId);
  }
  res.json({ events: filtered, count: filtered.length, dataLabel: "DEMO DATA" });
});

// GET /api/alerts — all alerts
app.get("/api/alerts", (req, res) => {
  const alerts = getAlerts();
  const { state } = req.query;
  const filtered = state
    ? alerts.filter((a) => a.state.toLowerCase() === state.toLowerCase())
    : alerts;
  res.json({
    alerts: filtered,
    counts: {
      open: alerts.filter((a) => a.state === "Open").length,
      acknowledged: alerts.filter((a) => a.state === "Acknowledged").length,
      resolved: alerts.filter((a) => a.state === "Resolved").length,
    },
    dataLabel: "DEMO DATA",
  });
});

// PATCH /api/alerts/:id — update alert state
app.patch("/api/alerts/:id", (req, res) => {
  const id = parseInt(req.params.id, 10);
  const { state } = req.body;

  const validStates = ["Open", "Acknowledged", "Resolved"];
  if (!state || !validStates.includes(state)) {
    return res.status(400).json({
      error: "Invalid state",
      validStates,
      received: state,
    });
  }

  const updated = updateAlert(id, state);
  if (!updated) {
    return res.status(404).json({ error: "Alert not found", id });
  }

  res.json({ alert: updated, dataLabel: "DEMO DATA" });
});

// GET /api/reports — all reports (summary list)
app.get("/api/reports", (req, res) => {
  const { wellId, type } = req.query;
  let filtered = [...reports];
  if (wellId) {
    filtered = filtered.filter((r) => r.wellId === wellId || r.asset === wellId);
  }
  if (type) {
    filtered = filtered.filter(
      (r) => r.type.toLowerCase() === type.toLowerCase()
    );
  }
  const summary = filtered.map((r) => ({
    id: r.id,
    title: r.title,
    asset: r.asset,
    date: r.date,
    type: r.type,
    status: r.status,
    wellId: r.wellId,
    dataLabel: r.dataLabel,
  }));
  res.json({
    reports: summary,
    count: summary.length,
    dataLabel: "DEMO DATA · Sample Historical Reports",
  });
});

// GET /api/reports/:id — full report detail
app.get("/api/reports/:id", (req, res) => {
  const id = parseInt(req.params.id, 10);
  const report = reports.find((r) => r.id === id);
  if (!report) {
    return res.status(404).json({ error: "Report not found", id });
  }
  res.json({ report, dataLabel: "DEMO DATA · Sample Historical Report" });
});

// POST /api/assistant — demo AI response
app.post("/api/assistant", (req, res) => {
  const { question, activeWell } = req.body;
  if (!question || typeof question !== "string" || question.trim().length === 0) {
    return res.status(400).json({ error: "Question is required" });
  }
  const response = buildAssistantResponse(question.trim(), activeWell);
  res.json(response);
});

// 404 catch-all for unmatched /api routes
app.use("/api/*", (req, res) => {
  res.status(404).json({ error: "API endpoint not found", path: req.path });
});

// Serve frontend static assets from dist/
const distPath = path.join(__dirname, "../dist");
if (fs.existsSync(distPath)) {
  app.use(express.static(distPath));
}

// SPA fallback for all other routes so direct page loads and refreshes work
app.get("*", (req, res) => {
  const indexPath = path.join(distPath, "index.html");
  if (fs.existsSync(indexPath)) {
    res.sendFile(indexPath);
  } else {
    res
      .status(200)
      .send("eRTMAC-NWIS backend active. Run 'npm run build' to generate frontend bundle.");
  }
});

app.listen(PORT, () => {
  console.log(`\n eRTMAC-NWIS Demo API running on http://localhost:${PORT}`);
  console.log(` Health check: http://localhost:${PORT}/api/health`);
  console.log(` Mode: DEMO DATA — No live OIL connection\n`);
});

module.exports = app;
