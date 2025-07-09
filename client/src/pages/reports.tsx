import { Sidebar } from "@/components/layout/sidebar";
import { Header } from "@/components/layout/header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";

export default function Reports() {
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
                <Button className="w-full">
                  <Download className="mr-2 h-4 w-4" />
                  Export Partner Report
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
                <Button className="w-full">
                  <Download className="mr-2 h-4 w-4" />
                  Export Commission Report
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
                <Button className="w-full">
                  <Download className="mr-2 h-4 w-4" />
                  Export Coupon Report
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
                <Button className="w-full">
                  <Download className="mr-2 h-4 w-4" />
                  Export Payout Report
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
