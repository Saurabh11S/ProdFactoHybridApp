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
// Automatically detects environment (development vs production)
const getCorsOrigins = (): (string | RegExp)[] => {
  const nodeEnv = process.env.NODE_ENV || '';
  const isProduction = nodeEnv === 'production' || nodeEnv === 'prod';
  
  if (isProduction) {
    // Production: Only allow specific domains
    const origins: (string | RegExp)[] = [
      // Vercel deployment domains (allow all vercel.app subdomains)
      /^https:\/\/.*\.vercel\.app$/,
      // Custom domain facto.org.in (with and without www)
      /^https:\/\/(www\.)?facto\.org\.in$/,
      // Capacitor mobile app origins (for Android/iOS apps)
      'https://localhost',
      'capacitor://localhost',
      'ionic://localhost',
      /^https:\/\/localhost/,
      /^capacitor:\/\/localhost/,
      /^ionic:\/\/localhost/,
      /^file:\/\//,  // File protocol for some Capacitor configs
    ];
    
    // Add custom production domains from CORS_ORIGIN env var
    if (process.env.CORS_ORIGIN) {
      const customOrigins = process.env.CORS_ORIGIN.split(',').map(origin => origin.trim()).filter(origin => origin);
      origins.push(...customOrigins);
    }
    
    return origins;
  } else {
    // Development: Allow all localhost ports and Capacitor origins
    return [
      "http://localhost:3000",
      "http://localhost:5173",  // User Web App default port
      "http://localhost:5174",  // Admin App default port (if 5173 is taken)
      "http://localhost:5175",  // Additional Vite port
      "http://localhost:8080",  // Backend port
      /^http:\/\/localhost:\d+$/,  // Allow all localhost ports
      // Capacitor mobile app origins
      'https://localhost',
      'capacitor://localhost',
      'ionic://localhost',
      /^https:\/\/localhost/,
      /^capacitor:\/\/localhost/,
      /^ionic:\/\/localhost/,
      /^file:\/\//,  // File protocol for some Capacitor configs
    ];
  }
};

const corsOptions: cors.CorsOptions = {
  origin: getCorsOrigins(),
  methods: ["GET", "HEAD", "PUT", "PATCH", "POST", "DELETE", "OPTIONS"],
  allowedHeaders: [
    "Content-Type", 
    "Authorization", 
    "X-Requested-With",
    "Cache-Control",
    "Pragma",
    "Expires"
  ],
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
  const origin = req.headers.origin;
  const nodeEnv = process.env.NODE_ENV || '';
  const isProduction = nodeEnv === 'production' || nodeEnv === 'prod';
  
  // Determine allowed origin
  let allowedOrigin = '*';
  if (isProduction && origin) {
    // Check if origin matches Vercel pattern
    if (origin.match(/^https:\/\/.*\.vercel\.app$/)) {
      allowedOrigin = origin;
    } else if (origin.match(/^https:\/\/(www\.)?facto\.org\.in$/)) {
      // Check if origin matches custom domain facto.org.in
      allowedOrigin = origin;
    } else if (origin === 'https://localhost' || 
               origin === 'capacitor://localhost' || 
               origin === 'ionic://localhost' ||
               origin.match(/^https:\/\/localhost/) ||
               origin.match(/^capacitor:\/\/localhost/) ||
               origin.match(/^ionic:\/\/localhost/) ||
               origin.match(/^file:\/\//)) {
      // Allow Capacitor mobile app origins
      allowedOrigin = origin;
    } else if (process.env.CORS_ORIGIN) {
      // Check if origin is in CORS_ORIGIN list
      const allowedOrigins = process.env.CORS_ORIGIN.split(',').map(o => o.trim());
      if (allowedOrigins.includes(origin)) {
        allowedOrigin = origin;
      }
    }
  } else if (!isProduction) {
    // Development: allow any localhost and Capacitor origins
    if (origin && (
      origin.includes('localhost') || 
      origin.startsWith('capacitor://') || 
      origin.startsWith('ionic://') ||
      origin.startsWith('file://')
    )) {
      allowedOrigin = origin;
    } else {
      allowedOrigin = origin || '*';
    }
  }
  
  res.header("Access-Control-Allow-Origin", allowedOrigin);
  res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS, PATCH");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization, Cache-Control, Pragma, Expires");
  res.header("Access-Control-Allow-Credentials", "true");
  res.header("Access-Control-Expose-Headers", "Content-Length, Content-Type");
  
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
