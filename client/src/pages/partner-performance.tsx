import { PartnerSidebar } from "@/components/partner/partner-sidebar";
import { PartnerHeader } from "@/components/partner/partner-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { usePartnerAuth } from "@/hooks/use-partner-auth";
import { Partner, Click } from "@shared/schema";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from "recharts";
import { TrendingUp, MousePointer, Users, Calendar } from "lucide-react";
import { formatCurrency } from "@/lib/utils";

export default function PartnerPerformance() {
  const { partner } = usePartnerAuth();

  const { data: partnerData } = useQuery<Partner>({
    queryKey: ["/api/partner/me"],
    enabled: !!partner,
  });

  const { data: clicks } = useQuery<Click[]>({
    queryKey: ["/api/partner/clicks"],
    enabled: !!partner,
  });

  // Mock performance data for charts
  const performanceData = [
    { month: "Jan", clicks: 120, conversions: 8, earnings: 240 },
    { month: "Feb", clicks: 150, conversions: 12, earnings: 360 },
    { month: "Mar", clicks: 180, conversions: 15, earnings: 450 },
    { month: "Apr", clicks: 210, conversions: 18, earnings: 540 },
    { month: "May", clicks: 190, conversions: 16, earnings: 480 },
    { month: "Jun", clicks: 220, conversions: 20, earnings: 600 },
  ];

  const conversionRate = partnerData?.clickCount && partnerData?.conversionCount 
    ? ((partnerData.conversionCount / partnerData.clickCount) * 100).toFixed(2)
    : '0.00';

  return (
    <div className="min-h-screen flex bg-slate-50">
      <PartnerSidebar />
      <div className="flex-1 ml-64">
        <PartnerHeader 
          title="Performance Analytics" 
          subtitle="Detailed insights into your affiliate performance" 
        />
        
        <div className="p-6 space-y-6">
          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Conversion Rate</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{conversionRate}%</div>
                <p className="text-xs text-muted-foreground">
                  Clicks to conversions ratio
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Avg. Commission</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {partnerData?.conversionCount 
                    ? formatCurrency(parseFloat(partnerData?.totalCommissions?.toString() || '0') / partnerData.conversionCount)
                    : formatCurrency(0)
                  }
                </div>
                <p className="text-xs text-muted-foreground">
                  Per successful conversion
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">This Month</CardTitle>
                <Calendar className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {performanceData[performanceData.length - 1]?.clicks || 0}
                </div>
                <p className="text-xs text-muted-foreground">
                  Clicks this month
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Monthly Earnings</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {formatCurrency(performanceData[performanceData.length - 1]?.earnings || 0)}
                </div>
                <p className="text-xs text-muted-foreground">
                  This month's earnings
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Performance Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Click Performance</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={performanceData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Line type="monotone" dataKey="clicks" stroke="#3b82f6" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Conversion Performance</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={performanceData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="conversions" fill="#10b981" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {/* Earnings Chart */}
          <Card>
            <CardHeader>
              <CardTitle>Monthly Earnings</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={performanceData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip formatter={(value) => [formatCurrency(Number(value)), 'Earnings']} />
                  <Line type="monotone" dataKey="earnings" stroke="#f59e0b" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Recent Activity */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Click Activity</CardTitle>
            </CardHeader>
            <CardContent>
              {clicks && clicks.length > 0 ? (
                <div className="space-y-3">
                  {clicks.slice(0, 10).map((click) => (
                    <div key={click.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <MousePointer className="h-5 w-5 text-slate-400" />
                        <div>
                          <div className="text-sm font-medium">
                            {click.convertedAt ? 'Converted' : 'Click'}
                          </div>
                          <div className="text-xs text-slate-500">
                            {new Date(click.createdAt).toLocaleDateString()}
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm text-slate-600">
                          {click.referrer || 'Direct'}
                        </div>
                        {click.convertedAt && (
                          <div className="text-xs text-green-600 font-medium">
                            Conversion
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-slate-500">
                  <MousePointer className="h-12 w-12 mx-auto mb-4 text-slate-300" />
                  <p>No click activity yet</p>
                  <p className="text-sm">Start sharing your referral links to see activity here!</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}