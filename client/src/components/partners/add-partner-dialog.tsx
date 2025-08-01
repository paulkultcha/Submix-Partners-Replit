import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Loader2 } from "lucide-react";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { insertPartnerSchema } from "@shared/schema";
import { z } from "zod";

interface AddPartnerDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const formSchema = insertPartnerSchema.omit({
  referralCode: true,
}).extend({
  commissionRate: z.string().min(1, "Commission rate is required"),
});

export function AddPartnerDialog({ open, onOpenChange }: AddPartnerDialogProps) {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    companyName: "",
    website: "",
    commissionRate: "",
    commissionType: "percentage",
    payoutMethod: "paypal",
    payoutDetails: "",
    status: "pending", // Admin-created partners start as pending for approval
    newCustomersOnly: false,
    commissionPeriodMonths: 12,
    requireCouponUsage: false,
  });
  const [enableCoupon, setEnableCoupon] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const createPartnerMutation = useMutation({
    mutationFn: async (data: any) => {
      const res = await apiRequest("POST", "/api/partners", data);
      if (!res.ok) {
        const errorData = await res.json();
        console.error("API error:", errorData);
        throw new Error(errorData.error || "Failed to create partner");
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/partners"] });
      queryClient.invalidateQueries({ queryKey: ["/api/analytics/dashboard"] });
      toast({
        title: "Success",
        description: "Partner added successfully",
      });
      onOpenChange(false);
      setFormData({
        name: "",
        email: "",
        companyName: "",
        website: "",
        commissionRate: "",
        commissionType: "percentage",
        payoutMethod: "paypal",
        payoutDetails: "",
        status: "pending", // Reset to pending for new partner
        newCustomersOnly: false,
        commissionPeriodMonths: 12,
        requireCouponUsage: false,
      });
      setEnableCoupon(false);
      setErrors({});
    },
    onError: (error: any) => {
      console.error("Mutation error:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to add partner",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    const result = formSchema.safeParse(formData);
    if (!result.success) {
      const newErrors: Record<string, string> = {};
      result.error.errors.forEach(error => {
        if (error.path[0]) {
          newErrors[error.path[0] as string] = error.message;
        }
      });
      setErrors(newErrors);
      return;
    }

    const partnerData = {
      ...formData,
      commissionRate: formData.commissionRate.toString(),
    };



    createPartnerMutation.mutate(partnerData);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add New Partner</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Partner Name</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className={errors.name ? "border-destructive" : ""}
              placeholder="Enter partner name"
            />
            {errors.name && (
              <p className="text-sm text-destructive">{errors.name}</p>
            )}
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className={errors.email ? "border-destructive" : ""}
              placeholder="partner@example.com"
            />
            {errors.email && (
              <p className="text-sm text-destructive">{errors.email}</p>
            )}
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="companyName">Company Name</Label>
            <Input
              id="companyName"
              value={formData.companyName || ""}
              onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
              className={errors.companyName ? "border-destructive" : ""}
              placeholder="Enter company name (optional)"
            />
            {errors.companyName && (
              <p className="text-sm text-destructive">{errors.companyName}</p>
            )}
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="website">Website</Label>
            <Input
              id="website"
              type="url"
              value={formData.website || ""}
              onChange={(e) => setFormData({ ...formData, website: e.target.value })}
              className={errors.website ? "border-destructive" : ""}
              placeholder="https://example.com (optional)"
            />
            {errors.website && (
              <p className="text-sm text-destructive">{errors.website}</p>
            )}
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="commissionRate">Commission Rate (%)</Label>
            <Input
              id="commissionRate"
              type="number"
              step="0.01"
              min="0"
              max="100"
              value={formData.commissionRate}
              onChange={(e) => setFormData({ ...formData, commissionRate: e.target.value })}
              className={errors.commissionRate ? "border-destructive" : ""}
              placeholder="15"
            />
            {errors.commissionRate && (
              <p className="text-sm text-destructive">{errors.commissionRate}</p>
            )}
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="payoutMethod">Payout Method</Label>
            <Select value={formData.payoutMethod} onValueChange={(value) => setFormData({ ...formData, payoutMethod: value })}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="paypal">PayPal</SelectItem>
                <SelectItem value="stripe">Stripe</SelectItem>
                <SelectItem value="manual">Manual</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="flex items-center space-x-2">
            <Checkbox 
              id="enableCoupon" 
              checked={enableCoupon}
              onCheckedChange={setEnableCoupon}
            />
            <Label htmlFor="enableCoupon" className="text-sm">
              Enable coupon code generation
            </Label>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="commissionPeriodMonths">Commission Period (Months)</Label>
            <Input
              id="commissionPeriodMonths"
              type="number"
              value={formData.commissionPeriodMonths}
              onChange={(e) => setFormData({ ...formData, commissionPeriodMonths: parseInt(e.target.value) || 12 })}
              placeholder="12"
              min="1"
              max="60"
            />
          </div>
          
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <Checkbox 
                id="newCustomersOnly" 
                checked={formData.newCustomersOnly}
                onCheckedChange={(checked) => setFormData({ ...formData, newCustomersOnly: !!checked })}
              />
              <Label htmlFor="newCustomersOnly" className="text-sm">
                Pay commissions for new customers only
              </Label>
            </div>
            
            <div className="flex items-center space-x-2">
              <Checkbox 
                id="requireCouponUsage" 
                checked={formData.requireCouponUsage}
                onCheckedChange={(checked) => setFormData({ ...formData, requireCouponUsage: !!checked })}
              />
              <Label htmlFor="requireCouponUsage" className="text-sm">
                Require coupon value to be fully used before paying commissions
              </Label>
            </div>
          </div>
          
          <div className="flex items-center justify-end space-x-3 pt-4">
            <Button 
              type="button" 
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button 
              type="submit"
              disabled={createPartnerMutation.isPending}
            >
              {createPartnerMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Adding...
                </>
              ) : (
                "Add Partner"
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
