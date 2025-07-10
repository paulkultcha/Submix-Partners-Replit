import { Link, useLocation } from "wouter";
import { Music, BarChart3, Percent, DollarSign, FileText, Settings, LogOut, Home } from "lucide-react";
import { cn } from "@/lib/utils";
import { usePartnerAuth } from "@/hooks/use-partner-auth";
import { Button } from "@/components/ui/button";

const navigation = [
  { name: "Dashboard", href: "/partner/dashboard", icon: Home },
  { name: "Performance", href: "/partner/performance", icon: BarChart3 },
  { name: "Commissions", href: "/partner/commissions", icon: Percent },
  { name: "Payouts", href: "/partner/payouts", icon: DollarSign },
  { name: "Reports", href: "/partner/reports", icon: FileText },
];

const settings = [
  { name: "Profile", href: "/partner/profile", icon: Settings },
];

export function PartnerSidebar() {
  const [location] = useLocation();
  const { partner, logoutMutation } = usePartnerAuth();

  const handleLogout = () => {
    logoutMutation.mutate();
  };

  return (
    <div className="w-64 bg-secondary text-white fixed h-full z-10">
      <div className="p-6 border-b border-slate-700">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
            <Music className="text-white text-sm" />
          </div>
          <div>
            <h1 className="text-lg font-semibold">Submix</h1>
            <p className="text-xs text-slate-400">Partner Portal</p>
          </div>
        </div>
      </div>

      <div className="p-4 border-b border-slate-700">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
            <span className="text-white text-sm font-medium">
              {partner?.name?.split(' ').map(word => word.charAt(0)).join('').toUpperCase()}
            </span>
          </div>
          <div>
            <div className="text-sm font-medium text-white">{partner?.name}</div>
            <div className="text-xs text-slate-400">{partner?.email}</div>
          </div>
        </div>
      </div>
      
      <nav className="mt-6">
        <div className="px-4 mb-4">
          <h2 className="text-xs font-medium text-slate-400 uppercase tracking-wide">Dashboard</h2>
        </div>
        <ul className="space-y-1 px-2">
          {navigation.map((item) => {
            const Icon = item.icon;
            return (
              <li key={item.name}>
                <Link href={item.href}>
                  <div className={cn(
                    "flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors cursor-pointer",
                    location === item.href
                      ? "bg-primary text-white"
                      : "text-slate-300 hover:bg-slate-700 hover:text-white"
                  )}>
                    <Icon className="w-5 h-5 mr-3" />
                    {item.name}
                  </div>
                </Link>
              </li>
            );
          })}
        </ul>
        
        <div className="px-4 mt-8 mb-4">
          <h2 className="text-xs font-medium text-slate-400 uppercase tracking-wide">Settings</h2>
        </div>
        <ul className="space-y-1 px-2">
          {settings.map((item) => {
            const Icon = item.icon;
            return (
              <li key={item.name}>
                <Link href={item.href}>
                  <div className={cn(
                    "flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors cursor-pointer",
                    location === item.href
                      ? "bg-primary text-white"
                      : "text-slate-300 hover:bg-slate-700 hover:text-white"
                  )}>
                    <Icon className="w-5 h-5 mr-3" />
                    {item.name}
                  </div>
                </Link>
              </li>
            );
          })}
        </ul>

        <div className="px-2 mt-8">
          <Button
            variant="ghost"
            className="w-full justify-start text-slate-300 hover:bg-slate-700 hover:text-white"
            onClick={handleLogout}
            disabled={logoutMutation.isPending}
          >
            <LogOut className="w-5 h-5 mr-3" />
            Sign Out
          </Button>
        </div>
      </nav>
    </div>
  );
}