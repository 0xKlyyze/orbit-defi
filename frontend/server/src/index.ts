import express from "express";
import cors from "cors";
import pino from "pino";
import dotenv from "dotenv";
import path from "path";
import { Router } from "express";
import { dashboardRouter } from "./routes/dashboard";

// Load environment variables from multiple common locations to avoid misconfiguration
// Priority: explicit API_ENV_PATH -> server/.env -> project root .env
if (process.env.API_ENV_PATH) {
  dotenv.config({ path: process.env.API_ENV_PATH });
}
// Attempt to load frontend/server/.env
dotenv.config({ path: path.resolve(process.cwd(), "server/.env") });
// Fallback to frontend/.env
dotenv.config();
const logger = pino({ level: process.env.LOG_LEVEL || "info" });
const app = express();

app.use(express.json());
const allowedOrigins = (process.env.CORS_ORIGINS || "http://localhost:3000,https://orbit-defi.netlify.app")
  .split(",")
  .map((o) => o.trim())
  .filter(Boolean);

const corsOptions: cors.CorsOptions = {
  origin: (origin, callback) => {
    if (!origin) return callback(null, false);
    if (allowedOrigins.includes(origin)) return callback(null, true);
    return callback(null, false);
  },
  credentials: true,
  methods: ["GET", "POST", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  optionsSuccessStatus: 204
};

app.use(cors(corsOptions));
app.options("*", cors(corsOptions));

const api = Router();
api.get("/", (_req, res) => res.json({ message: "Orbit DeFi Dashboard API", status: "running" }));
api.get("/health", (_req, res) => res.json({ status: "healthy", service: "orbit-api" }));
app.use("/api", api);
app.use("/api", dashboardRouter);

// Prefer App Engine provided PORT, fallback to API_PORT or 4000
const port = Number(process.env.PORT || process.env.API_PORT || 4000);
app.listen(port, () => {
  logger.info(`Orbit API listening on http://localhost:${port}/api`);
});
