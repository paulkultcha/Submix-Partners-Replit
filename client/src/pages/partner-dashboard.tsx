import { PartnerSidebar } from "@/components/partner/partner-sidebar";
import { PartnerHeader } from "@/components/partner/partner-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { usePartnerAuth } from "@/hooks/use-partner-auth";
import { Partner, Commission } from "@shared/schema";
import { TrendingUp, DollarSign, Users, Eye, Copy, ExternalLink } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { formatCurrency } from "@/lib/utils";

export default function PartnerDashboard() {
  const { partner } = usePartnerAuth();
  const { toast } = useToast();

  const { data: partnerData } = useQuery<Partner>({
    queryKey: ["/api/partner/me"],
    enabled: !!partner,
  });

  const { data: commissions } = useQuery<Commission[]>({
    queryKey: ["/api/partner/commissions"],
    enabled: !!partner,
  });

  const copyReferralCode = () => {
    if (partnerData?.referralCode) {
      navigator.clipboard.writeText(partnerData.referralCode);
      toast({
        title: "Success",
        description: "Referral code copied to clipboard",
      });
    }
  };

  const copyReferralLink = () => {
    if (partnerData?.referralCode) {
      const referralLink = `${window.location.origin}/refer/${partnerData.referralCode}`;
      navigator.clipboard.writeText(referralLink);
      toast({
        title: "Success",
        description: "Referral link copied to clipboard",
      });
    }
  };

  const pendingCommissions = commissions?.filter(c => c.status === 'pending') || [];
  const approvedCommissions = commissions?.filter(c => c.status === 'approved') || [];
  const pendingEarnings = pendingCommissions.reduce((sum, c) => sum + parseFloat(c.commissionAmount.toString()), 0);
  const approvedEarnings = approvedCommissions.reduce((sum, c) => sum + parseFloat(c.commissionAmount.toString()), 0);

  return (
    <div className="min-h-screen flex bg-slate-50">
      <PartnerSidebar />
      <div className="flex-1 ml-64">
        <PartnerHeader 
          title="Dashboard" 
          subtitle="Welcome back! Here's an overview of your affiliate performance" 
        />
        
        <div className="p-6 space-y-6">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Clicks</CardTitle>
                <Eye className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{partnerData?.clickCount || 0}</div>
                <p className="text-xs text-muted-foreground">
                  Lifetime clicks on your referral links
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Conversions</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{partnerData?.conversionCount || 0}</div>
                <p className="text-xs text-muted-foreground">
                  Total successful conversions
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Pending Earnings</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatCurrency(pendingEarnings)}</div>
                <p className="text-xs text-muted-foreground">
                  Awaiting approval
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Earnings</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {formatCurrency(parseFloat(partnerData?.totalCommissions?.toString() || '0'))}
                </div>
                <p className="text-xs text-muted-foreground">
                  All-time commission earnings
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Referral Tools */}
          <Card>
            <CardHeader>
              <CardTitle>Your Referral Tools</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <h3 className="font-medium">Referral Code</h3>
                    <p className="text-sm text-slate-600">Use this code in your marketing materials</p>
                  </div>
                  <Badge variant="outline" className="text-lg px-3 py-1">
                    {partnerData?.referralCode}
                  </Badge>
                </div>
                <div className="flex space-x-2">
                  <Button variant="outline" size="sm" onClick={copyReferralCode}>
                    <Copy className="mr-2 h-4 w-4" />
                    Copy Code
                  </Button>
                  <Button variant="outline" size="sm" onClick={copyReferralLink}>
                    <ExternalLink className="mr-2 h-4 w-4" />
                    Copy Link
                  </Button>
                </div>
              </div>

              <div className="bg-slate-50 p-4 rounded-lg">
                <h4 className="font-medium mb-2">Commission Rate</h4>
                <div className="flex items-center space-x-2">
                  <Badge variant="secondary" className="text-lg">
                    {partnerData?.commissionRate}%
                  </Badge>
                  <span className="text-sm text-slate-600">
                    {partnerData?.commissionType === 'percentage' ? 'of each sale' : 'per conversion'}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Recent Activity */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Commissions</CardTitle>
            </CardHeader>
            <CardContent>
              {commissions && commissions.length > 0 ? (
                <div className="space-y-3">
                  {commissions.slice(0, 5).map((commission) => (
                    <div key={commission.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                      <div>
                        <div className="font-medium">Order #{commission.orderId}</div>
                        <div className="text-sm text-slate-600">{commission.customerEmail}</div>
                      </div>
                      <div className="text-right">
                        <div className="font-medium">{formatCurrency(parseFloat(commission.commissionAmount.toString()))}</div>
                        <Badge
                          variant={
                            commission.status === "approved" ? "default" :
                            commission.status === "pending" ? "secondary" :
                            commission.status === "paid" ? "default" : "outline"
                          }
                          className="text-xs"
                        >
                          {commission.status}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-slate-500">
                  <p>No commissions yet</p>
                  <p className="text-sm">Start sharing your referral code to earn commissions!</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}