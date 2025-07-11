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

export type CustomerHistory = typeof customerHistory.$inferSelect;
export type InsertCustomerHistory = z.infer<typeof insertCustomerHistorySchema>;
