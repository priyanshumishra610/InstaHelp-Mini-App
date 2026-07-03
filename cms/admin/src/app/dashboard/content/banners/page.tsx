"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuthStore } from "@/store";
import { apiFetch } from "@/lib/api";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input, Label, Textarea, Badge } from "@/components/ui/input";
import { Plus, Pencil, Trash2 } from "lucide-react";

interface Banner {
  id: string;
  title: string;
  subtitle: string;
  image_url: string;
  cta_text: string;
  status: string;
  display_priority: number;
  click_count: number;
}

export default function BannersPage() {
  const { token } = useAuthStore();
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    title: "",
    subtitle: "",
    imageUrl: "",
    ctaText: "",
    ctaUrl: "",
    deepLink: "",
    displayPriority: 0,
    status: "draft",
  });

  const { data, isLoading } = useQuery({
    queryKey: ["banners"],
    queryFn: () =>
      apiFetch<{ data: Banner[] }>("/api/admin/banners?limit=50", {
        token: token!,
      }),
    enabled: !!token,
  });

  const createMutation = useMutation({
    mutationFn: (body: typeof form) =>
      apiFetch("/api/admin/banners", {
        method: "POST",
        token: token!,
        body: JSON.stringify(body),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["banners"] });
      setShowForm(false);
      setForm({ title: "", subtitle: "", imageUrl: "", ctaText: "", ctaUrl: "", deepLink: "", displayPriority: 0, status: "draft" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) =>
      apiFetch(`/api/admin/banners/${id}`, {
        method: "DELETE",
        token: token!,
      }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["banners"] }),
  });

  const statusVariant = (s: string) => {
    if (s === "active") return "success" as const;
    if (s === "scheduled") return "warning" as const;
    if (s === "draft") return "default" as const;
    return "destructive" as const;
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-slate-500">
              Manage home screen promotional banners
            </p>
          </div>
          <Button onClick={() => setShowForm(!showForm)}>
            <Plus className="h-4 w-4" />
            Create Banner
          </Button>
        </div>

        {showForm && (
          <Card>
            <CardHeader>
              <CardTitle>New Banner</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>Title</Label>
                <Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>Image URL</Label>
                <Input value={form.imageUrl} onChange={(e) => setForm({ ...form, imageUrl: e.target.value })} />
              </div>
              <div className="space-y-2 sm:col-span-2">
                <Label>Subtitle</Label>
                <Textarea value={form.subtitle} onChange={(e) => setForm({ ...form, subtitle: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>CTA Text</Label>
                <Input value={form.ctaText} onChange={(e) => setForm({ ...form, ctaText: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>Deep Link</Label>
                <Input value={form.deepLink} onChange={(e) => setForm({ ...form, deepLink: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>Status</Label>
                <select
                  className="flex h-10 w-full rounded-lg border border-slate-200 px-3 text-sm"
                  value={form.status}
                  onChange={(e) => setForm({ ...form, status: e.target.value })}
                >
                  <option value="draft">Draft</option>
                  <option value="active">Active</option>
                  <option value="scheduled">Scheduled</option>
                </select>
              </div>
              <div className="flex gap-2 sm:col-span-2">
                <Button onClick={() => createMutation.mutate(form)} disabled={createMutation.isPending}>
                  {createMutation.isPending ? "Saving..." : "Save Banner"}
                </Button>
                <Button variant="outline" onClick={() => setShowForm(false)}>Cancel</Button>
              </div>
            </CardContent>
          </Card>
        )}

        <div className="grid gap-4">
          {isLoading && <p className="text-sm text-slate-400">Loading banners...</p>}
          {data?.data?.map((banner) => (
            <Card key={banner.id}>
              <CardContent className="flex items-center gap-4 p-4">
                <img
                  src={banner.image_url}
                  alt={banner.title}
                  className="h-16 w-28 rounded-lg object-cover"
                />
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <p className="font-medium text-slate-900">{banner.title}</p>
                    <Badge variant={statusVariant(banner.status)}>{banner.status}</Badge>
                  </div>
                  <p className="text-sm text-slate-500">{banner.subtitle}</p>
                  <p className="text-xs text-slate-400">
                    Priority: {banner.display_priority} · Clicks: {banner.click_count}
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button variant="ghost" size="icon"><Pencil className="h-4 w-4" /></Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => deleteMutation.mutate(banner.id)}
                  >
                    <Trash2 className="h-4 w-4 text-red-500" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
          {!isLoading && !data?.data?.length && (
            <p className="text-center text-sm text-slate-400 py-12">
              No banners yet. Create your first banner above.
            </p>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
