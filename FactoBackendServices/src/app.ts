import * as dotenv from "dotenv";
import compression from "compression";
import cors from "cors";
import express, { Express, Request, Response, NextFunction } from "express";
import httpContext from "express-http-context";
import path from "path";

// Import type definitions for custom middleware and error handlers
import { RequestHandler, ErrorRequestHandler } from "./types/middleware.js";
// import notFound from "./errors/notFound.js";
import errorHandlerMiddleware from "@/middlewares/errorHandler";
// import {
// generateRequestId,

// } from "./middlewares/commonMiddleware.js";
import { connectDB } from "@/config/db";
import notFound from "@/errors/notFound";
import {
  generateRequestId,
  logRequest,
  logResponse,
} from "@/middlewares/commonMiddleware";
import router from "@/routes";
// import { connectDB } from "./config/db.js";

// Define CORS options with explicit typing
const corsOptions: cors.CorsOptions = {
  origin: [
    "http://localhost:3000",
    "http://localhost:5173", 
    "http://localhost:8080",
    "https://admin.facto.org.in",
    "https://facto.org.in",
    // Vercel deployment domains
    /^https:\/\/.*\.vercel\.app$/,
    /^https:\/\/.*-factouserwebapps-projects\.vercel\.app$/,
    // Netlify deployment domains (if used)
    /^https:\/\/.*\.netlify\.app$/,
    process.env.CORS_ORIGIN || "*"
  ],
  methods: ["GET", "HEAD", "PUT", "PATCH", "POST", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
  credentials: true,
  preflightContinue: false,
  optionsSuccessStatus: 204,
};

// Load environment variables (only if .env exists, Render uses env vars directly)
try {
  dotenv.config({ path: path.join(__dirname, '../.env') });
} catch (error) {
  // .env file not found, using environment variables from Render
  console.log('Using environment variables from system');
}

// Create Express application
const app: Express = express();

connectDB();

// Express configuration
app.set("port", process.env.PORT || 8080);
app.set("dev", process.env.NODE_ENV || "development");

// Middleware configuration
app.use(compression());
app.use(express.json({ limit: "2gb" }));
app.use(express.urlencoded({ extended: true, limit: "2gb" }));

// CORS configuration
app.use(cors(corsOptions));

// Additional CORS handling for preflight requests
app.options("*", cors(corsOptions));

// Add CORS headers manually as backup
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", req.headers.origin || "*");
  res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization");
  res.header("Access-Control-Allow-Credentials", "true");
  
  if (req.method === "OPTIONS") {
    res.sendStatus(200);
  } else {
    next();
  }
});

app.use(httpContext.middleware as unknown as RequestHandler);
app.use(generateRequestId as RequestHandler);

// Request logging middleware
app.use(logRequest as RequestHandler);
app.use(logResponse as RequestHandler);

app.get("/", (_req: Request, res: Response) => {
  res.send("Facto API Server");
});

// Health check endpoint
app.get("/health", (_req: Request, res: Response) => {
  res.status(200).json({
    status: "OK",
    message: "Facto API Server is running",
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

app.use(router);

// Error handling middleware
app.use(notFound as RequestHandler);
app.use(errorHandlerMiddleware as ErrorRequestHandler);

export default app;
