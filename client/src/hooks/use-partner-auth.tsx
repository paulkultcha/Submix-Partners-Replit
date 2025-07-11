import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { useQuery, useMutation, UseMutationResult } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Partner } from "@shared/schema";
import { apiRequest, queryClient } from "@/lib/queryClient";

type PartnerAuthContextType = {
  partner: Partner | null;
  isLoading: boolean;
  error: Error | null;
  loginMutation: UseMutationResult<Partner, Error, PartnerLoginData>;
  logoutMutation: UseMutationResult<void, Error, void>;
  registerMutation: UseMutationResult<Partner, Error, PartnerRegisterData>;
};

type PartnerLoginData = {
  email: string;
  password: string;
};

type PartnerRegisterData = {
  name: string;
  email: string;
  companyName?: string;
  website?: string;
  password: string;
};

export const PartnerAuthContext = createContext<PartnerAuthContextType | null>(null);

export function PartnerAuthProvider({ children }: { children: ReactNode }) {
  const [, navigate] = useLocation();
  const [partner, setPartner] = useState<Partner | null>(null);

  const { data, isLoading, error } = useQuery<Partner>({
    queryKey: ["/api/partner/me"],
    retry: false,
  });

  useEffect(() => {
    if (data) {
      setPartner(data);
    }
  }, [data]);

  const loginMutation = useMutation({
    mutationFn: async (credentials: PartnerLoginData) => {
      const response = await apiRequest("POST", "/api/partner/login", credentials);
      return response;
    },
    onSuccess: (partner: Partner) => {
      setPartner(partner);
      queryClient.setQueryData(["/api/partner/me"], partner);
      navigate("/partner/dashboard");
    },
    onError: (error: Error) => {
      console.error("Login failed:", error);
    },
  });

  const registerMutation = useMutation({
    mutationFn: async (credentials: PartnerRegisterData) => {
      const response = await apiRequest("POST", "/api/partner/register", credentials);
      return response;
    },
    onSuccess: (partner: Partner) => {
      setPartner(partner);
      queryClient.setQueryData(["/api/partner/me"], partner);
      navigate("/partner/dashboard");
    },
    onError: (error: Error) => {
      console.error("Registration failed:", error);
    },
  });

  const logoutMutation = useMutation({
    mutationFn: async () => {
      await apiRequest("POST", "/api/partner/logout");
    },
    onSuccess: () => {
      setPartner(null);
      queryClient.setQueryData(["/api/partner/me"], null);
      navigate("/partner/auth");
    },
    onError: (error: Error) => {
      console.error("Logout failed:", error);
    },
  });

  return (
    <PartnerAuthContext.Provider
      value={{
        partner,
        isLoading,
        error,
        loginMutation,
        logoutMutation,
        registerMutation,
      }}
    >
      {children}
    </PartnerAuthContext.Provider>
  );
}

export function usePartnerAuth() {
  const context = useContext(PartnerAuthContext);
  if (!context) {
    throw new Error("usePartnerAuth must be used within a PartnerAuthProvider");
  }
  return context;
}