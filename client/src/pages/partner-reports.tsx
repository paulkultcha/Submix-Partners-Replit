import { PartnerSidebar } from "@/components/partner/partner-sidebar";
import { PartnerHeader } from "@/components/partner/partner-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useQuery } from "@tanstack/react-query";
import { usePartnerAuth } from "@/hooks/use-partner-auth";
import { Commission, Payout, Click } from "@shared/schema";
import { useState } from "react";
import { formatCurrency } from "@/lib/utils";
import { Download, FileText, Calendar, TrendingUp, DollarSign, Users, Eye } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function PartnerReports() {
  const { partner } = usePartnerAuth();
  const { toast } = useToast();
  const [isExporting, setIsExporting] = useState(false);

  const { data: commissions = [] } = useQuery<Commission[]>({
    queryKey: ["/api/partner/commissions"],
    enabled: !!partner,
  });

  const { data: payouts = [] } = useQuery<Payout[]>({
    queryKey: ["/api/partner/payouts"],
    enabled: !!partner,
  });

  const { data: clicks = [] } = useQuery<Click[]>({
    queryKey: ["/api/partner/clicks"],
    enabled: !!partner,
  });

  const exportCommissionsReport = async () => {
    setIsExporting(true);
    try {
      // Create CSV content
      const csvHeaders = ['Date', 'Order ID', 'Customer Email', 'Order Value', 'Commission Amount', 'Status'];
      const csvRows = commissions.map(commission => [
        new Date(commission.createdAt).toLocaleDateString(),
        commission.orderId,
        commission.customerEmail,
        formatCurrency(Number(commission.orderValue)),
        formatCurrency(Number(commission.commissionAmount)),
        commission.status
      ]);
      
      const csvContent = [csvHeaders, ...csvRows]
        .map(row => row.map(cell => `"${cell}"`).join(','))
        .join('\n');
      
      // Download CSV
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = `partner_commissions_${new Date().toISOString().split('T')[0]}.csv`;
      link.click();
      
      toast({
        title: "Export successful",
        description: "Your commissions report has been downloaded.",
      });
    } catch (error) {
      toast({
        title: "Export failed",
        description: "There was an error exporting your report. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsExporting(false);
    }
  };

  const exportPayoutsReport = async () => {
    setIsExporting(true);
    try {
      // Create CSV content
      const csvHeaders = ['Date', 'Amount', 'Method', 'Status', 'Processed Date'];
      const csvRows = payouts.map(payout => [
        new Date(payout.createdAt).toLocaleDateString(),
        formatCurrency(Number(payout.amount)),
        payout.method,
        payout.status,
        payout.processedAt ? new Date(payout.processedAt).toLocaleDateString() : 'N/A'
      ]);
      
      const csvContent = [csvHeaders, ...csvRows]
        .map(row => row.map(cell => `"${cell}"`).join(','))
        .join('\n');
      
      // Download CSV
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = `partner_payouts_${new Date().toISOString().split('T')[0]}.csv`;
      link.click();
      
      toast({
        title: "Export successful",
        description: "Your payouts report has been downloaded.",
      });
    } catch (error) {
      toast({
        title: "Export failed",
        description: "There was an error exporting your report. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsExporting(false);
    }
  };

  const exportClicksReport = async () => {
    setIsExporting(true);
    try {
      // Create CSV content
      const csvHeaders = ['Date', 'IP Address', 'User Agent', 'Referrer', 'Converted', 'Order ID'];
      const csvRows = clicks.map(click => [
        new Date(click.createdAt).toLocaleDateString(),
        click.ipAddress,
        click.userAgent || 'N/A',
        click.referrer || 'N/A',
        click.convertedAt ? 'Yes' : 'No',
        click.orderId || 'N/A'
      ]);
      
      const csvContent = [csvHeaders, ...csvRows]
        .map(row => row.map(cell => `"${cell}"`).join(','))
        .join('\n');
      
      // Download CSV
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = `partner_clicks_${new Date().toISOString().split('T')[0]}.csv`;
      link.click();
      
      toast({
        title: "Export successful",
        description: "Your clicks report has been downloaded.",
      });
    } catch (error) {
      toast({
        title: "Export failed",
        description: "There was an error exporting your report. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsExporting(false);
    }
  };

  const totalCommissions = commissions.reduce((sum, commission) => sum + Number(commission.commissionAmount), 0);
  const totalPayouts = payouts.reduce((sum, payout) => sum + Number(payout.amount), 0);
  const totalClicks = clicks.length;
  const conversions = clicks.filter(click => click.convertedAt).length;
  const conversionRate = totalClicks > 0 ? (conversions / totalClicks) * 100 : 0;

  return (
    <div className="flex min-h-screen bg-slate-50">
      <PartnerSidebar />
      
      <div className="flex-1 ml-64">
        <PartnerHeader 
          title="Reports & Analytics" 
          subtitle="Download detailed reports of your affiliate performance"
        />
        
        <div className="p-6 space-y-6">
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Commissions</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatCurrency(totalCommissions)}</div>
                <p className="text-xs text-muted-foreground">
                  {commissions.length} transactions
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Payouts</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatCurrency(totalPayouts)}</div>
                <p className="text-xs text-muted-foreground">
                  {payouts.length} payments
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Clicks</CardTitle>
                <Eye className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{totalClicks}</div>
                <p className="text-xs text-muted-foreground">
                  {conversions} conversions
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Conversion Rate</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{conversionRate.toFixed(1)}%</div>
                <p className="text-xs text-muted-foreground">
                  Click to conversion
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Export Reports Section */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Commissions Report
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  Export detailed commission data including order information, amounts, and status.
                </p>
                <div className="flex flex-wrap gap-2">
                  <Badge variant="secondary">{commissions.length} records</Badge>
                  <Badge variant="outline">CSV format</Badge>
                </div>
                <Button 
                  onClick={exportCommissionsReport}
                  disabled={isExporting || commissions.length === 0}
                  className="w-full"
                >
                  <Download className="h-4 w-4 mr-2" />
                  {isExporting ? 'Exporting...' : 'Export Commissions'}
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <DollarSign className="h-5 w-5" />
                  Payouts Report
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  Export payout history including amounts, methods, and processing dates.
                </p>
                <div className="flex flex-wrap gap-2">
                  <Badge variant="secondary">{payouts.length} records</Badge>
                  <Badge variant="outline">CSV format</Badge>
                </div>
                <Button 
                  onClick={exportPayoutsReport}
                  disabled={isExporting || payouts.length === 0}
                  className="w-full"
                >
                  <Download className="h-4 w-4 mr-2" />
                  {isExporting ? 'Exporting...' : 'Export Payouts'}
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Eye className="h-5 w-5" />
                  Clicks Report
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  Export click tracking data including IP addresses, user agents, and conversions.
                </p>
                <div className="flex flex-wrap gap-2">
                  <Badge variant="secondary">{clicks.length} records</Badge>
                  <Badge variant="outline">CSV format</Badge>
                </div>
                <Button 
                  onClick={exportClicksReport}
                  disabled={isExporting || clicks.length === 0}
                  className="w-full"
                >
                  <Download className="h-4 w-4 mr-2" />
                  {isExporting ? 'Exporting...' : 'Export Clicks'}
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Recent Activity */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Recent Activity
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {commissions.length === 0 && payouts.length === 0 && clicks.length === 0 ? (
                  <p className="text-center text-muted-foreground py-8">
                    No activity data available yet. Start promoting your referral links to see your performance data here.
                  </p>
                ) : (
                  <div className="space-y-3">
                    {commissions.slice(0, 3).map((commission) => (
                      <div key={commission.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                            <DollarSign className="h-4 w-4 text-green-600" />
                          </div>
                          <div>
                            <p className="font-medium">Commission Earned</p>
                            <p className="text-sm text-muted-foreground">{commission.orderId}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-medium">{formatCurrency(Number(commission.commissionAmount))}</p>
                          <p className="text-sm text-muted-foreground">
                            {new Date(commission.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    ))}
                    
                    {payouts.slice(0, 2).map((payout) => (
                      <div key={payout.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                            <TrendingUp className="h-4 w-4 text-blue-600" />
                          </div>
                          <div>
                            <p className="font-medium">Payout Processed</p>
                            <p className="text-sm text-muted-foreground">{payout.method}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-medium">{formatCurrency(Number(payout.amount))}</p>
                          <p className="text-sm text-muted-foreground">
                            {new Date(payout.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}