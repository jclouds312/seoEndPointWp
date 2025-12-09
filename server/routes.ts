import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupVite, serveStatic, log } from "./vite";
import { insertUser, getUser, getUserByUsername } from "../shared/db";
import { db } from "../shared/db";
import { generatedContent, campaigns, dataSources } from "../shared/schema";
import { eq } from "drizzle-orm";
import { hashPassword, verifyPassword } from "./auth";
import { publishToWordPress, testWordPressConnection } from "./wordpress-api";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  // put application routes here
  // prefix all routes with /api

  // use storage to perform CRUD operations on the storage interface
  // e.g. storage.insertUser(user) or storage.getUserByUsername(username)

  // Health check endpoint
  app.get("/api/health", (_req, res) => {
    res.json({ status: "ok" });
  });

  // WordPress publishing endpoints
  app.post("/api/wordpress/publish", publishToWordPress);
  app.post("/api/wordpress/test-connection", testWordPressConnection);

  return httpServer;
}