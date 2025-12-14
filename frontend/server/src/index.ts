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
  origin: true, // <--- TRUST ME, CHANGE TO 'true' FOR NOW to rule out string parsing errors
  credentials: true,
  methods: ["GET", "POST", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "x-migration-secret"], // Added your migration secret header just in case
  optionsSuccessStatus: 204
};


app.use(cors(corsOptions)); // <--- CORS FIRST, always first
app.options("*", cors(corsOptions)); // <--- Handle Preflight explicitly
app.use(express.json());


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
