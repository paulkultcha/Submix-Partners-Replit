import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth } from "./auth";
import { insertPartnerSchema, insertPartnerWithPasswordSchema, insertCommissionSchema, insertCouponSchema } from "@shared/schema";
import { z } from "zod";
import { randomBytes } from "crypto";
import { scrypt, timingSafeEqual } from "crypto";
import { promisify } from "util";
import { commissionProcessor, ProcessCommissionParams } from "./commissionProcessor";

const scryptAsync = promisify(scrypt);

// Password utility functions
async function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const buf = (await scryptAsync(password, salt, 64)) as Buffer;
  return `${buf.toString("hex")}.${salt}`;
}

async function comparePasswords(supplied: string, stored: string) {
  if (!stored || typeof stored !== 'string') {
    console.error("Invalid stored password:", stored);
    return false;
  }
  
  const parts = stored.split(".");
  if (parts.length !== 2) {
    console.error("Invalid password format:", stored);
    return false;
  }
  
  const [hashed, salt] = parts;
  const hashedBuf = Buffer.from(hashed, "hex");
  const suppliedBuf = (await scryptAsync(supplied, salt, 64)) as Buffer;
  return timingSafeEqual(hashedBuf, suppliedBuf);
}

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
      // Use schema without referralCode since we generate it server-side
      const partnerSchema = insertPartnerSchema.omit({ referralCode: true });

      const partnerData = partnerSchema.parse(req.body);
      
      // Generate unique referral code
      const referralCode = randomBytes(8).toString('hex').toUpperCase();
      
      // Generate temporary password for admin-created partners
      const tempPassword = await hashPassword("temp_password_needs_reset");
      
      const finalPartnerData = {
        ...partnerData,
        referralCode,
        password: tempPassword,
      };
      
      console.log("Creating partner with data:", finalPartnerData);
      
      const partner = await storage.createPartner(finalPartnerData);
      
      res.status(201).json(partner);
    } catch (error) {
      if (error instanceof z.ZodError) {
        console.error("Validation error:", error.errors);
        res.status(400).json({ error: error.errors });
      } else {
        console.error("Partner creation error:", error);
        res.status(500).json({ error: "Failed to create partner" });
      }
    }
  });

  app.put("/api/partners/:id", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    try {
      const id = parseInt(req.params.id);
      console.log("Updating partner ID:", id, "with data:", req.body);
      
      // Validate the partner exists
      const existingPartner = await storage.getPartner(id);
      if (!existingPartner) {
        return res.status(404).json({ error: "Partner not found" });
      }
      
      const partner = await storage.updatePartner(id, req.body);
      console.log("Partner updated successfully:", partner);
      res.json(partner);
    } catch (error) {
      console.error("Partner update error:", error);
      res.status(500).json({ error: "Failed to update partner" });
    }
  });

  app.delete("/api/partners/:id", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    try {
      const id = parseInt(req.params.id);
      console.log("Deleting partner ID:", id);
      
      // Validate the partner exists
      const existingPartner = await storage.getPartner(id);
      if (!existingPartner) {
        return res.status(404).json({ error: "Partner not found" });
      }
      
      await storage.deletePartner(id);
      console.log("Partner deleted successfully:", id);
      res.sendStatus(204);
    } catch (error) {
      console.error("Partner deletion error:", error);
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
        console.error("Coupon validation error:", error.errors);
        res.status(400).json({ error: error.errors });
      } else {
        console.error("Coupon creation error:", error);
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

      // Check if partner is approved (not pending)
      if (partner.status !== "active") {
        return res.status(400).json({ error: "Partner is not approved for commission tracking" });
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

      // Use the new commission processor
      const result = await commissionProcessor.processCommission({
        partnerId: partner.id,
        orderId,
        customerEmail,
        orderValue,
        couponCode,
        couponDiscount,
      });

      // Update partner stats
      await storage.updatePartner(partner.id, {
        conversionCount: partner.conversionCount + 1,
        totalRevenue: (Number(partner.totalRevenue) + orderValue).toString(),
        totalCommissions: result.shouldPay 
          ? (Number(partner.totalCommissions) + result.commission.commissionAmount).toString()
          : partner.totalCommissions,
      });

      res.json({ 
        success: true,
        commission: result.commission,
        shouldPay: result.shouldPay,
        reason: result.reason
      });
    } catch (error) {
      res.status(500).json({ error: "Failed to process conversion" });
    }
  });

  // Partner authentication routes
  app.post("/api/partner/register", async (req, res) => {
    try {
      const { name, email, password } = req.body;
      
      // Check if partner already exists
      const existingPartner = await storage.getPartnerByEmail(email);
      if (existingPartner) {
        return res.status(400).json({ error: "Partner already exists" });
      }
      
      // Hash password
      const hashedPassword = await hashPassword(password);
      
      // Generate unique referral code
      const referralCode = randomBytes(8).toString('hex').toUpperCase();
      
      // Create partner with default settings (pending status for self-registration)
      const partner = await storage.createPartner({
        name,
        email,
        password: hashedPassword,
        referralCode,
        commissionRate: "5", // Default 5% commission
        commissionType: "percentage",
        status: "pending", // Self-registered partners need admin approval
        clickCount: 0,
        conversionCount: 0,
        totalRevenue: "0",
        totalCommissions: "0",
        companyName: req.body.companyName || null,
        website: req.body.website || null,
        newCustomersOnly: false,
        commissionPeriodMonths: 12,
        requireCouponUsage: false,
      });
      
      // Set up partner session
      req.session.partnerId = partner.id;
      
      // Remove password from response
      const { password: _, ...partnerWithoutPassword } = partner;
      res.json(partnerWithoutPassword);
    } catch (error) {
      console.error("Partner registration error:", error);
      res.status(500).json({ error: "Failed to register partner" });
    }
  });

  app.post("/api/partner/login", async (req, res) => {
    try {
      const { email, password } = req.body;
      
      const partner = await storage.getPartnerByEmail(email);
      if (!partner) {
        return res.status(401).json({ error: "Invalid credentials" });
      }
      
      // Check password with hash comparison
      const isPasswordValid = await comparePasswords(password, partner.password);
      if (!isPasswordValid) {
        return res.status(401).json({ error: "Invalid credentials" });
      }
      
      // Set up partner session
      req.session.partnerId = partner.id;
      
      // Remove password from response
      const { password: _, ...partnerWithoutPassword } = partner;
      res.json(partnerWithoutPassword);
    } catch (error) {
      console.error("Partner login error:", error);
      res.status(500).json({ error: "Failed to login" });
    }
  });

  app.post("/api/partner/logout", async (req, res) => {
    req.session.partnerId = null;
    res.json({ success: true });
  });

  // Password reset routes
  app.post("/api/partner/forgot-password", async (req, res) => {
    try {
      const { email } = req.body;
      
      const partner = await storage.getPartnerByEmail(email);
      if (!partner) {
        // For security, don't reveal if email exists or not
        return res.json({ success: true, message: "If that email exists, we've sent a reset link." });
      }
      
      // Generate reset token
      const resetToken = randomBytes(32).toString('hex');
      const resetTokenExpiry = new Date(Date.now() + 3600000); // 1 hour
      
      // Store reset token (in production, you'd update the partner record)
      // For now, we'll use a simple in-memory store
      if (!global.passwordResetTokens) {
        global.passwordResetTokens = new Map();
      }
      global.passwordResetTokens.set(resetToken, {
        email: partner.email,
        expiresAt: resetTokenExpiry,
      });
      
      // In production, you'd send an email with the reset link
      // For demo purposes, we'll just log it
      console.log(`Password reset link for ${email}: /partner/auth?reset=${resetToken}`);
      
      res.json({ success: true, message: "If that email exists, we've sent a reset link." });
    } catch (error) {
      console.error("Forgot password error:", error);
      res.status(500).json({ error: "Failed to process password reset request" });
    }
  });

  app.post("/api/partner/reset-password", async (req, res) => {
    try {
      const { token, newPassword } = req.body;
      
      if (!global.passwordResetTokens || !global.passwordResetTokens.has(token)) {
        return res.status(400).json({ error: "Invalid or expired reset token" });
      }
      
      const tokenData = global.passwordResetTokens.get(token);
      
      // Check if token is expired
      if (new Date() > tokenData.expiresAt) {
        global.passwordResetTokens.delete(token);
        return res.status(400).json({ error: "Reset token has expired" });
      }
      
      // Find partner and update password
      const partner = await storage.getPartnerByEmail(tokenData.email);
      if (!partner) {
        return res.status(404).json({ error: "Partner not found" });
      }
      
      // Hash new password
      const hashedPassword = await hashPassword(newPassword);
      
      // Update partner password
      await storage.updatePartner(partner.id, {
        password: hashedPassword,
      });
      
      // Delete the used token
      global.passwordResetTokens.delete(token);
      
      res.json({ success: true, message: "Password reset successfully" });
    } catch (error) {
      console.error("Reset password error:", error);
      res.status(500).json({ error: "Failed to reset password" });
    }
  });

  app.get("/api/partner/me", async (req, res) => {
    try {
      if (!req.session.partnerId) {
        return res.status(401).json({ error: "Unauthorized" });
      }
      
      const partner = await storage.getPartner(req.session.partnerId);
      if (!partner) {
        return res.status(404).json({ error: "Partner not found" });
      }
      
      // Remove password from response
      const { password: _, ...partnerWithoutPassword } = partner;
      res.json(partnerWithoutPassword);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch partner data" });
    }
  });

  app.get("/api/partner/commissions", async (req, res) => {
    try {
      if (!req.session.partnerId) {
        return res.status(401).json({ error: "Unauthorized" });
      }
      
      const commissions = await storage.getCommissionsByPartner(req.session.partnerId);
      res.json(commissions);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch commissions" });
    }
  });

  app.get("/api/partner/clicks", async (req, res) => {
    try {
      if (!req.session.partnerId) {
        return res.status(401).json({ error: "Unauthorized" });
      }
      
      const clicks = await storage.getClicksByPartner(req.session.partnerId);
      res.json(clicks);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch clicks" });
    }
  });

  app.get("/api/partner/payouts", async (req, res) => {
    try {
      if (!req.session.partnerId) {
        return res.status(401).json({ error: "Unauthorized" });
      }
      
      const payouts = await storage.getPayoutsByPartner(req.session.partnerId);
      res.json(payouts);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch payouts" });
    }
  });

  // User management routes
  app.get("/api/users", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    try {
      const users = await storage.getAllUsers();
      res.json(users);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch users" });
    }
  });

  app.post("/api/users", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    try {
      const { username, email, password, role } = req.body;
      
      if (!username || !password) {
        return res.status(400).json({ error: "Username and password are required" });
      }

      const hashedPassword = await hashPassword(password);
      
      const user = await storage.createUser({
        username,
        email: email || null,
        password: hashedPassword,
        role: role || "admin",
      });

      res.status(201).json(user);
    } catch (error) {
      res.status(500).json({ error: "Failed to create user" });
    }
  });

  app.put("/api/users/:id", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    try {
      const { id } = req.params;
      const { username, email, password, role } = req.body;
      
      if (!username) {
        return res.status(400).json({ error: "Username is required" });
      }

      const updateData: any = {
        username,
        email: email || null,
        role: role || "admin",
      };

      if (password) {
        updateData.password = await hashPassword(password);
      }

      const user = await storage.updateUser(parseInt(id), updateData);
      res.json(user);
    } catch (error) {
      res.status(500).json({ error: "Failed to update user" });
    }
  });

  app.delete("/api/users/:id", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    try {
      const { id } = req.params;
      await storage.deleteUser(parseInt(id));
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: "Failed to delete user" });
    }
  });

  // Forgot password endpoint
  app.post("/api/auth/forgot-password", async (req, res) => {
    try {
      const { email } = req.body;
      
      if (!email) {
        return res.status(400).json({ error: "Email is required" });
      }

      const user = await storage.getUserByEmail(email);
      if (!user) {
        // Don't reveal if user exists or not for security
        return res.json({ message: "If the email exists, a reset link has been sent" });
      }

      // Generate reset token
      const token = randomBytes(32).toString("hex");
      const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

      await storage.createPasswordResetToken({
        userId: user.id,
        token,
        expiresAt,
        used: false,
      });

      // In a real application, you would send an email here
      console.log(`Password reset token for ${email}: ${token}`);
      
      res.json({ message: "Password reset email sent" });
    } catch (error) {
      console.error("Forgot password error:", error);
      res.status(500).json({ error: "Failed to process password reset request" });
    }
  });

  // Reset password endpoint
  app.post("/api/auth/reset-password", async (req, res) => {
    try {
      const { token, password } = req.body;
      
      if (!token || !password) {
        return res.status(400).json({ error: "Token and password are required" });
      }

      if (password.length < 6) {
        return res.status(400).json({ error: "Password must be at least 6 characters" });
      }

      const resetToken = await storage.getPasswordResetToken(token);
      if (!resetToken) {
        return res.status(400).json({ error: "Invalid reset token" });
      }

      if (resetToken.used) {
        return res.status(400).json({ error: "Reset token has already been used" });
      }

      if (resetToken.expiresAt < new Date()) {
        return res.status(400).json({ error: "Reset token has expired" });
      }

      // Hash the new password
      const hashedPassword = await hashPassword(password);

      // Update user password
      await storage.updateUser(resetToken.userId, { password: hashedPassword });

      // Mark token as used
      await storage.markPasswordResetTokenUsed(resetToken.id);

      res.json({ message: "Password reset successful" });
    } catch (error) {
      console.error("Reset password error:", error);
      res.status(500).json({ error: "Failed to reset password" });
    }
  });

  // Add reset password button to admin interface
  app.post("/api/auth/admin-reset-password", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    try {
      const { userId } = req.body;
      
      if (!userId) {
        return res.status(400).json({ error: "User ID is required" });
      }

      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }

      // Generate reset token
      const token = randomBytes(32).toString("hex");
      const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

      await storage.createPasswordResetToken({
        userId: user.id,
        token,
        expiresAt,
        used: false,
      });

      // In a real application, you would send an email here
      console.log(`Admin generated password reset token for ${user.email}: ${token}`);
      
      res.json({ message: "Password reset token generated", token });
    } catch (error) {
      console.error("Admin reset password error:", error);
      res.status(500).json({ error: "Failed to generate password reset token" });
    }
  });

  // Fraud Detection API Routes
  app.get("/api/fraud/alerts", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    try {
      const alerts = await storage.getAllFraudAlerts();
      res.json(alerts);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch fraud alerts" });
    }
  });

  app.get("/api/fraud/alerts/:id", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    try {
      const alert = await storage.getFraudAlert(parseInt(req.params.id));
      if (!alert) {
        return res.status(404).json({ error: "Alert not found" });
      }
      res.json(alert);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch fraud alert" });
    }
  });

  app.post("/api/fraud/alerts", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    try {
      console.log("Creating fraud alert with data:", req.body);
      const alert = await storage.createFraudAlert(req.body);
      res.json(alert);
    } catch (error) {
      console.error("Create fraud alert error:", error);
      res.status(500).json({ error: "Failed to create fraud alert" });
    }
  });

  app.put("/api/fraud/alerts/:id", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    try {
      const alert = await storage.updateFraudAlert(parseInt(req.params.id), req.body);
      res.json(alert);
    } catch (error) {
      res.status(500).json({ error: "Failed to update fraud alert" });
    }
  });

  app.get("/api/fraud/rules", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    try {
      const rules = await storage.getAllFraudRules();
      res.json(rules);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch fraud rules" });
    }
  });

  app.post("/api/fraud/rules", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    try {
      console.log("Creating fraud rule with data:", req.body);
      const rule = await storage.createFraudRule(req.body);
      res.json(rule);
    } catch (error) {
      console.error("Create fraud rule error:", error);
      res.status(500).json({ error: "Failed to create fraud rule" });
    }
  });

  app.put("/api/fraud/rules/:id", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    try {
      const rule = await storage.updateFraudRule(parseInt(req.params.id), req.body);
      res.json(rule);
    } catch (error) {
      res.status(500).json({ error: "Failed to update fraud rule" });
    }
  });

  // GDPR Compliance API Routes
  app.get("/api/gdpr/consents", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    try {
      const consents = await storage.getAllGdprConsents();
      res.json(consents);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch GDPR consents" });
    }
  });

  app.post("/api/gdpr/consents", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    try {
      const consent = await storage.createGdprConsent(req.body);
      res.json(consent);
    } catch (error) {
      res.status(500).json({ error: "Failed to create GDPR consent" });
    }
  });

  app.get("/api/gdpr/data-requests", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    try {
      const requests = await storage.getAllDataRequests();
      res.json(requests);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch data requests" });
    }
  });

  app.post("/api/gdpr/data-requests", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    try {
      const request = await storage.createDataRequest(req.body);
      res.json(request);
    } catch (error) {
      res.status(500).json({ error: "Failed to create data request" });
    }
  });

  app.put("/api/gdpr/data-requests/:id", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    try {
      const request = await storage.updateDataRequest(parseInt(req.params.id), req.body);
      res.json(request);
    } catch (error) {
      res.status(500).json({ error: "Failed to update data request" });
    }
  });

  app.get("/api/gdpr/retention-policies", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    try {
      const policies = await storage.getAllDataRetentionPolicies();
      res.json(policies);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch retention policies" });
    }
  });

  app.post("/api/gdpr/retention-policies", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    try {
      const policy = await storage.createDataRetentionPolicy(req.body);
      res.json(policy);
    } catch (error) {
      res.status(500).json({ error: "Failed to create retention policy" });
    }
  });

  app.put("/api/gdpr/retention-policies/:id", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    try {
      const policy = await storage.updateDataRetentionPolicy(parseInt(req.params.id), req.body);
      res.json(policy);
    } catch (error) {
      res.status(500).json({ error: "Failed to update retention policy" });
    }
  });

  // Audit Trail API Routes
  app.get("/api/audit/logs", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    try {
      const logs = await storage.getAllAuditLogs();
      res.json(logs);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch audit logs" });
    }
  });

  app.get("/api/audit/logs/user/:userId", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    try {
      const logs = await storage.getAuditLogsByUser(parseInt(req.params.userId));
      res.json(logs);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch audit logs for user" });
    }
  });

  app.get("/api/audit/logs/partner/:partnerId", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    try {
      const logs = await storage.getAuditLogsByPartner(parseInt(req.params.partnerId));
      res.json(logs);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch audit logs for partner" });
    }
  });

  app.get("/api/audit/system-events", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    try {
      const events = await storage.getAllSystemEvents();
      res.json(events);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch system events" });
    }
  });

  app.post("/api/audit/logs", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    try {
      const logData = {
        ...req.body,
        ipAddress: req.ip,
        userAgent: req.get('User-Agent'),
      };
      const log = await storage.createAuditLog(logData);
      res.json(log);
    } catch (error) {
      res.status(500).json({ error: "Failed to create audit log" });
    }
  });

  app.post("/api/audit/system-events", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    try {
      const event = await storage.createSystemEvent(req.body);
      res.json(event);
    } catch (error) {
      res.status(500).json({ error: "Failed to create system event" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
