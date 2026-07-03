"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuthStore } from "@/store";
import { apiFetch } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input, Label, Textarea, Badge } from "@/components/ui/input";
import { Plus, Trash2 } from "lucide-react";

type FieldDef = {
  key: string;
  label: string;
  type: "text" | "url" | "textarea" | "number";
  required?: boolean;
};

type ContentListPageProps = {
  title: string;
  description: string;
  endpoint: string;
  createEndpoint: string;
  fields: FieldDef[];
};

export function ContentListPage({
  title,
  description,
  endpoint,
  createEndpoint,
  fields,
}: ContentListPageProps) {
  const { token } = useAuthStore();
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<Record<string, string>>({});

  const { data, isLoading } = useQuery({
    queryKey: [endpoint],
    queryFn: () =>
      apiFetch<{ data: Record<string, unknown>[] }>(`${endpoint}?limit=50`, {
        token: token!,
      }),
    enabled: !!token,
  });

  const createMutation = useMutation({
    mutationFn: (body: Record<string, string>) =>
      apiFetch(createEndpoint, {
        method: "POST",
        token: token!,
        body: JSON.stringify(body),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [endpoint] });
      setShowForm(false);
      setForm({});
    },
  });

  function getDisplayTitle(item: Record<string, unknown>): string {
    return String(
      item.title ?? item.deal_title ?? item.name ?? item.id ?? "Untitled",
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-900">{title}</h2>
          <p className="text-sm text-slate-500">{description}</p>
        </div>
        <Button onClick={() => setShowForm(!showForm)}>
          <Plus className="h-4 w-4" />
          Create
        </Button>
      </div>

      {showForm && (
        <Card>
          <CardHeader>
            <CardTitle>New {title}</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-2">
            {fields.map((field) => (
              <div
                key={field.key}
                className={field.type === "textarea" ? "sm:col-span-2" : ""}
              >
                <Label>{field.label}</Label>
                {field.type === "textarea" ? (
                  <Textarea
                    value={form[field.key] ?? ""}
                    onChange={(e) =>
                      setForm({ ...form, [field.key]: e.target.value })
                    }
                  />
                ) : (
                  <Input
                    type={field.type === "url" ? "url" : "text"}
                    value={form[field.key] ?? ""}
                    onChange={(e) =>
                      setForm({ ...form, [field.key]: e.target.value })
                    }
                  />
                )}
              </div>
            ))}
            <div className="flex gap-2 sm:col-span-2">
              <Button
                onClick={() => createMutation.mutate(form)}
                disabled={createMutation.isPending}
              >
                Save
              </Button>
              <Button variant="outline" onClick={() => setShowForm(false)}>
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-3">
        {isLoading && (
          <p className="text-sm text-slate-400">Loading...</p>
        )}
        {data?.data?.map((item) => (
          <Card key={String(item.id)}>
            <CardContent className="flex items-center justify-between p-4">
              <div>
                <p className="font-medium text-slate-900">
                  {getDisplayTitle(item)}
                </p>
                {item.status != null && (
                  <Badge className="mt-1">{String(item.status)}</Badge>
                )}
              </div>
              <Button variant="ghost" size="icon">
                <Trash2 className="h-4 w-4 text-red-500" />
              </Button>
            </CardContent>
          </Card>
        ))}
        {!isLoading && !data?.data?.length && (
          <p className="py-12 text-center text-sm text-slate-400">
            No items yet. Create your first entry above.
          </p>
        )}
      </div>
    </div>
  );
}
