"use client";

import { useQuery } from "@tanstack/react-query";
import { useAuthStore } from "@/store";
import { apiFetch } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatNumber } from "@/lib/utils";
import {
  Users,
  Activity,
  Megaphone,
  MousePointerClick,
  Tag,
  ShoppingBag,
  TrendingUp,
  Server,
} from "lucide-react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
} from "recharts";

const GROWTH_DATA = [
  { month: "Jan", users: 1200 },
  { month: "Feb", users: 1800 },
  { month: "Mar", users: 2400 },
  { month: "Apr", users: 3100 },
  { month: "May", users: 4200 },
  { month: "Jun", users: 5800 },
];

const CONTENT_PERF = [
  { name: "Banners", clicks: 4200 },
  { name: "Deals", clicks: 3100 },
  { name: "Categories", clicks: 2800 },
  { name: "Shop", clicks: 1900 },
];

export function DashboardPage() {
  const { token } = useAuthStore();

  const { data } = useQuery({
    queryKey: ["dashboard-stats"],
    queryFn: () =>
      apiFetch<{
        stats: {
          activeBanners: number;
          activeDeals: number;
          activeCampaigns: number;
          bannerClicks: number;
          totalUsers: number;
          dailyActiveUsers: number;
          monthlyActiveUsers: number;
          conversionRate: number;
        };
        recentActivity: Array<{
          action: string;
          module: string;
          created_at: string;
          admin_name: string;
        }>;
      }>("/api/admin/dashboard/stats", { token: token! }),
    enabled: !!token,
  });

  const stats = data?.stats;

  const cards = [
    { label: "Total Users", value: stats?.totalUsers ?? 0, icon: Users, color: "text-blue-600" },
    { label: "Daily Active", value: stats?.dailyActiveUsers ?? 0, icon: Activity, color: "text-emerald-600" },
    { label: "Active Campaigns", value: stats?.activeCampaigns ?? 0, icon: Megaphone, color: "text-purple-600" },
    { label: "Banner Clicks", value: stats?.bannerClicks ?? 0, icon: MousePointerClick, color: "text-orange-600" },
    { label: "Active Deals", value: stats?.activeDeals ?? 0, icon: Tag, color: "text-pink-600" },
    { label: "Active Banners", value: stats?.activeBanners ?? 0, icon: ShoppingBag, color: "text-indigo-600" },
  ];

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {cards.map((card) => (
          <Card key={card.label}>
            <CardContent className="flex items-center gap-4 p-5">
              <div className={`rounded-xl bg-slate-50 p-3 ${card.color}`}>
                <card.icon className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm text-slate-500">{card.label}</p>
                <p className="text-2xl font-bold text-slate-900">
                  {formatNumber(card.value)}
                </p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              User Growth
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart data={GROWTH_DATA}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip />
                <Area
                  type="monotone"
                  dataKey="users"
                  stroke="#6366f1"
                  fill="#6366f1"
                  fillOpacity={0.15}
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Content Performance</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={CONTENT_PERF}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip />
                <Bar dataKey="clicks" fill="#6366f1" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            {data?.recentActivity?.length ? (
              <div className="space-y-3">
                {data.recentActivity.map((a, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between rounded-lg border border-slate-100 px-4 py-3"
                  >
                    <div>
                      <p className="text-sm font-medium text-slate-900">
                        {a.admin_name ?? "System"} — {a.action} {a.module}
                      </p>
                      <p className="text-xs text-slate-400">
                        {new Date(a.created_at).toLocaleString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-slate-400">No recent activity</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Server className="h-4 w-4" />
              System Health
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {[
              { label: "API Server", status: "Healthy" },
              { label: "Database", status: "Connected" },
              { label: "Redis Cache", status: "Active" },
              { label: "Cloudinary CDN", status: "Online" },
            ].map((item) => (
              <div
                key={item.label}
                className="flex items-center justify-between rounded-lg bg-slate-50 px-3 py-2"
              >
                <span className="text-sm text-slate-600">{item.label}</span>
                <span className="text-xs font-medium text-emerald-600">
                  {item.status}
                </span>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
