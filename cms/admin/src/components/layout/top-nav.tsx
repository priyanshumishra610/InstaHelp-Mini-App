"use client";

import { useAuthStore } from "@/store";
import { Button } from "@/components/ui/button";
import { Bell, LogOut, Search, Wifi } from "lucide-react";
import { useRouter } from "next/navigation";

export function TopNav({ title }: { title: string }) {
  const { user, logout } = useAuthStore();
  const router = useRouter();

  function handleLogout() {
    logout();
    router.push("/login");
  }

  return (
    <header className="flex h-16 shrink-0 items-center justify-between border-b border-slate-200 bg-white px-6">
      <div>
        <h1 className="text-lg font-semibold text-slate-900">{title}</h1>
      </div>
      <div className="flex items-center gap-3">
        <div className="hidden items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 md:flex">
          <Search className="h-4 w-4 text-slate-400" />
          <input
            placeholder="Search content..."
            className="w-48 bg-transparent text-sm outline-none placeholder:text-slate-400"
          />
        </div>
        <div className="flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-700">
          <Wifi className="h-3 w-3" />
          API Online
        </div>
        <Button variant="ghost" size="icon">
          <Bell className="h-4 w-4" />
        </Button>
        <div className="flex items-center gap-2 rounded-lg border border-slate-100 px-3 py-1.5">
          <div className="flex h-7 w-7 items-center justify-center rounded-full bg-indigo-100 text-xs font-bold text-indigo-700">
            {user?.name?.charAt(0) ?? "A"}
          </div>
          <div className="hidden sm:block">
            <p className="text-sm font-medium text-slate-900">{user?.name}</p>
            <p className="text-xs text-slate-400">{user?.role}</p>
          </div>
        </div>
        <Button variant="ghost" size="icon" onClick={handleLogout}>
          <LogOut className="h-4 w-4" />
        </Button>
      </div>
    </header>
  );
}
