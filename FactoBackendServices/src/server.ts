import winston from "winston";
import './config/module-alias';
import http from "http";
import express from "express";
import app from "@/app";
import { configDotenv } from "dotenv";
import path from "path";

configDotenv({ path: path.join(__dirname, '../../.env') })
const { combine, timestamp, printf, colorize, align } = winston.format;

interface LoggerConfig {
  level: string;
  format: winston.Logform.Format;
  transports: winston.transports.ConsoleTransportInstance[];
}

const logger: winston.Logger = winston.createLogger({
  level: 'info',
  format: combine(
    colorize({ all: true }),
    timestamp({
      format: 'YYYY-MM-DD hh:mm:ss.SSS A',
    }),
    align(),
    printf((info): string => `[${info.timestamp}] ${info.level}: ${info.message}`)
  ),
  transports: [new winston.transports.Console()],
} as LoggerConfig);

const server: http.Server = http.createServer(app);

// Render sets PORT environment variable automatically
const port = process.env.PORT || app.get("port") || 8080;
// Must bind to 0.0.0.0 for Render to detect the port
const host = '0.0.0.0';

server.listen(port, host, (): void => {
  logger.info(
    `✅ Server is running at http://${host}:${port} in ${process.env.NODE_ENV || app.get("dev")} mode`
  );
  logger.info(`✅ Server listening on ${host}:${port}`);
  logger.info(`✅ PORT from environment: ${process.env.PORT || 'not set, using default'}`);
  logger.info("  Press CTRL-C to stop");
});

function shutDown(): void {
  logger.info("Received kill signal, shutting down gracefully");
  logger.info("Shutting down schedulers gracefully");

  server.close((): void => {
    logger.info("Closed out remaining connections");
    process.exit(0);
  });
}

process.on("SIGTERM", shutDown);
process.on("SIGINT", shutDown);

export { server, logger };