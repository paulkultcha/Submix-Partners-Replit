import { usePartnerAuth } from "@/hooks/use-partner-auth";
import { Redirect } from "wouter";
import { Skeleton } from "@/components/ui/skeleton";
import { ComponentType } from "react";

interface PartnerProtectedRouteProps {
  path: string;
  component: ComponentType<any>;
}

export function PartnerProtectedRoute({
  path,
  component: Component,
}: PartnerProtectedRouteProps) {
  const { partner, isLoading } = usePartnerAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="space-y-4">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-64 w-96" />
        </div>
      </div>
    );
  }

  if (!partner) {
    return <Redirect to="/partner/auth" />;
  }

  return <Component />;
}