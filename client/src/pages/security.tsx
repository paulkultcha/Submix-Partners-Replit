import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { AlertTriangle, Shield, Eye, FileText, Clock, CheckCircle, XCircle, AlertCircle } from "lucide-react";
import { format } from "date-fns";
import { apiRequest } from "@/lib/queryClient";

interface FraudAlert {
  id: number;
  partnerId?: number;
  alertType: string;
  severity: string;
  status: string;
  description: string;
  metadata?: string;
  investigatedBy?: number;
  investigationNotes?: string;
  resolvedAt?: string;
  createdAt: string;
  updatedAt: string;
}

interface FraudRule {
  id: number;
  name: string;
  description: string;
  ruleType: string;
  conditions: string;
  threshold: number;
  timeWindow: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

interface DataRequest {
  id: number;
  partnerId?: number;
  requestType: string;
  status: string;
  requestDetails?: string;
  responseData?: string;
  processedBy?: number;
  processedAt?: string;
  createdAt: string;
  updatedAt: string;
}

interface AuditLog {
  id: number;
  userId?: number;
  partnerId?: number;
  action: string;
  entityType: string;
  entityId?: number;
  description: string;
  ipAddress?: string;
  userAgent?: string;
  previousValues?: string;
  newValues?: string;
  metadata?: string;
  createdAt: string;
}

interface SystemEvent {
  id: number;
  eventType: string;
  severity: string;
  description: string;
  metadata?: string;
  createdAt: string;
}

export default function SecurityPage() {
  const [selectedAlert, setSelectedAlert] = useState<FraudAlert | null>(null);
  const [selectedRequest, setSelectedRequest] = useState<DataRequest | null>(null);
  const [newAlertDialog, setNewAlertDialog] = useState(false);
  const [newRuleDialog, setNewRuleDialog] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fraud Detection Queries
  const { data: fraudAlerts = [], isLoading: alertsLoading } = useQuery<FraudAlert[]>({
    queryKey: ["/api/fraud/alerts"],
  });

  const { data: fraudRules = [], isLoading: rulesLoading } = useQuery<FraudRule[]>({
    queryKey: ["/api/fraud/rules"],
  });

  // GDPR Compliance Queries
  const { data: dataRequests = [], isLoading: requestsLoading } = useQuery<DataRequest[]>({
    queryKey: ["/api/gdpr/data-requests"],
  });

  // Audit Trail Queries
  const { data: auditLogs = [], isLoading: logsLoading } = useQuery<AuditLog[]>({
    queryKey: ["/api/audit/logs"],
  });

  const { data: systemEvents = [], isLoading: eventsLoading } = useQuery<SystemEvent[]>({
    queryKey: ["/api/audit/system-events"],
  });

  // Mutations for fraud alerts
  const updateAlertMutation = useMutation({
    mutationFn: async (data: { id: number; updates: Partial<FraudAlert> }) => {
      return await apiRequest(`/api/fraud/alerts/${data.id}`, "PUT", data.updates);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/fraud/alerts"] });
      toast({ title: "Alert updated successfully" });
    },
    onError: (error) => {
      console.error("Update alert error:", error);
      toast({ title: "Failed to update alert", variant: "destructive" });
    },
  });

  const createAlertMutation = useMutation({
    mutationFn: async (data: Partial<FraudAlert>) => {
      return await apiRequest("/api/fraud/alerts", "POST", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/fraud/alerts"] });
      toast({ title: "Alert created successfully" });
      setNewAlertDialog(false);
    },
    onError: (error) => {
      console.error("Create alert error:", error);
      toast({ title: "Failed to create alert", variant: "destructive" });
    },
  });

  const createRuleMutation = useMutation({
    mutationFn: async (data: Partial<FraudRule>) => {
      return await apiRequest("/api/fraud/rules", "POST", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/fraud/rules"] });
      toast({ title: "Rule created successfully" });
      setNewRuleDialog(false);
    },
    onError: (error) => {
      console.error("Create rule error:", error);
      toast({ title: "Failed to create rule", variant: "destructive" });
    },
  });

  // Mutations for data requests
  const updateRequestMutation = useMutation({
    mutationFn: async (data: { id: number; updates: Partial<DataRequest> }) => {
      return await apiRequest(`/api/gdpr/data-requests/${data.id}`, "PUT", data.updates);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/gdpr/data-requests"] });
      toast({ title: "Request updated successfully" });
    },
    onError: (error) => {
      console.error("Update request error:", error);
      toast({ title: "Failed to update request", variant: "destructive" });
    },
  });

  const getSeverityColor = (severity: string) => {
    switch (severity.toLowerCase()) {
      case "critical": return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200";
      case "high": return "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200";
      case "medium": return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200";
      case "low": return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
      default: return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "open": return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200";
      case "investigating": return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200";
      case "resolved": return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
      case "false_positive": return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200";
      case "pending": return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200";
      case "processing": return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200";
      case "completed": return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
      default: return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200";
    }
  };

  const handleAlertStatusChange = (alertId: number, newStatus: string) => {
    updateAlertMutation.mutate({
      id: alertId,
      updates: { status: newStatus, resolvedAt: newStatus === "resolved" ? new Date().toISOString() : undefined }
    });
  };

  const handleRequestStatusChange = (requestId: number, newStatus: string) => {
    updateRequestMutation.mutate({
      id: requestId,
      updates: { status: newStatus, processedAt: newStatus === "completed" ? new Date().toISOString() : undefined }
    });
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center gap-2 mb-6">
        <Shield className="h-6 w-6 text-blue-600" />
        <h1 className="text-2xl font-bold">Security & Compliance</h1>
      </div>

      <Tabs defaultValue="fraud" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="fraud" className="flex items-center gap-2">
            <AlertTriangle className="h-4 w-4" />
            Fraud Detection
          </TabsTrigger>
          <TabsTrigger value="gdpr" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            GDPR Compliance
          </TabsTrigger>
          <TabsTrigger value="audit" className="flex items-center gap-2">
            <Eye className="h-4 w-4" />
            Audit Trail
          </TabsTrigger>
        </TabsList>

        <TabsContent value="fraud" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium">Open Alerts</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-600">
                  {fraudAlerts.filter(a => a.status === "open").length}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium">Critical Alerts</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-orange-600">
                  {fraudAlerts.filter(a => a.severity === "critical").length}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium">Active Rules</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">
                  {fraudRules.filter(r => r.isActive).length}
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5" />
                  Fraud Alerts
                </CardTitle>
                <Dialog open={newAlertDialog} onOpenChange={setNewAlertDialog}>
                  <DialogTrigger asChild>
                    <Button size="sm">Create Alert</Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                      <DialogTitle>Create Fraud Alert</DialogTitle>
                      <DialogDescription>
                        Create a new fraud alert to flag suspicious activity in the system.
                      </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={(e) => {
                      e.preventDefault();
                      const formData = new FormData(e.currentTarget);
                      const partnerIdValue = formData.get("partnerId") as string;
                      createAlertMutation.mutate({
                        alertType: formData.get("alertType") as string,
                        severity: formData.get("severity") as string,
                        description: formData.get("description") as string,
                        partnerId: partnerIdValue && partnerIdValue.trim() !== "" ? parseInt(partnerIdValue) : undefined,
                        status: "open",
                      });
                    }}>
                      <div className="space-y-4">
                        <div>
                          <Label htmlFor="alertType">Alert Type</Label>
                          <Select name="alertType" required>
                            <SelectTrigger>
                              <SelectValue placeholder="Select alert type" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="suspicious_clicks">Suspicious Clicks</SelectItem>
                              <SelectItem value="unusual_conversion_rate">Unusual Conversion Rate</SelectItem>
                              <SelectItem value="rapid_signups">Rapid Signups</SelectItem>
                              <SelectItem value="duplicate_referrals">Duplicate Referrals</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label htmlFor="severity">Severity</Label>
                          <Select name="severity" required>
                            <SelectTrigger>
                              <SelectValue placeholder="Select severity" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="low">Low</SelectItem>
                              <SelectItem value="medium">Medium</SelectItem>
                              <SelectItem value="high">High</SelectItem>
                              <SelectItem value="critical">Critical</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label htmlFor="description">Description</Label>
                          <Textarea name="description" placeholder="Describe the fraud alert..." required />
                        </div>
                        <div>
                          <Label htmlFor="partnerId">Partner ID (optional)</Label>
                          <Input name="partnerId" type="number" placeholder="Enter partner ID" />
                        </div>
                      </div>
                      <div className="flex justify-end gap-2 mt-6">
                        <Button type="button" variant="outline" onClick={() => setNewAlertDialog(false)} disabled={createAlertMutation.isPending}>
                          Cancel
                        </Button>
                        <Button type="submit" disabled={createAlertMutation.isPending}>
                          {createAlertMutation.isPending ? "Creating..." : "Create Alert"}
                        </Button>
                      </div>
                    </form>
                  </DialogContent>
                </Dialog>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {alertsLoading ? (
                    <div className="text-center py-4">Loading alerts...</div>
                  ) : fraudAlerts.length === 0 ? (
                    <div className="text-center py-4 text-gray-500">No fraud alerts found</div>
                  ) : (
                    fraudAlerts.slice(0, 5).map((alert) => (
                      <div key={alert.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <Badge className={getSeverityColor(alert.severity)}>{alert.severity}</Badge>
                            <Badge className={getStatusColor(alert.status)}>{alert.status}</Badge>
                          </div>
                          <p className="text-sm font-medium">{alert.description}</p>
                          <p className="text-xs text-gray-500">{format(new Date(alert.createdAt), 'MMM d, yyyy')}</p>
                        </div>
                        <div className="flex gap-1">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleAlertStatusChange(alert.id, "investigating")}
                            disabled={alert.status === "investigating" || updateAlertMutation.isPending}
                          >
                            {updateAlertMutation.isPending ? "..." : "Investigate"}
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleAlertStatusChange(alert.id, "resolved")}
                            disabled={alert.status === "resolved" || updateAlertMutation.isPending}
                          >
                            {updateAlertMutation.isPending ? "..." : "Resolve"}
                          </Button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  Fraud Rules
                </CardTitle>
                <Dialog open={newRuleDialog} onOpenChange={setNewRuleDialog}>
                  <DialogTrigger asChild>
                    <Button size="sm">Create Rule</Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                      <DialogTitle>Create Fraud Rule</DialogTitle>
                      <DialogDescription>
                        Create a new fraud detection rule to automatically monitor for suspicious patterns.
                      </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={(e) => {
                      e.preventDefault();
                      const formData = new FormData(e.currentTarget);
                      const conditionsValue = formData.get("conditions") as string;
                      
                      // Validate JSON format
                      try {
                        JSON.parse(conditionsValue);
                      } catch (error) {
                        toast({ title: "Invalid JSON format in conditions", variant: "destructive" });
                        return;
                      }
                      
                      createRuleMutation.mutate({
                        name: formData.get("name") as string,
                        description: formData.get("description") as string,
                        ruleType: formData.get("ruleType") as string,
                        conditions: conditionsValue,
                        threshold: parseFloat(formData.get("threshold") as string),
                        timeWindow: parseInt(formData.get("timeWindow") as string),
                        isActive: true,
                      });
                    }}>
                      <div className="space-y-4">
                        <div>
                          <Label htmlFor="name">Rule Name</Label>
                          <Input name="name" placeholder="Enter rule name" required />
                        </div>
                        <div>
                          <Label htmlFor="ruleType">Rule Type</Label>
                          <Select name="ruleType" required>
                            <SelectTrigger>
                              <SelectValue placeholder="Select rule type" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="click_velocity">Click Velocity</SelectItem>
                              <SelectItem value="conversion_rate">Conversion Rate</SelectItem>
                              <SelectItem value="geographic">Geographic</SelectItem>
                              <SelectItem value="time_based">Time Based</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label htmlFor="threshold">Threshold</Label>
                          <Input name="threshold" type="number" step="0.01" placeholder="Enter threshold value" required />
                        </div>
                        <div>
                          <Label htmlFor="timeWindow">Time Window (minutes)</Label>
                          <Input name="timeWindow" type="number" placeholder="Enter time window" required />
                        </div>
                        <div>
                          <Label htmlFor="conditions">Conditions (JSON)</Label>
                          <Textarea name="conditions" placeholder='{"key": "value"}' required />
                        </div>
                        <div>
                          <Label htmlFor="description">Description</Label>
                          <Textarea name="description" placeholder="Describe the rule..." required />
                        </div>
                      </div>
                      <div className="flex justify-end gap-2 mt-6">
                        <Button type="button" variant="outline" onClick={() => setNewRuleDialog(false)} disabled={createRuleMutation.isPending}>
                          Cancel
                        </Button>
                        <Button type="submit" disabled={createRuleMutation.isPending}>
                          {createRuleMutation.isPending ? "Creating..." : "Create Rule"}
                        </Button>
                      </div>
                    </form>
                  </DialogContent>
                </Dialog>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {rulesLoading ? (
                    <div className="text-center py-4">Loading rules...</div>
                  ) : fraudRules.length === 0 ? (
                    <div className="text-center py-4 text-gray-500">No fraud rules found</div>
                  ) : (
                    fraudRules.slice(0, 5).map((rule) => (
                      <div key={rule.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <p className="text-sm font-medium">{rule.name}</p>
                            <Badge className={rule.isActive ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"}>
                              {rule.isActive ? "Active" : "Inactive"}
                            </Badge>
                          </div>
                          <p className="text-xs text-gray-500">{rule.description}</p>
                          <p className="text-xs text-gray-500">
                            {rule.ruleType} - Threshold: {rule.threshold} - Window: {rule.timeWindow}min
                          </p>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="gdpr" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium">Pending Requests</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-600">
                  {dataRequests.filter(r => r.status === "pending").length}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium">Processing</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-yellow-600">
                  {dataRequests.filter(r => r.status === "processing").length}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium">Completed</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">
                  {dataRequests.filter(r => r.status === "completed").length}
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Data Requests
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {requestsLoading ? (
                  <div className="text-center py-4">Loading requests...</div>
                ) : dataRequests.length === 0 ? (
                  <div className="text-center py-4 text-gray-500">No data requests found</div>
                ) : (
                  dataRequests.map((request) => (
                    <div key={request.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <Badge className={getStatusColor(request.status)}>{request.status}</Badge>
                          <span className="text-sm font-medium">{request.requestType}</span>
                        </div>
                        <p className="text-xs text-gray-500">{format(new Date(request.createdAt), 'MMM d, yyyy')}</p>
                        {request.requestDetails && (
                          <p className="text-xs text-gray-600 mt-1">{request.requestDetails}</p>
                        )}
                      </div>
                      <div className="flex gap-1">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleRequestStatusChange(request.id, "processing")}
                          disabled={request.status === "processing" || request.status === "completed" || updateRequestMutation.isPending}
                        >
                          {updateRequestMutation.isPending ? "..." : "Process"}
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleRequestStatusChange(request.id, "completed")}
                          disabled={request.status === "completed" || updateRequestMutation.isPending}
                        >
                          {updateRequestMutation.isPending ? "..." : "Complete"}
                        </Button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="audit" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Eye className="h-5 w-5" />
                  Recent Audit Logs
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {logsLoading ? (
                    <div className="text-center py-4">Loading logs...</div>
                  ) : auditLogs.length === 0 ? (
                    <div className="text-center py-4 text-gray-500">No audit logs found</div>
                  ) : (
                    auditLogs.slice(0, 10).map((log) => (
                      <div key={log.id} className="flex items-start gap-3 p-3 border rounded-lg">
                        <div className="flex-shrink-0 mt-1">
                          {log.action === "login" && <CheckCircle className="h-4 w-4 text-green-500" />}
                          {log.action === "logout" && <XCircle className="h-4 w-4 text-gray-500" />}
                          {log.action === "create" && <CheckCircle className="h-4 w-4 text-blue-500" />}
                          {log.action === "update" && <AlertCircle className="h-4 w-4 text-yellow-500" />}
                          {log.action === "delete" && <XCircle className="h-4 w-4 text-red-500" />}
                          {!["login", "logout", "create", "update", "delete"].includes(log.action) && (
                            <Clock className="h-4 w-4 text-gray-500" />
                          )}
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-medium">{log.description}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge variant="outline">{log.action}</Badge>
                            <Badge variant="outline">{log.entityType}</Badge>
                            <span className="text-xs text-gray-500">
                              {format(new Date(log.createdAt), 'MMM d, yyyy HH:mm')}
                            </span>
                          </div>
                          {log.ipAddress && (
                            <p className="text-xs text-gray-500 mt-1">IP: {log.ipAddress}</p>
                          )}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5" />
                  System Events
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {eventsLoading ? (
                    <div className="text-center py-4">Loading events...</div>
                  ) : systemEvents.length === 0 ? (
                    <div className="text-center py-4 text-gray-500">No system events found</div>
                  ) : (
                    systemEvents.slice(0, 10).map((event) => (
                      <div key={event.id} className="flex items-start gap-3 p-3 border rounded-lg">
                        <div className="flex-shrink-0 mt-1">
                          {event.severity === "critical" && <AlertTriangle className="h-4 w-4 text-red-500" />}
                          {event.severity === "error" && <XCircle className="h-4 w-4 text-red-500" />}
                          {event.severity === "warning" && <AlertCircle className="h-4 w-4 text-yellow-500" />}
                          {event.severity === "info" && <CheckCircle className="h-4 w-4 text-blue-500" />}
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-medium">{event.description}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge className={getSeverityColor(event.severity)}>{event.severity}</Badge>
                            <Badge variant="outline">{event.eventType}</Badge>
                            <span className="text-xs text-gray-500">
                              {format(new Date(event.createdAt), 'MMM d, yyyy HH:mm')}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}