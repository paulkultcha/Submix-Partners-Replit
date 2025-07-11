import { Link, useLocation } from "wouter";
import { Music, BarChart3, Users, Percent, Ticket, DollarSign, FileText, Settings, Key, UserCheck } from "lucide-react";
import { cn } from "@/lib/utils";
import { BrandLogo } from "@/components/ui/brand-logo";

const navigation = [
  { name: "Overview", href: "/", icon: BarChart3 },
  { name: "Partners", href: "/partners", icon: Users },
  { name: "Commissions", href: "/commissions", icon: Percent },
  { name: "Coupons", href: "/coupons", icon: Ticket },
  { name: "Payouts", href: "/payouts", icon: DollarSign },
];

const analytics = [
  { name: "Reports", href: "/reports", icon: FileText },
];

const settings = [
  { name: "User Management", href: "/users", icon: UserCheck },
  { name: "Configuration", href: "/settings", icon: Settings },
  { name: "API Keys", href: "/api-keys", icon: Key },
];

export function Sidebar() {
  const [location] = useLocation();

  return (
    <div className="w-64 bg-secondary text-white fixed h-full z-10">
      <div className="p-6 border-b border-slate-700">
        <div className="flex flex-col items-center space-y-2">
          <BrandLogo variant="white" size="lg" />
          <div>
            <p className="text-xs text-slate-400 text-center">Partner Program</p>
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
          <h2 className="text-xs font-medium text-slate-400 uppercase tracking-wide">Analytics</h2>
        </div>
        <ul className="space-y-1 px-2">
          {analytics.map((item) => {
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
          <h2 className="text-xs font-medium text-slate-400 uppercase tracking-wide">Administration</h2>
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
      </nav>
    </div>
  );
}
