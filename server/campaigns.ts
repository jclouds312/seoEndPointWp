
import type { Express } from "express";
import { db } from "./db";
import { campaigns, insertCampaignSchema } from "../shared/schema";
import { eq } from "drizzle-orm";

export function registerCampaignRoutes(app: Express) {
  // Get all campaigns
  app.get("/api/campaigns", async (req, res) => {
    try {
      const allCampaigns = await db.select().from(campaigns);
      res.json(allCampaigns);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch campaigns" });
    }
  });

  // Get single campaign
  app.get("/api/campaigns/:id", async (req, res) => {
    try {
      const campaign = await db
        .select()
        .from(campaigns)
        .where(eq(campaigns.id, parseInt(req.params.id)))
        .limit(1);
      
      if (campaign.length === 0) {
        return res.status(404).json({ error: "Campaign not found" });
      }
      
      res.json(campaign[0]);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch campaign" });
    }
  });

  // Create campaign
  app.post("/api/campaigns", async (req, res) => {
    try {
      const validatedData = insertCampaignSchema.parse(req.body);
      const newCampaign = await db.insert(campaigns).values(validatedData).returning();
      res.status(201).json(newCampaign[0]);
    } catch (error) {
      res.status(400).json({ error: "Invalid campaign data" });
    }
  });

  // Update campaign
  app.put("/api/campaigns/:id", async (req, res) => {
    try {
      const updated = await db
        .update(campaigns)
        .set({ ...req.body, updatedAt: new Date() })
        .where(eq(campaigns.id, parseInt(req.params.id)))
        .returning();
      
      if (updated.length === 0) {
        return res.status(404).json({ error: "Campaign not found" });
      }
      
      res.json(updated[0]);
    } catch (error) {
      res.status(400).json({ error: "Failed to update campaign" });
    }
  });

  // Delete campaign
  app.delete("/api/campaigns/:id", async (req, res) => {
    try {
      await db.delete(campaigns).where(eq(campaigns.id, parseInt(req.params.id)));
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: "Failed to delete campaign" });
    }
  });
}
