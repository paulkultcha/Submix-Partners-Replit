import { PartnerSidebar } from "@/components/partner/partner-sidebar";
import { PartnerHeader } from "@/components/partner/partner-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useQuery } from "@tanstack/react-query";
import { usePartnerAuth } from "@/hooks/use-partner-auth";
import { Payout } from "@shared/schema";
import { useState } from "react";
import { formatCurrency } from "@/lib/utils";
import { Search, DollarSign, Clock, CheckCircle, AlertCircle, Calendar } from "lucide-react";

export default function PartnerPayouts() {
  const { partner } = usePartnerAuth();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const { data: payouts } = useQuery<Payout[]>({
    queryKey: ["/api/partner/payouts"],
    enabled: !!partner,
  });

  const filteredPayouts = payouts?.filter(payout => {
    const matchesSearch = payout.id.toString().includes(searchTerm) ||
                         payout.amount.toString().includes(searchTerm);
    const matchesStatus = statusFilter === "all" || payout.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const totalPayouts = payouts?.reduce((sum, p) => sum + parseFloat(p.amount.toString()), 0) || 0;
  const pendingPayouts = payouts?.filter(p => p.status === 'pending').reduce((sum, p) => sum + parseFloat(p.amount.toString()), 0) || 0;
  const processedPayouts = payouts?.filter(p => p.status === 'processed').reduce((sum, p) => sum + parseFloat(p.amount.toString()), 0) || 0;
  const failedPayouts = payouts?.filter(p => p.status === 'failed').reduce((sum, p) => sum + parseFloat(p.amount.toString()), 0) || 0;

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock className="h-4 w-4 text-yellow-500" />;
      case 'processed':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'failed':
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      default:
        return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'secondary';
      case 'processed':
        return 'default';
      case 'failed':
        return 'destructive';
      default:
        return 'outline';
    }
  };

  return (
    <div className="min-h-screen flex bg-slate-50">
      <PartnerSidebar />
      <div className="flex-1 ml-64">
        <PartnerHeader 
          title="Payouts" 
          subtitle="Track your payout history and payment status" 
        />
        
        <div className="p-6 space-y-6">
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Payouts</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatCurrency(totalPayouts)}</div>
                <p className="text-xs text-muted-foreground">
                  All-time payouts
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Pending</CardTitle>
                <Clock className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatCurrency(pendingPayouts)}</div>
                <p className="text-xs text-muted-foreground">
                  Awaiting processing
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Processed</CardTitle>
                <CheckCircle className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatCurrency(processedPayouts)}</div>
                <p className="text-xs text-muted-foreground">
                  Successfully paid
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Failed</CardTitle>
                <AlertCircle className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatCurrency(failedPayouts)}</div>
                <p className="text-xs text-muted-foreground">
                  Failed payments
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Request Payout Section */}
          <Card>
            <CardHeader>
              <CardTitle>Request Payout</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                <div className="flex items-center space-x-3 mb-3">
                  <DollarSign className="h-6 w-6 text-blue-600" />
                  <div>
                    <h3 className="font-medium text-blue-900">Available Balance</h3>
                    <p className="text-2xl font-bold text-blue-900">{formatCurrency(150.00)}</p>
                  </div>
                </div>
                <p className="text-sm text-blue-700 mb-4">
                  You can request a payout for your available commission balance. Minimum payout amount is $50.
                </p>
                <Button className="bg-blue-600 hover:bg-blue-700">
                  Request Payout
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Payout History */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Payout History</CardTitle>
                <div className="flex items-center space-x-4">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <Input
                      placeholder="Search payouts..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-9 w-64"
                    />
                  </div>
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="processed">Processed</SelectItem>
                      <SelectItem value="failed">Failed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-slate-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                        Payout ID
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                        Amount
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                        Method
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                        Requested Date
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                        Processed Date
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {!payouts || payouts.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="px-6 py-12 text-center text-slate-500">
                          <DollarSign className="h-12 w-12 mx-auto mb-4 text-slate-300" />
                          <p className="text-lg font-medium">No payouts yet</p>
                          <p className="text-sm">Your payout history will appear here once you request your first payout.</p>
                        </td>
                      </tr>
                    ) : (
                      filteredPayouts?.map((payout) => (
                        <tr key={payout.id} className="hover:bg-slate-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-slate-900">
                              #{payout.id}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-slate-900">
                              {formatCurrency(parseFloat(payout.amount.toString()))}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-slate-900">
                              {payout.method || 'Bank Transfer'}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center space-x-2">
                              {getStatusIcon(payout.status)}
                              <Badge variant={getStatusColor(payout.status) as any}>
                                {payout.status}
                              </Badge>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900">
                            {new Date(payout.requestedAt).toLocaleDateString()}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900">
                            {payout.processedAt 
                              ? new Date(payout.processedAt).toLocaleDateString()
                              : '-'
                            }
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}