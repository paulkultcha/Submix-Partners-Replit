import { 
  users, 
  partners, 
  commissions, 
  coupons, 
  payouts, 
  clicks,
  passwordResetTokens,
  customerHistory,
  fraudAlerts,
  fraudRules,
  gdprConsents,
  dataRetentionPolicies,
  dataRequests,
  auditLogs,
  systemEvents,
  type User, 
  type InsertUser,
  type Partner,
  type InsertPartner,
  type Commission,
  type InsertCommission,
  type Coupon,
  type InsertCoupon,
  type Payout,
  type InsertPayout,
  type Click,
  type InsertClick,
  type PasswordResetToken,
  type InsertPasswordResetToken,
  type CustomerHistory,
  type InsertCustomerHistory,
  type FraudAlert,
  type InsertFraudAlert,
  type FraudRule,
  type InsertFraudRule,
  type GdprConsent,
  type InsertGdprConsent,
  type DataRetentionPolicy,
  type InsertDataRetentionPolicy,
  type DataRequest,
  type InsertDataRequest,
  type AuditLog,
  type InsertAuditLog,
  type SystemEvent,
  type InsertSystemEvent
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, sum, count, sql, and, gte, lte } from "drizzle-orm";
import session from "express-session";
import connectPg from "connect-pg-simple";
import { pool } from "./db";

const PostgresSessionStore = connectPg(session);

export interface IStorage {
  // User methods
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  getAllUsers(): Promise<User[]>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, user: Partial<User>): Promise<User>;
  deleteUser(id: number): Promise<void>;
  
  // Partner methods
  getPartner(id: number): Promise<Partner | undefined>;
  getPartnerByEmail(email: string): Promise<Partner | undefined>;
  getPartnerByReferralCode(code: string): Promise<Partner | undefined>;
  getAllPartners(): Promise<Partner[]>;
  createPartner(partner: InsertPartner): Promise<Partner>;
  updatePartner(id: number, partner: Partial<Partner>): Promise<Partner>;
  deletePartner(id: number): Promise<void>;
  
  // Commission methods
  getCommission(id: number): Promise<Commission | undefined>;
  getCommissionsByPartner(partnerId: number): Promise<Commission[]>;
  getAllCommissions(): Promise<Commission[]>;
  createCommission(commission: InsertCommission): Promise<Commission>;
  updateCommission(id: number, commission: Partial<Commission>): Promise<Commission>;
  
  // Coupon methods
  getCoupon(id: number): Promise<Coupon | undefined>;
  getCouponByCode(code: string): Promise<Coupon | undefined>;
  getCouponsByPartner(partnerId: number): Promise<Coupon[]>;
  getAllCoupons(): Promise<Coupon[]>;
  createCoupon(coupon: InsertCoupon): Promise<Coupon>;
  updateCoupon(id: number, coupon: Partial<Coupon>): Promise<Coupon>;
  deleteCoupon(id: number): Promise<void>;
  
  // Payout methods
  getPayout(id: number): Promise<Payout | undefined>;
  getPayoutsByPartner(partnerId: number): Promise<Payout[]>;
  getAllPayouts(): Promise<Payout[]>;
  createPayout(payout: InsertPayout): Promise<Payout>;
  updatePayout(id: number, payout: Partial<Payout>): Promise<Payout>;
  
  // Click methods
  createClick(click: InsertClick): Promise<Click>;
  getClicksByPartner(partnerId: number): Promise<Click[]>;
  
  // Analytics methods
  getDashboardStats(): Promise<{
    activePartners: number;
    totalRevenue: number;
    pendingPayouts: number;
    conversionRate: number;
  }>;
  
  getTopPartners(limit?: number): Promise<Array<Partner & { monthlyRevenue: number; monthlyCommissions: number; }>>;
  getRevenueByMonth(months: number): Promise<Array<{ month: string; revenue: number; }>>;
  
  // Password reset token methods
  createPasswordResetToken(data: InsertPasswordResetToken): Promise<PasswordResetToken>;
  getPasswordResetToken(token: string): Promise<PasswordResetToken | null>;
  markPasswordResetTokenUsed(tokenId: number): Promise<void>;
  deleteExpiredPasswordResetTokens(): Promise<void>;
  
  // Customer history methods
  createCustomerHistory(data: InsertCustomerHistory): Promise<CustomerHistory>;
  getCustomerHistory(customerEmail: string): Promise<CustomerHistory | null>;
  updateCustomerHistory(id: number, data: Partial<CustomerHistory>): Promise<CustomerHistory>;
  
  // Fraud Detection methods
  createFraudAlert(alert: InsertFraudAlert): Promise<FraudAlert>;
  getFraudAlert(id: number): Promise<FraudAlert | undefined>;
  getAllFraudAlerts(): Promise<FraudAlert[]>;
  updateFraudAlert(id: number, alert: Partial<FraudAlert>): Promise<FraudAlert>;
  getFraudAlertsByPartner(partnerId: number): Promise<FraudAlert[]>;
  getFraudAlertsByStatus(status: string): Promise<FraudAlert[]>;
  
  createFraudRule(rule: InsertFraudRule): Promise<FraudRule>;
  getFraudRule(id: number): Promise<FraudRule | undefined>;
  getAllFraudRules(): Promise<FraudRule[]>;
  updateFraudRule(id: number, rule: Partial<FraudRule>): Promise<FraudRule>;
  getActiveFraudRules(): Promise<FraudRule[]>;
  
  // GDPR Compliance methods
  createGdprConsent(consent: InsertGdprConsent): Promise<GdprConsent>;
  getGdprConsent(id: number): Promise<GdprConsent | undefined>;
  getGdprConsentsByPartner(partnerId: number): Promise<GdprConsent[]>;
  updateGdprConsent(id: number, consent: Partial<GdprConsent>): Promise<GdprConsent>;
  
  createDataRetentionPolicy(policy: InsertDataRetentionPolicy): Promise<DataRetentionPolicy>;
  getDataRetentionPolicy(id: number): Promise<DataRetentionPolicy | undefined>;
  getAllDataRetentionPolicies(): Promise<DataRetentionPolicy[]>;
  updateDataRetentionPolicy(id: number, policy: Partial<DataRetentionPolicy>): Promise<DataRetentionPolicy>;
  
  createDataRequest(request: InsertDataRequest): Promise<DataRequest>;
  getDataRequest(id: number): Promise<DataRequest | undefined>;
  getAllDataRequests(): Promise<DataRequest[]>;
  updateDataRequest(id: number, request: Partial<DataRequest>): Promise<DataRequest>;
  getDataRequestsByPartner(partnerId: number): Promise<DataRequest[]>;
  
  // Audit Trail methods
  createAuditLog(log: InsertAuditLog): Promise<AuditLog>;
  getAuditLog(id: number): Promise<AuditLog | undefined>;
  getAllAuditLogs(): Promise<AuditLog[]>;
  getAuditLogsByUser(userId: number): Promise<AuditLog[]>;
  getAuditLogsByPartner(partnerId: number): Promise<AuditLog[]>;
  getAuditLogsByEntity(entityType: string, entityId: number): Promise<AuditLog[]>;
  
  createSystemEvent(event: InsertSystemEvent): Promise<SystemEvent>;
  getSystemEvent(id: number): Promise<SystemEvent | undefined>;
  getAllSystemEvents(): Promise<SystemEvent[]>;
  getSystemEventsByType(eventType: string): Promise<SystemEvent[]>;
  
  sessionStore: session.Store;
}

export class DatabaseStorage implements IStorage {
  sessionStore: session.Store;

  constructor() {
    this.sessionStore = new PostgresSessionStore({ 
      pool, 
      createTableIfMissing: true 
    });
  }

  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user || undefined;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user || undefined;
  }

  async getAllUsers(): Promise<User[]> {
    return await db.select().from(users).orderBy(desc(users.createdAt));
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values(insertUser).returning();
    return user;
  }

  async updateUser(id: number, userData: Partial<User>): Promise<User> {
    const [user] = await db
      .update(users)
      .set({ ...userData, updatedAt: new Date() })
      .where(eq(users.id, id))
      .returning();
    return user;
  }

  async deleteUser(id: number): Promise<void> {
    await db.delete(users).where(eq(users.id, id));
  }

  async getPartner(id: number): Promise<Partner | undefined> {
    const [partner] = await db.select().from(partners).where(eq(partners.id, id));
    return partner || undefined;
  }

  async getPartnerByEmail(email: string): Promise<Partner | undefined> {
    const [partner] = await db.select().from(partners).where(eq(partners.email, email));
    return partner || undefined;
  }

  async getPartnerByReferralCode(code: string): Promise<Partner | undefined> {
    const [partner] = await db.select().from(partners).where(eq(partners.referralCode, code));
    return partner || undefined;
  }

  async getAllPartners(): Promise<Partner[]> {
    return await db.select().from(partners).orderBy(desc(partners.createdAt));
  }

  async createPartner(partner: InsertPartner): Promise<Partner> {
    console.log("Storage createPartner called with:", partner);
    const [newPartner] = await db.insert(partners).values(partner).returning();
    return newPartner;
  }

  async updatePartner(id: number, partner: Partial<Partner>): Promise<Partner> {
    const [updatedPartner] = await db
      .update(partners)
      .set({ ...partner, updatedAt: new Date() })
      .where(eq(partners.id, id))
      .returning();
    return updatedPartner;
  }

  async deletePartner(id: number): Promise<void> {
    // Delete related records first to avoid foreign key constraint issues
    await db.delete(clicks).where(eq(clicks.partnerId, id));
    await db.delete(payouts).where(eq(payouts.partnerId, id));
    await db.delete(commissions).where(eq(commissions.partnerId, id));
    await db.delete(coupons).where(eq(coupons.partnerId, id));
    
    // Finally delete the partner
    await db.delete(partners).where(eq(partners.id, id));
  }

  async getCommission(id: number): Promise<Commission | undefined> {
    const [commission] = await db.select().from(commissions).where(eq(commissions.id, id));
    return commission || undefined;
  }

  async getCommissionsByPartner(partnerId: number): Promise<Commission[]> {
    return await db.select().from(commissions).where(eq(commissions.partnerId, partnerId)).orderBy(desc(commissions.createdAt));
  }

  async getAllCommissions(): Promise<Commission[]> {
    return await db.select().from(commissions).orderBy(desc(commissions.createdAt));
  }

  async createCommission(commission: InsertCommission): Promise<Commission> {
    const [newCommission] = await db.insert(commissions).values(commission).returning();
    return newCommission;
  }

  async updateCommission(id: number, commission: Partial<Commission>): Promise<Commission> {
    const [updatedCommission] = await db
      .update(commissions)
      .set({ ...commission, updatedAt: new Date() })
      .where(eq(commissions.id, id))
      .returning();
    return updatedCommission;
  }

  async getCoupon(id: number): Promise<Coupon | undefined> {
    const [coupon] = await db.select().from(coupons).where(eq(coupons.id, id));
    return coupon || undefined;
  }

  async getCouponByCode(code: string): Promise<Coupon | undefined> {
    const [coupon] = await db.select().from(coupons).where(eq(coupons.code, code));
    return coupon || undefined;
  }

  async getCouponsByPartner(partnerId: number): Promise<Coupon[]> {
    return await db.select().from(coupons).where(eq(coupons.partnerId, partnerId)).orderBy(desc(coupons.createdAt));
  }

  async getAllCoupons(): Promise<Coupon[]> {
    return await db.select().from(coupons).orderBy(desc(coupons.createdAt));
  }

  async createCoupon(coupon: InsertCoupon): Promise<Coupon> {
    const [newCoupon] = await db.insert(coupons).values(coupon).returning();
    return newCoupon;
  }

  async updateCoupon(id: number, coupon: Partial<Coupon>): Promise<Coupon> {
    const [updatedCoupon] = await db
      .update(coupons)
      .set({ ...coupon, updatedAt: new Date() })
      .where(eq(coupons.id, id))
      .returning();
    return updatedCoupon;
  }

  async deleteCoupon(id: number): Promise<void> {
    await db.delete(coupons).where(eq(coupons.id, id));
  }

  async getPayout(id: number): Promise<Payout | undefined> {
    const [payout] = await db.select().from(payouts).where(eq(payouts.id, id));
    return payout || undefined;
  }

  async getPayoutsByPartner(partnerId: number): Promise<Payout[]> {
    return await db.select().from(payouts).where(eq(payouts.partnerId, partnerId)).orderBy(desc(payouts.createdAt));
  }

  async getAllPayouts(): Promise<Payout[]> {
    return await db.select().from(payouts).orderBy(desc(payouts.createdAt));
  }

  async createPayout(payout: InsertPayout): Promise<Payout> {
    const [newPayout] = await db.insert(payouts).values(payout).returning();
    return newPayout;
  }

  async updatePayout(id: number, payout: Partial<Payout>): Promise<Payout> {
    const [updatedPayout] = await db
      .update(payouts)
      .set({ ...payout, updatedAt: new Date() })
      .where(eq(payouts.id, id))
      .returning();
    return updatedPayout;
  }

  async createClick(click: InsertClick): Promise<Click> {
    const [newClick] = await db.insert(clicks).values(click).returning();
    return newClick;
  }

  async getClicksByPartner(partnerId: number): Promise<Click[]> {
    return await db.select().from(clicks).where(eq(clicks.partnerId, partnerId)).orderBy(desc(clicks.createdAt));
  }

  async getDashboardStats(): Promise<{
    activePartners: number;
    totalRevenue: number;
    pendingPayouts: number;
    conversionRate: number;
  }> {
    const [activePartnersResult] = await db
      .select({ count: count() })
      .from(partners)
      .where(eq(partners.status, "active"));

    const [totalRevenueResult] = await db
      .select({ total: sum(commissions.orderValue) })
      .from(commissions)
      .where(eq(commissions.status, "approved"));

    const [pendingPayoutsResult] = await db
      .select({ total: sum(commissions.commissionAmount) })
      .from(commissions)
      .where(eq(commissions.status, "approved"));

    const [totalClicksResult] = await db
      .select({ count: count() })
      .from(clicks);

    const [totalConversionsResult] = await db
      .select({ count: count() })
      .from(clicks)
      .where(sql`${clicks.convertedAt} IS NOT NULL`);

    const activePartners = activePartnersResult.count;
    const totalRevenue = Number(totalRevenueResult.total) || 0;
    const pendingPayouts = Number(pendingPayoutsResult.total) || 0;
    const totalClicks = totalClicksResult.count;
    const totalConversions = totalConversionsResult.count;
    const conversionRate = totalClicks > 0 ? (totalConversions / totalClicks) * 100 : 0;

    return {
      activePartners,
      totalRevenue,
      pendingPayouts,
      conversionRate,
    };
  }

  async getTopPartners(limit = 5): Promise<Array<Partner & { monthlyRevenue: number; monthlyCommissions: number; }>> {
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    
    const result = await db
      .select({
        partner: partners,
        monthlyRevenue: sum(commissions.orderValue),
        monthlyCommissions: sum(commissions.commissionAmount),
      })
      .from(partners)
      .leftJoin(commissions, eq(partners.id, commissions.partnerId))
      .where(gte(commissions.createdAt, thirtyDaysAgo))
      .groupBy(partners.id)
      .orderBy(desc(sum(commissions.orderValue)))
      .limit(limit);

    return result.map(row => ({
      ...row.partner,
      monthlyRevenue: Number(row.monthlyRevenue) || 0,
      monthlyCommissions: Number(row.monthlyCommissions) || 0,
    }));
  }

  async getRevenueByMonth(months: number): Promise<Array<{ month: string; revenue: number; }>> {
    const startDate = new Date();
    startDate.setMonth(startDate.getMonth() - months);

    const result = await db
      .select({
        month: sql<string>`TO_CHAR(${commissions.createdAt}, 'Mon')`,
        revenue: sum(commissions.orderValue),
      })
      .from(commissions)
      .where(gte(commissions.createdAt, startDate))
      .groupBy(sql`TO_CHAR(${commissions.createdAt}, 'Mon'), EXTRACT(MONTH FROM ${commissions.createdAt})`)
      .orderBy(sql`EXTRACT(MONTH FROM ${commissions.createdAt})`);

    return result.map(row => ({
      month: row.month,
      revenue: Number(row.revenue) || 0,
    }));
  }

  // Password reset token methods
  async createPasswordResetToken(data: InsertPasswordResetToken): Promise<PasswordResetToken> {
    const [token] = await db.insert(passwordResetTokens).values(data).returning();
    return token;
  }

  async getPasswordResetToken(token: string): Promise<PasswordResetToken | null> {
    const [resetToken] = await db.select().from(passwordResetTokens).where(eq(passwordResetTokens.token, token));
    return resetToken || null;
  }

  async markPasswordResetTokenUsed(tokenId: number): Promise<void> {
    await db.update(passwordResetTokens).set({ used: true }).where(eq(passwordResetTokens.id, tokenId));
  }

  async deleteExpiredPasswordResetTokens(): Promise<void> {
    await db.delete(passwordResetTokens).where(lte(passwordResetTokens.expiresAt, new Date()));
  }

  // Customer history methods
  async createCustomerHistory(data: InsertCustomerHistory): Promise<CustomerHistory> {
    const [history] = await db.insert(customerHistory).values(data).returning();
    return history;
  }

  async getCustomerHistory(customerEmail: string): Promise<CustomerHistory | null> {
    const [history] = await db.select().from(customerHistory).where(eq(customerHistory.customerEmail, customerEmail));
    return history || null;
  }

  async updateCustomerHistory(id: number, data: Partial<CustomerHistory>): Promise<CustomerHistory> {
    const [history] = await db.update(customerHistory).set(data).where(eq(customerHistory.id, id)).returning();
    return history;
  }

  // Fraud Detection methods
  async createFraudAlert(alert: InsertFraudAlert): Promise<FraudAlert> {
    const [fraudAlert] = await db
      .insert(fraudAlerts)
      .values(alert)
      .returning();
    return fraudAlert;
  }

  async getFraudAlert(id: number): Promise<FraudAlert | undefined> {
    const [fraudAlert] = await db
      .select()
      .from(fraudAlerts)
      .where(eq(fraudAlerts.id, id));
    return fraudAlert;
  }

  async getAllFraudAlerts(): Promise<FraudAlert[]> {
    return await db
      .select()
      .from(fraudAlerts)
      .orderBy(desc(fraudAlerts.createdAt));
  }

  async updateFraudAlert(id: number, alert: Partial<FraudAlert>): Promise<FraudAlert> {
    const [fraudAlert] = await db
      .update(fraudAlerts)
      .set({ ...alert, updatedAt: new Date() })
      .where(eq(fraudAlerts.id, id))
      .returning();
    return fraudAlert;
  }

  async getFraudAlertsByPartner(partnerId: number): Promise<FraudAlert[]> {
    return await db
      .select()
      .from(fraudAlerts)
      .where(eq(fraudAlerts.partnerId, partnerId))
      .orderBy(desc(fraudAlerts.createdAt));
  }

  async getFraudAlertsByStatus(status: string): Promise<FraudAlert[]> {
    return await db
      .select()
      .from(fraudAlerts)
      .where(eq(fraudAlerts.status, status))
      .orderBy(desc(fraudAlerts.createdAt));
  }

  async createFraudRule(rule: InsertFraudRule): Promise<FraudRule> {
    const [fraudRule] = await db
      .insert(fraudRules)
      .values(rule)
      .returning();
    return fraudRule;
  }

  async getFraudRule(id: number): Promise<FraudRule | undefined> {
    const [fraudRule] = await db
      .select()
      .from(fraudRules)
      .where(eq(fraudRules.id, id));
    return fraudRule;
  }

  async getAllFraudRules(): Promise<FraudRule[]> {
    return await db
      .select()
      .from(fraudRules)
      .orderBy(desc(fraudRules.createdAt));
  }

  async updateFraudRule(id: number, rule: Partial<FraudRule>): Promise<FraudRule> {
    const [fraudRule] = await db
      .update(fraudRules)
      .set({ ...rule, updatedAt: new Date() })
      .where(eq(fraudRules.id, id))
      .returning();
    return fraudRule;
  }

  async getActiveFraudRules(): Promise<FraudRule[]> {
    return await db
      .select()
      .from(fraudRules)
      .where(eq(fraudRules.isActive, true))
      .orderBy(desc(fraudRules.createdAt));
  }

  // GDPR Compliance methods
  async createGdprConsent(consent: InsertGdprConsent): Promise<GdprConsent> {
    const [gdprConsent] = await db
      .insert(gdprConsents)
      .values(consent)
      .returning();
    return gdprConsent;
  }

  async getGdprConsent(id: number): Promise<GdprConsent | undefined> {
    const [gdprConsent] = await db
      .select()
      .from(gdprConsents)
      .where(eq(gdprConsents.id, id));
    return gdprConsent;
  }

  async getGdprConsentsByPartner(partnerId: number): Promise<GdprConsent[]> {
    return await db
      .select()
      .from(gdprConsents)
      .where(eq(gdprConsents.partnerId, partnerId))
      .orderBy(desc(gdprConsents.createdAt));
  }

  async getAllGdprConsents(): Promise<GdprConsent[]> {
    return await db
      .select()
      .from(gdprConsents)
      .orderBy(desc(gdprConsents.createdAt));
  }

  async updateGdprConsent(id: number, consent: Partial<GdprConsent>): Promise<GdprConsent> {
    const [gdprConsent] = await db
      .update(gdprConsents)
      .set({ ...consent, updatedAt: new Date() })
      .where(eq(gdprConsents.id, id))
      .returning();
    return gdprConsent;
  }

  async createDataRetentionPolicy(policy: InsertDataRetentionPolicy): Promise<DataRetentionPolicy> {
    const [dataRetentionPolicy] = await db
      .insert(dataRetentionPolicies)
      .values(policy)
      .returning();
    return dataRetentionPolicy;
  }

  async getDataRetentionPolicy(id: number): Promise<DataRetentionPolicy | undefined> {
    const [dataRetentionPolicy] = await db
      .select()
      .from(dataRetentionPolicies)
      .where(eq(dataRetentionPolicies.id, id));
    return dataRetentionPolicy;
  }

  async getAllDataRetentionPolicies(): Promise<DataRetentionPolicy[]> {
    return await db
      .select()
      .from(dataRetentionPolicies)
      .orderBy(desc(dataRetentionPolicies.createdAt));
  }

  async updateDataRetentionPolicy(id: number, policy: Partial<DataRetentionPolicy>): Promise<DataRetentionPolicy> {
    const [dataRetentionPolicy] = await db
      .update(dataRetentionPolicies)
      .set({ ...policy, updatedAt: new Date() })
      .where(eq(dataRetentionPolicies.id, id))
      .returning();
    return dataRetentionPolicy;
  }

  async createDataRequest(request: InsertDataRequest): Promise<DataRequest> {
    const [dataRequest] = await db
      .insert(dataRequests)
      .values(request)
      .returning();
    return dataRequest;
  }

  async getDataRequest(id: number): Promise<DataRequest | undefined> {
    const [dataRequest] = await db
      .select()
      .from(dataRequests)
      .where(eq(dataRequests.id, id));
    return dataRequest;
  }

  async getAllDataRequests(): Promise<DataRequest[]> {
    return await db
      .select()
      .from(dataRequests)
      .orderBy(desc(dataRequests.createdAt));
  }

  async updateDataRequest(id: number, request: Partial<DataRequest>): Promise<DataRequest> {
    const [dataRequest] = await db
      .update(dataRequests)
      .set({ ...request, updatedAt: new Date() })
      .where(eq(dataRequests.id, id))
      .returning();
    return dataRequest;
  }

  async getDataRequestsByPartner(partnerId: number): Promise<DataRequest[]> {
    return await db
      .select()
      .from(dataRequests)
      .where(eq(dataRequests.partnerId, partnerId))
      .orderBy(desc(dataRequests.createdAt));
  }

  // Audit Trail methods
  async createAuditLog(log: InsertAuditLog): Promise<AuditLog> {
    const [auditLog] = await db
      .insert(auditLogs)
      .values(log)
      .returning();
    return auditLog;
  }

  async getAuditLog(id: number): Promise<AuditLog | undefined> {
    const [auditLog] = await db
      .select()
      .from(auditLogs)
      .where(eq(auditLogs.id, id));
    return auditLog;
  }

  async getAllAuditLogs(): Promise<AuditLog[]> {
    return await db
      .select()
      .from(auditLogs)
      .orderBy(desc(auditLogs.createdAt));
  }

  async getAuditLogsByUser(userId: number): Promise<AuditLog[]> {
    return await db
      .select()
      .from(auditLogs)
      .where(eq(auditLogs.userId, userId))
      .orderBy(desc(auditLogs.createdAt));
  }

  async getAuditLogsByPartner(partnerId: number): Promise<AuditLog[]> {
    return await db
      .select()
      .from(auditLogs)
      .where(eq(auditLogs.partnerId, partnerId))
      .orderBy(desc(auditLogs.createdAt));
  }

  async getAuditLogsByEntity(entityType: string, entityId: number): Promise<AuditLog[]> {
    return await db
      .select()
      .from(auditLogs)
      .where(and(
        eq(auditLogs.entityType, entityType),
        eq(auditLogs.entityId, entityId)
      ))
      .orderBy(desc(auditLogs.createdAt));
  }

  async createSystemEvent(event: InsertSystemEvent): Promise<SystemEvent> {
    const [systemEvent] = await db
      .insert(systemEvents)
      .values(event)
      .returning();
    return systemEvent;
  }

  async getSystemEvent(id: number): Promise<SystemEvent | undefined> {
    const [systemEvent] = await db
      .select()
      .from(systemEvents)
      .where(eq(systemEvents.id, id));
    return systemEvent;
  }

  async getAllSystemEvents(): Promise<SystemEvent[]> {
    return await db
      .select()
      .from(systemEvents)
      .orderBy(desc(systemEvents.createdAt));
  }

  async getSystemEventsByType(eventType: string): Promise<SystemEvent[]> {
    return await db
      .select()
      .from(systemEvents)
      .where(eq(systemEvents.eventType, eventType))
      .orderBy(desc(systemEvents.createdAt));
  }
}

export const storage = new DatabaseStorage();
