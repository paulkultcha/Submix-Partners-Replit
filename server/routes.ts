import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth } from "./auth";
import { insertPartnerSchema, insertCommissionSchema, insertCouponSchema } from "@shared/schema";
import { z } from "zod";
import { randomBytes } from "crypto";

export async function registerRoutes(app: Express): Promise<Server> {
  setupAuth(app);

  // Partner routes
  app.get("/api/partners", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    try {
      const partners = await storage.getAllPartners();
      res.json(partners);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch partners" });
    }
  });

  app.post("/api/partners", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    try {
      const partnerData = insertPartnerSchema.parse(req.body);
      
      // Generate unique referral code
      const referralCode = randomBytes(8).toString('hex').toUpperCase();
      
      const partner = await storage.createPartner({
        ...partnerData,
        referralCode,
      });
      
      res.status(201).json(partner);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ error: error.errors });
      } else {
        res.status(500).json({ error: "Failed to create partner" });
      }
    }
  });

  app.put("/api/partners/:id", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    try {
      const id = parseInt(req.params.id);
      const partner = await storage.updatePartner(id, req.body);
      res.json(partner);
    } catch (error) {
      res.status(500).json({ error: "Failed to update partner" });
    }
  });

  app.delete("/api/partners/:id", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    try {
      const id = parseInt(req.params.id);
      await storage.deletePartner(id);
      res.sendStatus(204);
    } catch (error) {
      res.status(500).json({ error: "Failed to delete partner" });
    }
  });

  // Commission routes
  app.get("/api/commissions", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    try {
      const commissions = await storage.getAllCommissions();
      res.json(commissions);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch commissions" });
    }
  });

  app.post("/api/commissions", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    try {
      const commissionData = insertCommissionSchema.parse(req.body);
      const commission = await storage.createCommission(commissionData);
      res.status(201).json(commission);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ error: error.errors });
      } else {
        res.status(500).json({ error: "Failed to create commission" });
      }
    }
  });

  app.put("/api/commissions/:id", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    try {
      const id = parseInt(req.params.id);
      const commission = await storage.updateCommission(id, req.body);
      res.json(commission);
    } catch (error) {
      res.status(500).json({ error: "Failed to update commission" });
    }
  });

  // Coupon routes
  app.get("/api/coupons", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    try {
      const coupons = await storage.getAllCoupons();
      res.json(coupons);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch coupons" });
    }
  });

  app.post("/api/coupons", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    try {
      const couponData = insertCouponSchema.parse(req.body);
      const coupon = await storage.createCoupon(couponData);
      res.status(201).json(coupon);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ error: error.errors });
      } else {
        res.status(500).json({ error: "Failed to create coupon" });
      }
    }
  });

  app.put("/api/coupons/:id", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    try {
      const id = parseInt(req.params.id);
      const coupon = await storage.updateCoupon(id, req.body);
      res.json(coupon);
    } catch (error) {
      res.status(500).json({ error: "Failed to update coupon" });
    }
  });

  app.delete("/api/coupons/:id", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    try {
      const id = parseInt(req.params.id);
      await storage.deleteCoupon(id);
      res.sendStatus(204);
    } catch (error) {
      res.status(500).json({ error: "Failed to delete coupon" });
    }
  });

  // Payout routes
  app.get("/api/payouts", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    try {
      const payouts = await storage.getAllPayouts();
      res.json(payouts);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch payouts" });
    }
  });

  // Analytics routes
  app.get("/api/analytics/dashboard", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    try {
      const stats = await storage.getDashboardStats();
      res.json(stats);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch dashboard stats" });
    }
  });

  app.get("/api/analytics/top-partners", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    try {
      const limit = parseInt(req.query.limit as string) || 5;
      const topPartners = await storage.getTopPartners(limit);
      res.json(topPartners);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch top partners" });
    }
  });

  app.get("/api/analytics/revenue", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    try {
      const months = parseInt(req.query.months as string) || 6;
      const revenue = await storage.getRevenueByMonth(months);
      res.json(revenue);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch revenue data" });
    }
  });

  // Public referral tracking endpoint
  app.get("/api/track/:referralCode", async (req, res) => {
    try {
      const { referralCode } = req.params;
      const partner = await storage.getPartnerByReferralCode(referralCode);
      
      if (!partner) {
        return res.status(404).json({ error: "Invalid referral code" });
      }

      // Track the click
      await storage.createClick({
        partnerId: partner.id,
        ipAddress: req.ip || "",
        userAgent: req.get("User-Agent") || "",
        referrer: req.get("Referer") || "",
      });

      // Redirect to Submix.io
      res.redirect("https://www.submix.io/auth/signup");
    } catch (error) {
      res.status(500).json({ error: "Failed to track referral" });
    }
  });

  // Webhook endpoint for processing conversions
  app.post("/api/webhook/conversion", async (req, res) => {
    try {
      const { orderId, customerEmail, orderValue, referralCode, couponCode } = req.body;
      
      if (!orderId || !customerEmail || !orderValue || !referralCode) {
        return res.status(400).json({ error: "Missing required fields" });
      }

      const partner = await storage.getPartnerByReferralCode(referralCode);
      if (!partner) {
        return res.status(404).json({ error: "Partner not found" });
      }

      let couponDiscount = 0;
      if (couponCode) {
        const coupon = await storage.getCouponByCode(couponCode);
        if (coupon && coupon.partnerId === partner.id) {
          if (coupon.discountType === "percentage") {
            couponDiscount = (orderValue * Number(coupon.discountValue)) / 100;
          } else {
            couponDiscount = Number(coupon.discountValue);
          }
          
          // Update coupon usage
          await storage.updateCoupon(coupon.id, {
            usageCount: coupon.usageCount + 1,
          });
        }
      }

      // Calculate commission
      const commissionRate = Number(partner.commissionRate);
      const commissionAmount = (orderValue * commissionRate) / 100;

      // Create commission record
      await storage.createCommission({
        partnerId: partner.id,
        orderId,
        customerEmail,
        orderValue: orderValue.toString(),
        commissionAmount: commissionAmount.toString(),
        commissionRate: commissionRate.toString(),
        couponCode: couponCode || null,
        couponDiscount: couponDiscount.toString(),
        status: "approved",
      });

      // Update partner stats
      await storage.updatePartner(partner.id, {
        conversionCount: partner.conversionCount + 1,
        totalRevenue: (Number(partner.totalRevenue) + orderValue).toString(),
        totalCommissions: (Number(partner.totalCommissions) + commissionAmount).toString(),
      });

      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to process conversion" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
