import { 
  users, 
  partners, 
  commissions, 
  coupons, 
  payouts, 
  clicks,
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
  type InsertClick
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
  createUser(user: InsertUser): Promise<User>;
  
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

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values(insertUser).returning();
    return user;
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
}

export const storage = new DatabaseStorage();
