import express from "express";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import dotenv from "dotenv";
import { createServer } from "http";
import { WebSocketServer, WebSocket } from "ws";
import { healthCheck } from "./db.js";
import { initCloudinary } from "./services/cloudinary.js";
import {
  getHomeContent,
  getBanners,
  getCategories,
  getDeals,
  getShop,
  getPromotions,
  getMobileAssets,
  trackEvent,
} from "./routes/content.js";
import adminRouter from "./routes/admin.js";

dotenv.config();

const app = express();
const server = createServer(app);
const PORT = Number(process.env.PORT ?? 4000);

// WebSocket for real-time content updates
const wss = new WebSocketServer({ server, path: "/ws/content" });
const wsClients = new Set<WebSocket>();

wss.on("connection", (ws) => {
  wsClients.add(ws);
  ws.on("close", () => wsClients.delete(ws));
  ws.send(JSON.stringify({ type: "connected", timestamp: Date.now() }));
});

export function broadcastContentUpdate(module: string): void {
  const message = JSON.stringify({
    type: "content_updated",
    module,
    timestamp: Date.now(),
  });
  for (const client of wsClients) {
    if (client.readyState === WebSocket.OPEN) {
      client.send(message);
    }
  }
}

// Middleware
app.use(helmet());
app.use(
  cors({
    origin: process.env.CORS_ORIGIN?.split(",") ?? ["http://localhost:3000"],
    credentials: true,
  }),
);
app.use(express.json({ limit: "10mb" }));

const publicLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 120,
  standardHeaders: true,
  legacyHeaders: false,
});

const adminLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 60,
  standardHeaders: true,
  legacyHeaders: false,
});

// Health check
app.get("/health", async (_req, res) => {
  const dbOk = await healthCheck();
  res.status(dbOk ? 200 : 503).json({
    status: dbOk ? "healthy" : "degraded",
    database: dbOk,
    timestamp: new Date().toISOString(),
  });
});

// Public content APIs (mobile app)
const contentRouter = express.Router();
contentRouter.use(publicLimiter);
contentRouter.get("/home", getHomeContent);
contentRouter.get("/banners", getBanners);
contentRouter.get("/categories", getCategories);
contentRouter.get("/deals", getDeals);
contentRouter.get("/shop", getShop);
contentRouter.get("/promotions", getPromotions);
contentRouter.get("/mobile-assets", getMobileAssets);
contentRouter.post("/events", trackEvent);

app.use("/api/content", contentRouter);

// Admin APIs
app.use("/api/admin", adminLimiter, adminRouter);

// 404
app.use((_req, res) => {
  res.status(404).json({ error: "Not found" });
});

// Error handler
app.use(
  (
    err: Error,
    _req: express.Request,
    res: express.Response,
    _next: express.NextFunction,
  ) => {
    console.error("[error]", err);
    res.status(500).json({ error: "Internal server error" });
  },
);

initCloudinary();

server.listen(PORT, () => {
  console.log(`[cms-api] Running on http://localhost:${PORT}`);
  console.log(`[cms-api] Content API: http://localhost:${PORT}/api/content`);
  console.log(`[cms-api] Admin API: http://localhost:${PORT}/api/admin`);
  console.log(`[cms-api] WebSocket: ws://localhost:${PORT}/ws/content`);
});

export default app;
