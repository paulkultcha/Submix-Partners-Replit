import { useState, useEffect } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2 } from "lucide-react";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { insertCouponSchema, Partner, Coupon } from "@shared/schema";
import { z } from "zod";

interface EditCouponDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  coupon: Coupon | null;
}

const formSchema = insertCouponSchema.extend({
  partnerId: z.string().min(1, "Partner is required"),
  discountValue: z.string().min(1, "Discount value is required"),
  usageLimit: z.string().optional(),
});

export function EditCouponDialog({ open, onOpenChange, coupon }: EditCouponDialogProps) {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    code: "",
    partnerId: "",
    discountType: "percentage",
    discountValue: "",
    usageLimit: "",
    status: "active",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const { data: partners } = useQuery<Partner[]>({
    queryKey: ["/api/partners"],
  });

  // Update form data when coupon changes
  useEffect(() => {
    if (coupon) {
      setFormData({
        code: coupon.code,
        partnerId: coupon.partnerId.toString(),
        discountType: coupon.discountType,
        discountValue: coupon.discountValue.toString(),
        usageLimit: coupon.usageLimit ? coupon.usageLimit.toString() : "",
        status: coupon.status,
      });
    }
  }, [coupon]);

  const editCouponMutation = useMutation({
    mutationFn: async (data: any) => {
      if (!coupon) throw new Error("No coupon to edit");
      const res = await apiRequest("PUT", `/api/coupons/${coupon.id}`, data);
      if (!res.ok) {
        const errorData = await res.json();
        console.error("API error:", errorData);
        throw new Error(errorData.error || "Failed to update coupon");
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/coupons"] });
      toast({
        title: "Success",
        description: "Coupon updated successfully",
      });
      onOpenChange(false);
      setErrors({});
    },
    onError: (error: any) => {
      console.error("Mutation error:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to update coupon",
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

    const couponData = {
      ...formData,
      partnerId: parseInt(formData.partnerId),
      discountValue: formData.discountValue.toString(),
      usageLimit: formData.usageLimit ? parseInt(formData.usageLimit) : null,
    };


    editCouponMutation.mutate(couponData);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Edit Coupon</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="code">Coupon Code</Label>
            <Input
              id="code"
              value={formData.code}
              onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
              className={errors.code ? "border-destructive" : ""}
              placeholder="Enter coupon code"
            />
            {errors.code && (
              <p className="text-sm text-destructive">{errors.code}</p>
            )}
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="partnerId">Partner</Label>
            <Select value={formData.partnerId} onValueChange={(value) => setFormData({ ...formData, partnerId: value })}>
              <SelectTrigger className={errors.partnerId ? "border-destructive" : ""}>
                <SelectValue placeholder="Select a partner" />
              </SelectTrigger>
              <SelectContent>
                {partners?.map((partner) => (
                  <SelectItem key={partner.id} value={partner.id.toString()}>
                    {partner.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.partnerId && (
              <p className="text-sm text-destructive">{errors.partnerId}</p>
            )}
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="discountType">Discount Type</Label>
            <Select value={formData.discountType} onValueChange={(value) => setFormData({ ...formData, discountType: value })}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="percentage">Percentage</SelectItem>
                <SelectItem value="fixed">Fixed Amount</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="discountValue">
              Discount Value {formData.discountType === "percentage" ? "(%)" : "($)"}
            </Label>
            <Input
              id="discountValue"
              type="number"
              step="0.01"
              min="0"
              max={formData.discountType === "percentage" ? "100" : undefined}
              value={formData.discountValue}
              onChange={(e) => setFormData({ ...formData, discountValue: e.target.value })}
              className={errors.discountValue ? "border-destructive" : ""}
              placeholder={formData.discountType === "percentage" ? "20" : "10.00"}
            />
            {errors.discountValue && (
              <p className="text-sm text-destructive">{errors.discountValue}</p>
            )}
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="usageLimit">Usage Limit (optional)</Label>
            <Input
              id="usageLimit"
              type="number"
              min="1"
              value={formData.usageLimit}
              onChange={(e) => setFormData({ ...formData, usageLimit: e.target.value })}
              placeholder="Unlimited"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="status">Status</Label>
            <Select value={formData.status} onValueChange={(value) => setFormData({ ...formData, status: value })}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
                <SelectItem value="expired">Expired</SelectItem>
              </SelectContent>
            </Select>
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
              disabled={editCouponMutation.isPending}
            >
              {editCouponMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Updating...
                </>
              ) : (
                "Update Coupon"
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}