import { Sidebar } from "@/components/layout/sidebar";
import { Header } from "@/components/layout/header";
import { CouponTable } from "@/components/coupons/coupon-table";

export default function Coupons() {
  return (
    <div className="min-h-screen flex bg-slate-50">
      <Sidebar />
      <div className="flex-1 ml-64">
        <Header title="Coupon Management" subtitle="Create and manage coupon codes for your partners" />
        
        <div className="p-6">
          <CouponTable />
        </div>
      </div>
    </div>
  );
}
