import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { PartnerSidebar } from "@/components/partner/partner-sidebar";
import { PartnerHeader } from "@/components/partner/partner-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { usePartnerAuth } from "@/hooks/use-partner-auth";
import { Partner } from "@shared/schema";
import { User, Mail, Building2, Globe, CreditCard, Copy, Eye, EyeOff } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";

export default function PartnerProfile() {
  const { partner } = usePartnerAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isEditing, setIsEditing] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState<Partial<Partner>>({});

  const { data: partnerData, isLoading } = useQuery<Partner>({
    queryKey: ["/api/partner/me"],
    enabled: !!partner,
  });

  const updatePartnerMutation = useMutation({
    mutationFn: async (data: Partial<Partner>) => {
      return await apiRequest("/api/partner/me", "PUT", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/partner/me"] });
      toast({ title: "Profile updated successfully" });
      setIsEditing(false);
    },
    onError: (error) => {
      console.error("Update profile error:", error);
      toast({ title: "Failed to update profile", variant: "destructive" });
    },
  });

  const changePasswordMutation = useMutation({
    mutationFn: async (data: { currentPassword: string; newPassword: string }) => {
      return await apiRequest("/api/partner/change-password", "POST", data);
    },
    onSuccess: () => {
      toast({ title: "Password changed successfully" });
      setFormData({});
    },
    onError: (error) => {
      console.error("Change password error:", error);
      toast({ title: "Failed to change password", variant: "destructive" });
    },
  });

  const handleEditToggle = () => {
    if (isEditing) {
      setFormData({});
    } else {
      setFormData({
        name: partnerData?.name || "",
        email: partnerData?.email || "",
        companyName: partnerData?.companyName || "",
        website: partnerData?.website || "",
        payoutMethod: partnerData?.payoutMethod || "paypal",
        payoutDetails: partnerData?.payoutDetails || "",
      });
    }
    setIsEditing(!isEditing);
  };

  const handleSave = () => {
    updatePartnerMutation.mutate(formData);
  };

  const handlePasswordChange = (e: React.FormEvent) => {
    e.preventDefault();
    const form = e.target as HTMLFormElement;
    const formData = new FormData(form);
    const currentPassword = formData.get("currentPassword") as string;
    const newPassword = formData.get("newPassword") as string;
    const confirmPassword = formData.get("confirmPassword") as string;

    if (newPassword !== confirmPassword) {
      toast({ title: "Passwords do not match", variant: "destructive" });
      return;
    }

    changePasswordMutation.mutate({ currentPassword, newPassword });
  };

  const copyReferralCode = async () => {
    if (!partnerData?.referralCode) return;
    
    try {
      await navigator.clipboard.writeText(partnerData.referralCode);
      toast({ title: "Referral code copied to clipboard" });
    } catch (error) {
      // Fallback for browsers that don't support clipboard API
      const textArea = document.createElement('textarea');
      textArea.value = partnerData.referralCode;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      toast({ title: "Referral code copied to clipboard" });
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active": return "bg-green-100 text-green-800";
      case "pending": return "bg-yellow-100 text-yellow-800";
      case "suspended": return "bg-red-100 text-red-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex bg-slate-50">
        <PartnerSidebar />
        <div className="flex-1 ml-64">
          <PartnerHeader title="Profile" subtitle="Manage your account settings and information" />
          <div className="p-6">
            <div className="animate-pulse">
              <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex bg-slate-50">
      <PartnerSidebar />
      <div className="flex-1 ml-64">
        <PartnerHeader title="Profile" subtitle="Manage your account settings and information" />
        
        <div className="p-6 space-y-6">
          {/* Account Status */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle>Account Status</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Badge className={getStatusColor(partnerData?.status || "pending")}>
                    {partnerData?.status || "pending"}
                  </Badge>
                  <div>
                    <p className="text-sm font-medium">
                      {partnerData?.status === "active" ? "Your account is active" : "Account pending approval"}
                    </p>
                    <p className="text-xs text-gray-600">
                      {partnerData?.status === "active" 
                        ? "You can earn commissions and track performance" 
                        : "Please wait for admin approval to start earning"}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium">Member since</p>
                  <p className="text-xs text-gray-600">
                    {partnerData?.createdAt ? new Date(partnerData.createdAt).toLocaleDateString() : "Unknown"}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Profile Information */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Profile Information</CardTitle>
              <Button
                variant="outline"
                size="sm"
                onClick={handleEditToggle}
                disabled={updatePartnerMutation.isPending}
              >
                {isEditing ? "Cancel" : "Edit"}
              </Button>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">Full Name</Label>
                  {isEditing ? (
                    <Input
                      id="name"
                      value={formData.name || ""}
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                      placeholder="Enter your full name"
                    />
                  ) : (
                    <div className="flex items-center mt-1">
                      <User className="h-4 w-4 text-gray-500 mr-2" />
                      <span>{partnerData?.name || "Not set"}</span>
                    </div>
                  )}
                </div>

                <div>
                  <Label htmlFor="email">Email Address</Label>
                  {isEditing ? (
                    <Input
                      id="email"
                      type="email"
                      value={formData.email || ""}
                      onChange={(e) => setFormData({...formData, email: e.target.value})}
                      placeholder="Enter your email"
                    />
                  ) : (
                    <div className="flex items-center mt-1">
                      <Mail className="h-4 w-4 text-gray-500 mr-2" />
                      <span>{partnerData?.email || "Not set"}</span>
                    </div>
                  )}
                </div>

                <div>
                  <Label htmlFor="companyName">Company Name</Label>
                  {isEditing ? (
                    <Input
                      id="companyName"
                      value={formData.companyName || ""}
                      onChange={(e) => setFormData({...formData, companyName: e.target.value})}
                      placeholder="Enter your company name"
                    />
                  ) : (
                    <div className="flex items-center mt-1">
                      <Building2 className="h-4 w-4 text-gray-500 mr-2" />
                      <span>{partnerData?.companyName || "Not set"}</span>
                    </div>
                  )}
                </div>

                <div>
                  <Label htmlFor="website">Website</Label>
                  {isEditing ? (
                    <Input
                      id="website"
                      value={formData.website || ""}
                      onChange={(e) => setFormData({...formData, website: e.target.value})}
                      placeholder="https://your-website.com"
                    />
                  ) : (
                    <div className="flex items-center mt-1">
                      <Globe className="h-4 w-4 text-gray-500 mr-2" />
                      <span>{partnerData?.website || "Not set"}</span>
                    </div>
                  )}
                </div>
              </div>

              {isEditing && (
                <div className="flex justify-end space-x-2 pt-4">
                  <Button
                    variant="outline"
                    onClick={handleEditToggle}
                    disabled={updatePartnerMutation.isPending}
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleSave}
                    disabled={updatePartnerMutation.isPending}
                  >
                    {updatePartnerMutation.isPending ? "Saving..." : "Save Changes"}
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Referral Information */}
          <Card>
            <CardHeader>
              <CardTitle>Referral Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>Referral Code</Label>
                  <div className="flex items-center space-x-2 mt-1">
                    <Badge variant="outline" className="text-lg px-3 py-1">
                      {partnerData?.referralCode}
                    </Badge>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={copyReferralCode}
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                <div>
                  <Label>Commission Rate</Label>
                  <div className="flex items-center mt-1">
                    <Badge variant="secondary" className="text-lg">
                      {partnerData?.commissionRate}%
                    </Badge>
                    <span className="text-sm text-gray-600 ml-2">
                      {partnerData?.commissionType === 'percentage' ? 'of each sale' : 'per conversion'}
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Payout Settings */}
          <Card>
            <CardHeader>
              <CardTitle>Payout Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="payoutMethod">Payout Method</Label>
                  {isEditing ? (
                    <Select
                      value={formData.payoutMethod || "paypal"}
                      onValueChange={(value) => setFormData({...formData, payoutMethod: value})}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select payout method" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="paypal">PayPal</SelectItem>
                        <SelectItem value="stripe">Stripe</SelectItem>
                        <SelectItem value="bank">Bank Transfer</SelectItem>
                      </SelectContent>
                    </Select>
                  ) : (
                    <div className="flex items-center mt-1">
                      <CreditCard className="h-4 w-4 text-gray-500 mr-2" />
                      <span className="capitalize">{partnerData?.payoutMethod || "Not set"}</span>
                    </div>
                  )}
                </div>

                <div>
                  <Label htmlFor="payoutDetails">Payout Details</Label>
                  {isEditing ? (
                    <Textarea
                      id="payoutDetails"
                      value={formData.payoutDetails || ""}
                      onChange={(e) => setFormData({...formData, payoutDetails: e.target.value})}
                      placeholder="Enter payout details (email, account number, etc.)"
                    />
                  ) : (
                    <div className="mt-1">
                      <span className="text-sm text-gray-600">
                        {partnerData?.payoutDetails || "Not set"}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Change Password */}
          <Card>
            <CardHeader>
              <CardTitle>Change Password</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handlePasswordChange} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="currentPassword">Current Password</Label>
                    <div className="relative">
                      <Input
                        id="currentPassword"
                        name="currentPassword"
                        type={showPassword ? "text" : "password"}
                        required
                        placeholder="Enter current password"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-full px-3 py-2"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </Button>
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="newPassword">New Password</Label>
                    <Input
                      id="newPassword"
                      name="newPassword"
                      type={showPassword ? "text" : "password"}
                      required
                      placeholder="Enter new password"
                    />
                  </div>

                  <div>
                    <Label htmlFor="confirmPassword">Confirm Password</Label>
                    <Input
                      id="confirmPassword"
                      name="confirmPassword"
                      type={showPassword ? "text" : "password"}
                      required
                      placeholder="Confirm new password"
                    />
                  </div>
                </div>

                <div className="flex justify-end">
                  <Button
                    type="submit"
                    disabled={changePasswordMutation.isPending}
                  >
                    {changePasswordMutation.isPending ? "Changing..." : "Change Password"}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}