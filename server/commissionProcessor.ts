import { db } from "./db";
import { storage } from "./storage";
import { partners, commissions, customerHistory, InsertCommission, InsertCustomerHistory, CustomerHistory } from "@shared/schema";
import { eq, and, desc } from "drizzle-orm";

export interface ProcessCommissionParams {
  partnerId: number;
  orderId: string;
  customerEmail: string;
  orderValue: number;
  couponCode?: string;
  couponDiscount?: number;
}

export class CommissionProcessor {
  /**
   * Process a commission and determine if it should be paid based on the partner's settings
   */
  async processCommission(params: ProcessCommissionParams): Promise<{
    commission: any;
    shouldPay: boolean;
    reason?: string;
  }> {
    const { partnerId, orderId, customerEmail, orderValue, couponCode, couponDiscount = 0 } = params;

    // Get partner details
    const partner = await storage.getPartner(partnerId);
    if (!partner) {
      throw new Error("Partner not found");
    }

    // Check if customer is new
    const isNewCustomer = await this.isNewCustomer(customerEmail);
    
    // Get or create customer history
    let customerRecord = await this.getCustomerHistory(customerEmail);
    if (!customerRecord) {
      customerRecord = await this.createCustomerHistory({
        customerEmail,
        firstOrderDate: new Date(),
        firstOrderId: orderId,
        firstPartnerId: partnerId,
        totalOrders: 1,
        totalSpent: orderValue,
        lastOrderDate: new Date(),
      });
    } else {
      // Update existing customer record
      await this.updateCustomerHistory(customerRecord.id, {
        totalOrders: customerRecord.totalOrders + 1,
        totalSpent: Number(customerRecord.totalSpent) + orderValue,
        lastOrderDate: new Date(),
      });
    }

    // Calculate commission amount
    const commissionAmount = this.calculateCommissionAmount(orderValue, partner.commissionRate, partner.commissionType);

    // Determine commission validity period
    const commissionValidUntil = new Date();
    commissionValidUntil.setMonth(commissionValidUntil.getMonth() + (partner.commissionPeriodMonths || 12));

    // Create commission record
    const commissionData: InsertCommission = {
      partnerId,
      orderId,
      customerEmail,
      orderValue,
      commissionAmount,
      commissionRate: partner.commissionRate,
      couponCode,
      couponDiscount,
      isNewCustomer,
      customerFirstOrderDate: customerRecord.firstOrderDate,
      commissionValidUntil,
      couponValueUsed: couponDiscount,
      couponValueRequired: couponDiscount, // This would be set based on coupon rules
    };

    const commission = await storage.createCommission(commissionData);

    // Determine if commission should be paid
    const shouldPay = this.shouldPayCommission(partner, commission, isNewCustomer);
    const reason = this.getPaymentReason(partner, commission, isNewCustomer);

    // Update commission status based on payment decision
    if (!shouldPay) {
      await storage.updateCommission(commission.id, { status: "blocked" });
    }

    return {
      commission,
      shouldPay,
      reason,
    };
  }

  /**
   * Check if a customer is new (first time ordering)
   */
  async isNewCustomer(customerEmail: string): Promise<boolean> {
    const [existingCustomer] = await db
      .select()
      .from(customerHistory)
      .where(eq(customerHistory.customerEmail, customerEmail))
      .limit(1);

    return !existingCustomer;
  }

  /**
   * Get customer history record
   */
  async getCustomerHistory(customerEmail: string): Promise<CustomerHistory | null> {
    const [customer] = await db
      .select()
      .from(customerHistory)
      .where(eq(customerHistory.customerEmail, customerEmail))
      .limit(1);

    return customer || null;
  }

  /**
   * Create customer history record
   */
  async createCustomerHistory(data: InsertCustomerHistory): Promise<CustomerHistory> {
    const [customer] = await db
      .insert(customerHistory)
      .values(data)
      .returning();

    return customer;
  }

  /**
   * Update customer history record
   */
  async updateCustomerHistory(id: number, data: Partial<CustomerHistory>): Promise<CustomerHistory> {
    const [updated] = await db
      .update(customerHistory)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(customerHistory.id, id))
      .returning();

    return updated;
  }

  /**
   * Calculate commission amount based on partner settings
   */
  private calculateCommissionAmount(orderValue: number, commissionRate: string, commissionType: string): number {
    const rate = parseFloat(commissionRate);
    
    if (commissionType === "percentage") {
      return (orderValue * rate) / 100;
    } else {
      return rate; // Fixed amount
    }
  }

  /**
   * Determine if commission should be paid based on partner settings
   */
  private shouldPayCommission(partner: any, commission: any, isNewCustomer: boolean): boolean {
    // Rule 1: New customers only
    if (partner.newCustomersOnly && !isNewCustomer) {
      return false;
    }

    // Rule 2: Require coupon usage
    if (partner.requireCouponUsage && commission.couponCode) {
      // Check if coupon value has been fully used
      if (commission.couponValueUsed < commission.couponValueRequired) {
        return false;
      }
    }

    // Rule 3: Commission period validation
    const now = new Date();
    if (commission.commissionValidUntil && now > commission.commissionValidUntil) {
      return false;
    }

    return true;
  }

  /**
   * Get reason for payment decision
   */
  private getPaymentReason(partner: any, commission: any, isNewCustomer: boolean): string | undefined {
    if (partner.newCustomersOnly && !isNewCustomer) {
      return "Commission blocked: Partner only pays for new customers";
    }

    if (partner.requireCouponUsage && commission.couponCode) {
      if (commission.couponValueUsed < commission.couponValueRequired) {
        return "Commission blocked: Coupon value not fully used";
      }
    }

    const now = new Date();
    if (commission.commissionValidUntil && now > commission.commissionValidUntil) {
      return "Commission blocked: Outside commission period";
    }

    return undefined;
  }

  /**
   * Update coupon usage for a customer
   */
  async updateCouponUsage(orderId: string, additionalUsage: number): Promise<void> {
    const [commission] = await db
      .select()
      .from(commissions)
      .where(eq(commissions.orderId, orderId))
      .limit(1);

    if (commission) {
      const newUsage = Number(commission.couponValueUsed) + additionalUsage;
      await storage.updateCommission(commission.id, {
        couponValueUsed: newUsage,
      });

      // Check if commission should now be approved
      const partner = await storage.getPartner(commission.partnerId);
      if (partner?.requireCouponUsage && newUsage >= commission.couponValueRequired) {
        await storage.updateCommission(commission.id, {
          status: "approved",
        });
      }
    }
  }
}

export const commissionProcessor = new CommissionProcessor();