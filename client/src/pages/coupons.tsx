import { Sidebar } from "@/components/layout/sidebar";
import { Header } from "@/components/layout/header";
import { CouponTable } from "@/components/coupons/coupon-table";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

export default function Coupons() {
  const { toast } = useToast();

  const testToast = () => {
    toast({
      title: "Test Notification",
      description: "This is a test notification to verify the toast system is working.",
    });
  };

  return (
    <div className="min-h-screen flex bg-slate-50">
      <Sidebar />
      <div className="flex-1 ml-64">
        <Header title="Coupon Management" subtitle="Create and manage coupon codes for your partners" />
        
        <div className="p-6">
          <div className="mb-4">
            <Button onClick={testToast} variant="outline" size="sm">
              Test Notification
            </Button>
          </div>
          <CouponTable />
        </div>
      </div>
    </div>
  );
}
