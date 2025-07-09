import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Partner } from "@shared/schema";

interface TopPartner extends Partner {
  monthlyRevenue: number;
  monthlyCommissions: number;
}

export function TopPartners() {
  const { data: partners, isLoading } = useQuery<TopPartner[]>({
    queryKey: ["/api/analytics/top-partners"],
  });

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Top Partners</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <Skeleton key={i} className="h-16 w-full" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(word => word.charAt(0)).join('').toUpperCase();
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Top Partners</CardTitle>
          <Button variant="link" size="sm">View All</Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {partners?.slice(0, 3).map((partner) => (
            <div key={partner.id} className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                  <span className="text-white text-sm font-medium">
                    {getInitials(partner.name)}
                  </span>
                </div>
                <div>
                  <p className="font-medium text-slate-900">{partner.name}</p>
                  <p className="text-sm text-slate-600">{partner.commissionRate}% commission</p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-semibold text-slate-900">
                  {formatCurrency(partner.monthlyRevenue)}
                </p>
                <p className="text-sm text-slate-600">This month</p>
              </div>
            </div>
          ))}
          
          {(!partners || partners.length === 0) && (
            <div className="text-center py-8 text-slate-500">
              No partners found
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
