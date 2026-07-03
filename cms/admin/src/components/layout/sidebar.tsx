"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Image,
  Star,
  Grid3X3,
  Layout,
  ShoppingBag,
  Tag,
  Bell,
  Megaphone,
  Smartphone,
  BarChart3,
  Users,
  Shield,
  FileText,
  Settings,
  ChevronDown,
  Sparkles,
} from "lucide-react";
import { cn } from "@/lib/utils";

type NavItem = {
  label: string;
  href?: string;
  icon: React.ComponentType<{ className?: string }>;
  children?: { label: string; href: string }[];
};

const NAV: NavItem[] = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  {
    label: "Content Management",
    icon: Layout,
    children: [
      { label: "Home Banners", href: "/dashboard/content/banners" },
      { label: "Featured This Week", href: "/dashboard/content/featured" },
      { label: "Categories", href: "/dashboard/content/categories" },
      { label: "Home Sections", href: "/dashboard/content/home-sections" },
      { label: "Shop Categories", href: "/dashboard/content/shop" },
      { label: "Deals & Offers", href: "/dashboard/content/deals" },
      { label: "Promotional Popups", href: "/dashboard/content/popups" },
      { label: "Vendor Promotions", href: "/dashboard/content/vendors" },
    ],
  },
  {
    label: "Mobile Assets",
    icon: Smartphone,
    children: [
      { label: "Splash Screens", href: "/dashboard/assets/splash" },
      { label: "Onboarding", href: "/dashboard/assets/onboarding" },
      { label: "Referral Banners", href: "/dashboard/assets/referral" },
      { label: "Wallet Promotions", href: "/dashboard/assets/wallet" },
      { label: "Seasonal Campaigns", href: "/dashboard/assets/seasonal" },
    ],
  },
  {
    label: "Marketing",
    icon: Megaphone,
    children: [
      { label: "Push Notifications", href: "/dashboard/marketing/notifications" },
      { label: "Campaign Manager", href: "/dashboard/marketing/campaigns" },
      { label: "Promo Codes", href: "/dashboard/marketing/promo-codes" },
    ],
  },
  {
    label: "Analytics",
    icon: BarChart3,
    children: [
      { label: "Banner Analytics", href: "/dashboard/analytics/banners" },
      { label: "Category Analytics", href: "/dashboard/analytics/categories" },
      { label: "Campaign Analytics", href: "/dashboard/analytics/campaigns" },
    ],
  },
  {
    label: "Administration",
    icon: Shield,
    children: [
      { label: "Users", href: "/dashboard/admin/users" },
      { label: "Roles", href: "/dashboard/admin/roles" },
      { label: "Audit Logs", href: "/dashboard/admin/audit-logs" },
    ],
  },
  { label: "Media Library", href: "/dashboard/media", icon: Image },
  { label: "Settings", href: "/dashboard/settings", icon: Settings },
];

function NavGroup({ item }: { item: NavItem }) {
  const pathname = usePathname();
  const Icon = item.icon;
  const isActive = item.href
    ? pathname === item.href
    : item.children?.some((c) => pathname.startsWith(c.href));

  if (item.href) {
    return (
      <Link
        href={item.href}
        className={cn(
          "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
          isActive
            ? "bg-indigo-50 text-indigo-700"
            : "text-slate-600 hover:bg-slate-50 hover:text-slate-900",
        )}
      >
        <Icon className="h-4 w-4 shrink-0" />
        {item.label}
      </Link>
    );
  }

  return (
    <details className="group" open={isActive}>
      <summary
        className={cn(
          "flex cursor-pointer list-none items-center justify-between gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors [&::-webkit-details-marker]:hidden",
          isActive
            ? "text-indigo-700"
            : "text-slate-600 hover:bg-slate-50 hover:text-slate-900",
        )}
      >
        <span className="flex items-center gap-3">
          <Icon className="h-4 w-4 shrink-0" />
          {item.label}
        </span>
        <ChevronDown className="h-4 w-4 transition-transform group-open:rotate-180" />
      </summary>
      <div className="ml-7 mt-1 space-y-0.5 border-l border-slate-100 pl-3">
        {item.children?.map((child) => (
          <Link
            key={child.href}
            href={child.href}
            className={cn(
              "block rounded-md px-2 py-1.5 text-sm transition-colors",
              pathname === child.href || pathname.startsWith(child.href + "/")
                ? "font-medium text-indigo-700"
                : "text-slate-500 hover:text-slate-900",
            )}
          >
            {child.label}
          </Link>
        ))}
      </div>
    </details>
  );
}

export function Sidebar() {
  return (
    <aside className="flex h-full w-64 shrink-0 flex-col border-r border-slate-200 bg-white">
      <div className="flex h-16 items-center gap-2 border-b border-slate-100 px-5">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-600">
          <Sparkles className="h-4 w-4 text-white" />
        </div>
        <div>
          <p className="text-sm font-bold text-slate-900">InstaHelp</p>
          <p className="text-[10px] font-medium uppercase tracking-wider text-slate-400">
            Content CMS
          </p>
        </div>
      </div>
      <nav className="flex-1 space-y-1 overflow-y-auto p-3">
        {NAV.map((item) => (
          <NavGroup key={item.label} item={item} />
        ))}
      </nav>
      <div className="border-t border-slate-100 p-4">
        <p className="text-xs text-slate-400">v1.0.0 · Enterprise CMS</p>
      </div>
    </aside>
  );
}
