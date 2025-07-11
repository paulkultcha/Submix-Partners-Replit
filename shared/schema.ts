import { pgTable, text, serial, integer, boolean, timestamp, numeric, uuid, unique } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  role: text("role").notNull().default("admin"), // admin, partner
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const partners = pgTable("partners", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  companyName: text("company_name"),
  website: text("website"),
  status: text("status").notNull().default("active"), // active, pending, inactive
  commissionRate: numeric("commission_rate", { precision: 5, scale: 2 }).notNull(), // percentage
  commissionType: text("commission_type").notNull().default("percentage"), // percentage, fixed
  payoutMethod: text("payout_method").notNull().default("paypal"), // paypal, stripe, manual
  payoutDetails: text("payout_details"), // JSON string for payout info
  referralCode: text("referral_code").notNull().unique(),
  clickCount: integer("click_count").default(0).notNull(),
  conversionCount: integer("conversion_count").default(0).notNull(),
  totalRevenue: numeric("total_revenue", { precision: 10, scale: 2 }).default("0").notNull(),
  totalCommissions: numeric("total_commissions", { precision: 10, scale: 2 }).default("0").notNull(),
  // New commission model fields
  newCustomersOnly: boolean("new_customers_only").default(false).notNull(), // Only pay for new customers
  commissionPeriodMonths: integer("commission_period_months").default(12).notNull(), // How many months to pay commissions
  requireCouponUsage: boolean("require_coupon_usage").default(false).notNull(), // Only pay after coupon value is used
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const commissions = pgTable("commissions", {
  id: serial("id").primaryKey(),
  partnerId: integer("partner_id").references(() => partners.id).notNull(),
  orderId: text("order_id").notNull(),
  customerEmail: text("customer_email").notNull(),
  orderValue: numeric("order_value", { precision: 10, scale: 2 }).notNull(),
  commissionAmount: numeric("commission_amount", { precision: 10, scale: 2 }).notNull(),
  commissionRate: numeric("commission_rate", { precision: 5, scale: 2 }).notNull(),
  couponCode: text("coupon_code"),
  couponDiscount: numeric("coupon_discount", { precision: 10, scale: 2 }).default("0").notNull(),
  status: text("status").notNull().default("pending"), // pending, approved, paid, refunded, blocked
  payoutId: integer("payout_id"),
  // New commission model fields
  isNewCustomer: boolean("is_new_customer").default(true).notNull(), // Track if customer is new
  customerFirstOrderDate: timestamp("customer_first_order_date"), // When customer first ordered
  commissionValidUntil: timestamp("commission_valid_until"), // When commission period expires
  couponValueUsed: numeric("coupon_value_used", { precision: 10, scale: 2 }).default("0").notNull(), // Track coupon usage
  couponValueRequired: numeric("coupon_value_required", { precision: 10, scale: 2 }).default("0").notNull(), // Required coupon usage
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const coupons = pgTable("coupons", {
  id: serial("id").primaryKey(),
  code: text("code").notNull().unique(),
  partnerId: integer("partner_id").references(() => partners.id).notNull(),
  discountType: text("discount_type").notNull(), // percentage, fixed
  discountValue: numeric("discount_value", { precision: 10, scale: 2 }).notNull(),
  usageLimit: integer("usage_limit"),
  usageCount: integer("usage_count").default(0).notNull(),
  status: text("status").notNull().default("active"), // active, inactive, expired
  expiresAt: timestamp("expires_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const payouts = pgTable("payouts", {
  id: serial("id").primaryKey(),
  partnerId: integer("partner_id").references(() => partners.id).notNull(),
  amount: numeric("amount", { precision: 10, scale: 2 }).notNull(),
  method: text("method").notNull(), // paypal, stripe, manual
  status: text("status").notNull().default("pending"), // pending, processing, completed, failed
  paymentId: text("payment_id"),
  paymentDetails: text("payment_details"), // JSON string for payment info
  processedAt: timestamp("processed_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const clicks = pgTable("clicks", {
  id: serial("id").primaryKey(),
  partnerId: integer("partner_id").references(() => partners.id).notNull(),
  ipAddress: text("ip_address").notNull(),
  userAgent: text("user_agent"),
  referrer: text("referrer"),
  convertedAt: timestamp("converted_at"),
  orderId: text("order_id"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// New table to track customer history for new customer detection
export const customerHistory = pgTable("customer_history", {
  id: serial("id").primaryKey(),
  customerEmail: text("customer_email").notNull(),
  firstOrderDate: timestamp("first_order_date").notNull(),
  firstOrderId: text("first_order_id").notNull(),
  firstPartnerId: integer("first_partner_id").references(() => partners.id),
  totalOrders: integer("total_orders").default(1).notNull(),
  totalSpent: numeric("total_spent", { precision: 10, scale: 2 }).default("0").notNull(),
  lastOrderDate: timestamp("last_order_date").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const passwordResetTokens = pgTable("password_reset_tokens", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  token: text("token").notNull().unique(),
  expiresAt: timestamp("expires_at").notNull(),
  used: boolean("used").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Fraud Detection Tables
export const fraudAlerts = pgTable("fraud_alerts", {
  id: serial("id").primaryKey(),
  partnerId: integer("partner_id").references(() => partners.id),
  alertType: text("alert_type").notNull(), // suspicious_clicks, unusual_conversion_rate, rapid_signups, duplicate_referrals
  severity: text("severity").notNull(), // low, medium, high, critical
  status: text("status").notNull().default("open"), // open, investigating, resolved, false_positive
  description: text("description").notNull(),
  metadata: text("metadata"), // JSON string with additional data
  investigatedBy: integer("investigated_by").references(() => users.id),
  investigationNotes: text("investigation_notes"),
  resolvedAt: timestamp("resolved_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const fraudRules = pgTable("fraud_rules", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description").notNull(),
  ruleType: text("rule_type").notNull(), // click_velocity, conversion_rate, geographic, time_based
  conditions: text("conditions").notNull(), // JSON string with rule conditions
  threshold: numeric("threshold", { precision: 10, scale: 2 }).notNull(),
  timeWindow: integer("time_window").notNull(), // in minutes
  isActive: boolean("is_active").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// GDPR Compliance Tables
export const gdprConsents = pgTable("gdpr_consents", {
  id: serial("id").primaryKey(),
  partnerId: integer("partner_id").references(() => partners.id),
  consentType: text("consent_type").notNull(), // data_processing, marketing, analytics, cookies
  consentGiven: boolean("consent_given").notNull(),
  consentVersion: text("consent_version").notNull(),
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  withdrawnAt: timestamp("withdrawn_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const dataRetentionPolicies = pgTable("data_retention_policies", {
  id: serial("id").primaryKey(),
  dataType: text("data_type").notNull(), // partner_data, commission_data, click_data, customer_data
  retentionPeriod: integer("retention_period").notNull(), // in days
  description: text("description").notNull(),
  isActive: boolean("is_active").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const dataRequests = pgTable("data_requests", {
  id: serial("id").primaryKey(),
  partnerId: integer("partner_id").references(() => partners.id),
  requestType: text("request_type").notNull(), // export, deletion, correction, restriction
  status: text("status").notNull().default("pending"), // pending, processing, completed, rejected
  requestDetails: text("request_details"),
  responseData: text("response_data"), // JSON string with response
  processedBy: integer("processed_by").references(() => users.id),
  processedAt: timestamp("processed_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Audit Trail Tables
export const auditLogs = pgTable("audit_logs", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id),
  partnerId: integer("partner_id").references(() => partners.id),
  action: text("action").notNull(), // login, logout, create, update, delete, view
  entityType: text("entity_type").notNull(), // partner, commission, coupon, payout, user
  entityId: integer("entity_id"),
  description: text("description").notNull(),
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  previousValues: text("previous_values"), // JSON string with old values
  newValues: text("new_values"), // JSON string with new values
  metadata: text("metadata"), // JSON string with additional context
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const systemEvents = pgTable("system_events", {
  id: serial("id").primaryKey(),
  eventType: text("event_type").notNull(), // commission_processed, payout_created, fraud_detected, email_sent
  severity: text("severity").notNull(), // info, warning, error, critical
  description: text("description").notNull(),
  metadata: text("metadata"), // JSON string with event data
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Relations
export const partnersRelations = relations(partners, ({ many }) => ({
  commissions: many(commissions),
  coupons: many(coupons),
  payouts: many(payouts),
  clicks: many(clicks),
}));

export const commissionsRelations = relations(commissions, ({ one }) => ({
  partner: one(partners, {
    fields: [commissions.partnerId],
    references: [partners.id],
  }),
}));

export const couponsRelations = relations(coupons, ({ one }) => ({
  partner: one(partners, {
    fields: [coupons.partnerId],
    references: [partners.id],
  }),
}));

export const payoutsRelations = relations(payouts, ({ one }) => ({
  partner: one(partners, {
    fields: [payouts.partnerId],
    references: [partners.id],
  }),
}));

export const clicksRelations = relations(clicks, ({ one }) => ({
  partner: one(partners, {
    fields: [clicks.partnerId],
    references: [partners.id],
  }),
}));

export const customerHistoryRelations = relations(customerHistory, ({ one }) => ({
  firstPartner: one(partners, {
    fields: [customerHistory.firstPartnerId],
    references: [partners.id],
  }),
}));

export const fraudAlertsRelations = relations(fraudAlerts, ({ one }) => ({
  partner: one(partners, {
    fields: [fraudAlerts.partnerId],
    references: [partners.id],
  }),
  investigatedByUser: one(users, {
    fields: [fraudAlerts.investigatedBy],
    references: [users.id],
  }),
}));

export const gdprConsentsRelations = relations(gdprConsents, ({ one }) => ({
  partner: one(partners, {
    fields: [gdprConsents.partnerId],
    references: [partners.id],
  }),
}));

export const dataRequestsRelations = relations(dataRequests, ({ one }) => ({
  partner: one(partners, {
    fields: [dataRequests.partnerId],
    references: [partners.id],
  }),
  processedByUser: one(users, {
    fields: [dataRequests.processedBy],
    references: [users.id],
  }),
}));

export const auditLogsRelations = relations(auditLogs, ({ one }) => ({
  user: one(users, {
    fields: [auditLogs.userId],
    references: [users.id],
  }),
  partner: one(partners, {
    fields: [auditLogs.partnerId],
    references: [partners.id],
  }),
}));

// Zod schemas
export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
});

export const insertPartnerSchema = createInsertSchema(partners).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  clickCount: true,
  conversionCount: true,
  totalRevenue: true,
  totalCommissions: true,
  password: true, // Password is only used for partner authentication, not admin partner management
});

// Schema for admin partner creation (includes password)
export const insertPartnerWithPasswordSchema = createInsertSchema(partners).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  clickCount: true,
  conversionCount: true,
  totalRevenue: true,
  totalCommissions: true,
});

export const insertCommissionSchema = createInsertSchema(commissions).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertCouponSchema = createInsertSchema(coupons).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  usageCount: true,
});

export const insertPayoutSchema = createInsertSchema(payouts).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertClickSchema = createInsertSchema(clicks).omit({
  id: true,
  createdAt: true,
});

// Types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type Partner = typeof partners.$inferSelect;
export type InsertPartner = z.infer<typeof insertPartnerSchema>;
export type Commission = typeof commissions.$inferSelect;
export type InsertCommission = z.infer<typeof insertCommissionSchema>;
export type Coupon = typeof coupons.$inferSelect;
export type InsertCoupon = z.infer<typeof insertCouponSchema>;
export type Payout = typeof payouts.$inferSelect;
export type InsertPayout = z.infer<typeof insertPayoutSchema>;
export type Click = typeof clicks.$inferSelect;
export type InsertClick = z.infer<typeof insertClickSchema>;

export const insertCustomerHistorySchema = createInsertSchema(customerHistory).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertPasswordResetTokenSchema = createInsertSchema(passwordResetTokens).omit({
  id: true,
  createdAt: true,
});

export type CustomerHistory = typeof customerHistory.$inferSelect;
export type InsertCustomerHistory = z.infer<typeof insertCustomerHistorySchema>;
export type PasswordResetToken = typeof passwordResetTokens.$inferSelect;
export type InsertPasswordResetToken = z.infer<typeof insertPasswordResetTokenSchema>;

// Fraud Detection Schemas
export const insertFraudAlertSchema = createInsertSchema(fraudAlerts).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertFraudRuleSchema = createInsertSchema(fraudRules).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

// GDPR Compliance Schemas
export const insertGdprConsentSchema = createInsertSchema(gdprConsents).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertDataRetentionPolicySchema = createInsertSchema(dataRetentionPolicies).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertDataRequestSchema = createInsertSchema(dataRequests).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

// Audit Trail Schemas
export const insertAuditLogSchema = createInsertSchema(auditLogs).omit({
  id: true,
  createdAt: true,
});

export const insertSystemEventSchema = createInsertSchema(systemEvents).omit({
  id: true,
  createdAt: true,
});

// Fraud Detection Types
export type FraudAlert = typeof fraudAlerts.$inferSelect;
export type InsertFraudAlert = z.infer<typeof insertFraudAlertSchema>;
export type FraudRule = typeof fraudRules.$inferSelect;
export type InsertFraudRule = z.infer<typeof insertFraudRuleSchema>;

// GDPR Compliance Types
export type GdprConsent = typeof gdprConsents.$inferSelect;
export type InsertGdprConsent = z.infer<typeof insertGdprConsentSchema>;
export type DataRetentionPolicy = typeof dataRetentionPolicies.$inferSelect;
export type InsertDataRetentionPolicy = z.infer<typeof insertDataRetentionPolicySchema>;
export type DataRequest = typeof dataRequests.$inferSelect;
export type InsertDataRequest = z.infer<typeof insertDataRequestSchema>;

// Audit Trail Types
export type AuditLog = typeof auditLogs.$inferSelect;
export type InsertAuditLog = z.infer<typeof insertAuditLogSchema>;
export type SystemEvent = typeof systemEvents.$inferSelect;
export type InsertSystemEvent = z.infer<typeof insertSystemEventSchema>;
