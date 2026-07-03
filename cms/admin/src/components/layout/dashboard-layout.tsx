"use client";

import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuthStore } from "@/store";
import { Sidebar } from "./sidebar";
import { TopNav } from "./top-nav";
import { MobilePreview } from "./mobile-preview";

const TITLES: Record<string, string> = {
  "/dashboard": "Dashboard",
  "/dashboard/content/banners": "Home Banners",
  "/dashboard/content/featured": "Featured This Week",
  "/dashboard/content/categories": "Categories",
  "/dashboard/content/deals": "Deals & Offers",
  "/dashboard/content/shop": "Shop Categories",
  "/dashboard/admin/audit-logs": "Audit Logs",
  "/dashboard/media": "Media Library",
  "/dashboard/settings": "Settings",
};

export function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { token } = useAuthStore();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!token) router.replace("/login");
  }, [token, router]);

  if (!token) return null;

  const title =
    Object.entries(TITLES).find(([path]) => pathname.startsWith(path))?.[1] ??
    "InstaHelp CMS";

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50">
      <Sidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <TopNav title={title} />
        <div className="flex min-h-0 flex-1">
          <main className="flex-1 overflow-y-auto p-6">{children}</main>
          <MobilePreview />
        </div>
      </div>
    </div>
  );
}
