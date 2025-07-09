import { Sidebar } from "@/components/layout/sidebar";
import { Header } from "@/components/layout/header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download, Loader2 } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { Partner, Commission, Coupon, Payout } from "@shared/schema";

export default function Reports() {
  const { toast } = useToast();
  const [exportingReport, setExportingReport] = useState<string | null>(null);
  
  const { data: partners } = useQuery<Partner[]>({
    queryKey: ["/api/partners"],
  });
  
  const { data: commissions } = useQuery<Commission[]>({
    queryKey: ["/api/commissions"],
  });
  
  const { data: coupons } = useQuery<Coupon[]>({
    queryKey: ["/api/coupons"],
  });
  
  const { data: payouts } = useQuery<Payout[]>({
    queryKey: ["/api/payouts"],
  });

  const convertToCSV = (data: any[], headers: string[]) => {
    const csvContent = [
      headers.join(','),
      ...data.map(row => headers.map(header => {
        const value = row[header];
        // Handle values that might contain commas or quotes
        return typeof value === 'string' && (value.includes(',') || value.includes('"')) 
          ? `"${value.replace(/"/g, '""')}"` 
          : value;
      }).join(','))
    ].join('\n');
    
    return csvContent;
  };

  const downloadCSV = (csvContent: string, filename: string) => {
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', filename);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const exportPartnerReport = async () => {
    if (!partners) return;
    
    setExportingReport('partner');
    try {
      const reportData = partners.map(partner => ({
        id: partner.id,
        name: partner.name,
        email: partner.email,
        status: partner.status,
        commission_rate: partner.commissionRate,
        commission_type: partner.commissionType,
        referral_code: partner.referralCode,
        clicks: partner.clickCount,
        conversions: partner.conversionCount,
        total_revenue: partner.totalRevenue,
        total_commissions: partner.totalCommissions,
        created_at: new Date(partner.createdAt).toISOString(),
      }));
      
      const headers = ['id', 'name', 'email', 'status', 'commission_rate', 'commission_type', 
                      'referral_code', 'clicks', 'conversions', 'total_revenue', 'total_commissions', 'created_at'];
      const csvContent = convertToCSV(reportData, headers);
      downloadCSV(csvContent, `partner_report_${new Date().toISOString().split('T')[0]}.csv`);
      
      toast({
        title: "Success",
        description: "Partner report exported successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to export partner report",
        variant: "destructive",
      });
    } finally {
      setExportingReport(null);
    }
  };

  const exportCommissionReport = async () => {
    if (!commissions) return;
    
    setExportingReport('commission');
    try {
      const reportData = commissions.map(commission => ({
        id: commission.id,
        partner_id: commission.partnerId,
        order_id: commission.orderId,
        customer_email: commission.customerEmail,
        order_value: commission.orderValue,
        commission_amount: commission.commissionAmount,
        commission_rate: commission.commissionRate,
        coupon_code: commission.couponCode || '',
        coupon_discount: commission.couponDiscount,
        status: commission.status,
        created_at: new Date(commission.createdAt).toISOString(),
      }));
      
      const headers = ['id', 'partner_id', 'order_id', 'customer_email', 'order_value', 
                      'commission_amount', 'commission_rate', 'coupon_code', 'coupon_discount', 
                      'status', 'created_at'];
      const csvContent = convertToCSV(reportData, headers);
      downloadCSV(csvContent, `commission_report_${new Date().toISOString().split('T')[0]}.csv`);
      
      toast({
        title: "Success",
        description: "Commission report exported successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to export commission report",
        variant: "destructive",
      });
    } finally {
      setExportingReport(null);
    }
  };

  const exportCouponReport = async () => {
    if (!coupons) return;
    
    setExportingReport('coupon');
    try {
      const reportData = coupons.map(coupon => ({
        id: coupon.id,
        code: coupon.code,
        partner_id: coupon.partnerId,
        discount_type: coupon.discountType,
        discount_value: coupon.discountValue,
        usage_limit: coupon.usageLimit || 'unlimited',
        usage_count: coupon.usageCount,
        status: coupon.status,
        created_at: new Date(coupon.createdAt).toISOString(),
      }));
      
      const headers = ['id', 'code', 'partner_id', 'discount_type', 'discount_value', 
                      'usage_limit', 'usage_count', 'status', 'created_at'];
      const csvContent = convertToCSV(reportData, headers);
      downloadCSV(csvContent, `coupon_report_${new Date().toISOString().split('T')[0]}.csv`);
      
      toast({
        title: "Success",
        description: "Coupon report exported successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to export coupon report",
        variant: "destructive",
      });
    } finally {
      setExportingReport(null);
    }
  };

  const exportPayoutReport = async () => {
    if (!payouts) return;
    
    setExportingReport('payout');
    try {
      const reportData = payouts.map(payout => ({
        id: payout.id,
        partner_id: payout.partnerId,
        amount: payout.amount,
        method: payout.method,
        status: payout.status,
        payment_id: payout.paymentId || '',
        processed_at: payout.processedAt ? new Date(payout.processedAt).toISOString() : '',
        created_at: new Date(payout.createdAt).toISOString(),
      }));
      
      const headers = ['id', 'partner_id', 'amount', 'method', 'status', 'payment_id', 
                      'processed_at', 'created_at'];
      const csvContent = convertToCSV(reportData, headers);
      downloadCSV(csvContent, `payout_report_${new Date().toISOString().split('T')[0]}.csv`);
      
      toast({
        title: "Success",
        description: "Payout report exported successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to export payout report",
        variant: "destructive",
      });
    } finally {
      setExportingReport(null);
    }
  };

  return (
    <div className="min-h-screen flex bg-slate-50">
      <Sidebar />
      <div className="flex-1 ml-64">
        <Header title="Reports & Analytics" subtitle="Generate comprehensive reports and export data" />
        
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Partner Performance Report</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">
                  Export detailed partner performance metrics including clicks, conversions, and commissions.
                </p>
                <Button 
                  className="w-full"
                  onClick={exportPartnerReport}
                  disabled={exportingReport === 'partner' || !partners}
                >
                  {exportingReport === 'partner' ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Exporting...
                    </>
                  ) : (
                    <>
                      <Download className="mr-2 h-4 w-4" />
                      Export Partner Report
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Commission Report</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">
                  Export all commission transactions with detailed breakdown and status.
                </p>
                <Button 
                  className="w-full"
                  onClick={exportCommissionReport}
                  disabled={exportingReport === 'commission' || !commissions}
                >
                  {exportingReport === 'commission' ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Exporting...
                    </>
                  ) : (
                    <>
                      <Download className="mr-2 h-4 w-4" />
                      Export Commission Report
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Coupon Usage Report</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">
                  Export coupon usage statistics and revenue impact analysis.
                </p>
                <Button 
                  className="w-full"
                  onClick={exportCouponReport}
                  disabled={exportingReport === 'coupon' || !coupons}
                >
                  {exportingReport === 'coupon' ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Exporting...
                    </>
                  ) : (
                    <>
                      <Download className="mr-2 h-4 w-4" />
                      Export Coupon Report
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Payout History</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">
                  Export complete payout history with payment details and statuses.
                </p>
                <Button 
                  className="w-full"
                  onClick={exportPayoutReport}
                  disabled={exportingReport === 'payout' || !payouts}
                >
                  {exportingReport === 'payout' ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Exporting...
                    </>
                  ) : (
                    <>
                      <Download className="mr-2 h-4 w-4" />
                      Export Payout Report
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
