import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function AuditLogsPage() {
  return (
    <DashboardLayout>
      <Card>
        <CardHeader>
          <CardTitle>Audit Logs</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-slate-500">
            All admin actions are logged automatically. View recent activity on the
            dashboard or query <code className="text-xs">/api/admin/audit-logs</code>.
          </p>
        </CardContent>
      </Card>
    </DashboardLayout>
  );
}
