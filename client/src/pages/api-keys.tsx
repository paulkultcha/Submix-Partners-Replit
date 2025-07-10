import { Sidebar } from "@/components/layout/sidebar";
import { Header } from "@/components/layout/header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Copy, Eye, EyeOff, Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

export default function ApiKeys() {
  const [showKeys, setShowKeys] = useState<{[key: string]: boolean}>({});
  const { toast } = useToast();

  // Mock API keys data - in a real app, this would come from your backend
  const apiKeys = [
    {
      id: "1",
      name: "Production API Key",
      key: "ak_live_abcdef1234567890",
      status: "active",
      created: "2024-01-15",
      lastUsed: "2024-01-20",
    },
    {
      id: "2", 
      name: "Development API Key",
      key: "ak_test_xyz789abcdef1234",
      status: "active",
      created: "2024-01-10",
      lastUsed: "2024-01-19",
    },
  ];

  const toggleKeyVisibility = (keyId: string) => {
    setShowKeys(prev => ({
      ...prev,
      [keyId]: !prev[keyId]
    }));
  };

  const copyToClipboard = (key: string) => {
    navigator.clipboard.writeText(key);
    toast({
      title: "Success",
      description: "API key copied to clipboard",
    });
  };

  const maskKey = (key: string) => {
    return key.substring(0, 12) + "•".repeat(key.length - 16) + key.substring(key.length - 4);
  };

  return (
    <div className="min-h-screen flex bg-slate-50">
      <Sidebar />
      <div className="flex-1 ml-64">
        <Header title="API Keys" subtitle="Manage your API keys for external integrations" />
        
        <div className="p-6 space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-xl font-semibold text-slate-900">API Keys</h2>
              <p className="text-sm text-slate-600 mt-1">
                Use these keys to authenticate API requests to your affiliate program
              </p>
            </div>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Generate New Key
            </Button>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Active API Keys</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {apiKeys.map((apiKey) => (
                  <div key={apiKey.id} className="border rounded-lg p-4 space-y-3">
                    <div className="flex justify-between items-start">
                      <div className="space-y-1">
                        <h3 className="font-medium text-slate-900">{apiKey.name}</h3>
                        <div className="flex items-center space-x-2">
                          <Badge
                            variant={apiKey.status === "active" ? "default" : "secondary"}
                          >
                            {apiKey.status}
                          </Badge>
                          <span className="text-sm text-slate-500">
                            Created: {apiKey.created}
                          </span>
                          <span className="text-sm text-slate-500">
                            Last used: {apiKey.lastUsed}
                          </span>
                        </div>
                      </div>
                      <div className="flex space-x-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => toggleKeyVisibility(apiKey.id)}
                        >
                          {showKeys[apiKey.id] ? (
                            <EyeOff className="h-4 w-4" />
                          ) : (
                            <Eye className="h-4 w-4" />
                          )}
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => copyToClipboard(apiKey.key)}
                        >
                          <Copy className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm" className="text-red-600">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    <div className="bg-slate-50 p-3 rounded border">
                      <code className="text-sm font-mono">
                        {showKeys[apiKey.id] ? apiKey.key : maskKey(apiKey.key)}
                      </code>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>API Documentation</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h3 className="font-medium text-slate-900 mb-2">Authentication</h3>
                  <p className="text-sm text-slate-600 mb-3">
                    Include your API key in the Authorization header:
                  </p>
                  <div className="bg-slate-50 p-3 rounded border">
                    <code className="text-sm font-mono">
                      Authorization: Bearer YOUR_API_KEY
                    </code>
                  </div>
                </div>

                <div>
                  <h3 className="font-medium text-slate-900 mb-2">Example Request</h3>
                  <p className="text-sm text-slate-600 mb-3">
                    Track a conversion using the API:
                  </p>
                  <div className="bg-slate-50 p-3 rounded border">
                    <code className="text-sm font-mono whitespace-pre-wrap">
{`curl -X POST https://your-domain.com/api/track-conversion \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{
    "referral_code": "PARTNER123",
    "order_id": "order_456",
    "order_value": 99.99,
    "customer_email": "customer@example.com"
  }'`}
                    </code>
                  </div>
                </div>

                <div>
                  <h3 className="font-medium text-slate-900 mb-2">Rate Limits</h3>
                  <p className="text-sm text-slate-600">
                    API requests are limited to 1000 requests per hour per API key.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}