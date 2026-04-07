import "dotenv/config";
import express from "express";
import path from "path";
import { createServer } from "http";
import { Server } from "socket.io";
import { createServer as createViteServer } from "vite";
import { GroupService, AuthService, PartnerService, UserService } from "./src/services/core";
import { QueueService, RacingEngine, NotificationService, PriceService } from "./src/services/racing";
import { AuditService, CRMService, AnalyticsService } from "./src/services/management";

/**
 * 12. API Gateway (Orchestrator)
 * Routing, authentication, validation, and error handling.
 */
async function startServer() {
  const app = express();
  const httpServer = createServer(app);
  const io = new Server(httpServer, { cors: { origin: "*" } }); // Real-time updates
  const PORT = 3000;

  app.use(express.json());

  // --- Real-time WebSocket Logic ---
  io.on("connection", (socket) => {
    console.log("Client connected to KwikRace WebSocket:", socket.id);
    socket.on("join_partner_queue", (partnerId) => {
      socket.join(`partner_${partnerId}`);
    });
  });

  // Middleware: Multi-tenant & Auth Proxy
  app.use(async (req, res, next) => {
    if (req.path.startsWith("/api/public")) return next();
    
    const token = req.headers.authorization?.split(" ")[1];
    if (token) {
      const user = await AuthService.verifySession(token);
      if (user) { (req as any).user = user; (req as any).partner_id = user.user_metadata?.partner_id; }
    }
    next();
  });

  // --- SERVICE ROUTES ---

  // Service 2 & 9: Partner & Audit
  app.get("/api/partner/config", async (req, res) => {
    const partnerId = (req as any).partner_id;
    const config = await PartnerService.getPartner(partnerId);
    res.json(config);
  });

  // Service 4 & 10: Group & CRM
  app.post("/api/groups/register", async (req, res) => {
    const { name, phone, members, partner_id } = req.body;
    try {
      const group = await GroupService.registerGroup(partner_id, { name, phone }, members);
      await CRMService.trackContact(partner_id, name, phone);
      await AuditService.log(partner_id, null, 'group_service', 'register', { group_id: group.id });
      res.json(group);
    } catch (e: any) { res.status(500).json({ error: e.message }); }
  });

  // Service 5: Queue FIFO
  app.post("/api/queue/approve/:id", async (req, res) => {
    const { id } = req.params;
    const partner_id = (req as any).partner_id;
    const group = await QueueService.addToQueue(id);
    await AuditService.log(partner_id || group.partner_id, null, 'queue_service', 'approved', { group_id: id });
    
    // Notify clients on WebSocket
    io.to(`partner_${group.partner_id}`).emit("queue_updated", { partner_id: group.partner_id });
    res.json(group);
  });

  // Service 6: Racing Engine (Atomic Session Start)
  app.post("/api/racing/start", async (req, res) => {
    const { partner_id, group_id } = req.body;
    try {
      const race = await RacingEngine.startRace(partner_id, group_id);
      await AuditService.log(partner_id, null, 'racing_engine', 'start_race', { race_id: race.id });
      io.to(`partner_${partner_id}`).emit("race_status_changed", { status: 'active', group_id });
      res.json(race);
    } catch (e: any) { res.status(400).json({ error: e.message }); }
  });

  // Service 11: Analytics Global
  app.get("/api/analytics/summary", async (req, res) => {
    const stats = await AnalyticsService.getGlobalStats();
    res.json(stats);
  });

  // Service 11: Partner Analytics
  app.get("/api/analytics/partner", async (req, res) => {
    const partner_id = (req as any).partner_id;
    const stats = await AnalyticsService.getPartnerStats(partner_id);
    res.json(stats);
  });

  // --- Client Assets & SSR ---
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  httpServer.listen(PORT, "0.0.0.0", () => {
    console.log(`KwikRace 12-Service SaaS running on http://localhost:${PORT}`);
  });
}

startServer();
