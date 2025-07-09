import { Sidebar } from "@/components/layout/sidebar";
import { Header } from "@/components/layout/header";
import { StatsCards } from "@/components/dashboard/stats-cards";
import { RevenueChart } from "@/components/dashboard/revenue-chart";
import { TopPartners } from "@/components/dashboard/top-partners";
import { PartnerTable } from "@/components/partners/partner-table";
import { CouponTable } from "@/components/coupons/coupon-table";

export default function Dashboard() {
  return (
    <div className="min-h-screen flex bg-slate-50">
      <Sidebar />
      <div className="flex-1 ml-64">
        <Header title="Affiliate Dashboard" subtitle="Manage your affiliate program and track performance" />
        
        <div className="p-6">
          <StatsCards />
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            <RevenueChart />
            <TopPartners />
          </div>

          <div className="space-y-6">
            <PartnerTable />
            <CouponTable />
          </div>
        </div>
      </div>
    </div>
  );
}
