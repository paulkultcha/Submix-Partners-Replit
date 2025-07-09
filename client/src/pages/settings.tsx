import { Sidebar } from "@/components/layout/sidebar";
import { Header } from "@/components/layout/header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";

export default function Settings() {
  return (
    <div className="min-h-screen flex bg-slate-50">
      <Sidebar />
      <div className="flex-1 ml-64">
        <Header title="Settings" subtitle="Configure your affiliate program settings" />
        
        <div className="p-6 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>General Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="program-name">Program Name</Label>
                <Input id="program-name" defaultValue="Submix Affiliate Program" />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="default-commission">Default Commission Rate (%)</Label>
                <Input id="default-commission" type="number" defaultValue="15" />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="cookie-duration">Cookie Duration (days)</Label>
                <Input id="cookie-duration" type="number" defaultValue="30" />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="grace-period">Grace Period (days)</Label>
                <Input id="grace-period" type="number" defaultValue="7" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Payment Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="minimum-payout">Minimum Payout Amount</Label>
                <Input id="minimum-payout" type="number" defaultValue="50" />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="payout-frequency">Payout Frequency</Label>
                <Select defaultValue="monthly">
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="weekly">Weekly</SelectItem>
                    <SelectItem value="biweekly">Bi-weekly</SelectItem>
                    <SelectItem value="monthly">Monthly</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="flex items-center space-x-2">
                <Switch id="auto-approve" />
                <Label htmlFor="auto-approve">Auto-approve commissions</Label>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>API Configuration</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="webhook-url">Webhook URL</Label>
                <Input id="webhook-url" placeholder="https://your-site.com/webhook" />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="api-key">API Key</Label>
                <Input id="api-key" type="password" placeholder="••••••••••••••••" />
              </div>
              
              <div className="flex items-center space-x-2">
                <Switch id="enable-tracking" defaultChecked />
                <Label htmlFor="enable-tracking">Enable referral tracking</Label>
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-end space-x-4">
            <Button variant="outline">Cancel</Button>
            <Button>Save Settings</Button>
          </div>
        </div>
      </div>
    </div>
  );
}
