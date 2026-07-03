"use client";

import { usePreviewStore } from "@/store";
import { cn } from "@/lib/utils";
import { Smartphone, Tablet, Sun, Moon } from "lucide-react";
import { Button } from "@/components/ui/button";

const SCREENS = [
  { id: "home" as const, label: "Home" },
  { id: "shop" as const, label: "Shop" },
  { id: "deals" as const, label: "Deals" },
  { id: "profile" as const, label: "Profile" },
];

export function MobilePreview() {
  const { screen, device, theme, setScreen, setDevice, setTheme } =
    usePreviewStore();

  const frameClass =
    device === "tablet"
      ? "w-[280px] h-[380px] rounded-2xl"
      : device === "android"
        ? "w-[220px] h-[440px] rounded-[28px]"
        : "w-[220px] h-[440px] rounded-[36px]";

  return (
    <aside className="hidden w-80 shrink-0 flex-col border-l border-slate-200 bg-slate-50 xl:flex">
      <div className="border-b border-slate-200 bg-white p-4">
        <p className="text-sm font-semibold text-slate-900">Live Preview</p>
        <p className="text-xs text-slate-400">Changes reflect instantly</p>
      </div>

      <div className="flex gap-1 border-b border-slate-200 bg-white p-2">
        {SCREENS.map((s) => (
          <button
            key={s.id}
            onClick={() => setScreen(s.id)}
            className={cn(
              "flex-1 rounded-md px-2 py-1 text-xs font-medium transition-colors",
              screen === s.id
                ? "bg-indigo-100 text-indigo-700"
                : "text-slate-500 hover:bg-slate-50",
            )}
          >
            {s.label}
          </button>
        ))}
      </div>

      <div className="flex items-center justify-center gap-2 border-b border-slate-200 bg-white p-2">
        <Button
          variant={device === "iphone" ? "default" : "outline"}
          size="sm"
          onClick={() => setDevice("iphone")}
        >
          <Smartphone className="h-3 w-3" />
          iPhone
        </Button>
        <Button
          variant={device === "android" ? "default" : "outline"}
          size="sm"
          onClick={() => setDevice("android")}
        >
          <Smartphone className="h-3 w-3" />
          Android
        </Button>
        <Button
          variant={device === "tablet" ? "default" : "outline"}
          size="sm"
          onClick={() => setDevice("tablet")}
        >
          <Tablet className="h-3 w-3" />
          Tablet
        </Button>
      </div>

      <div className="flex flex-1 flex-col items-center justify-center p-6">
        <div
          className={cn(
            "relative overflow-hidden border-[6px] border-slate-800 shadow-2xl",
            frameClass,
            theme === "dark" ? "bg-slate-900" : "bg-white",
          )}
        >
          {device !== "tablet" && (
            <div className="absolute left-1/2 top-2 z-10 h-4 w-20 -translate-x-1/2 rounded-full bg-slate-800" />
          )}
          <PreviewContent screen={screen} theme={theme} />
        </div>

        <div className="mt-4 flex gap-2">
          <Button
            variant={theme === "light" ? "default" : "outline"}
            size="sm"
            onClick={() => setTheme("light")}
          >
            <Sun className="h-3 w-3" />
            Light
          </Button>
          <Button
            variant={theme === "dark" ? "default" : "outline"}
            size="sm"
            onClick={() => setTheme("dark")}
          >
            <Moon className="h-3 w-3" />
            Dark
          </Button>
        </div>
      </div>
    </aside>
  );
}

function PreviewContent({
  screen,
  theme,
}: {
  screen: string;
  theme: string;
}) {
  const isDark = theme === "dark";
  const text = isDark ? "text-white" : "text-slate-900";
  const muted = isDark ? "text-slate-400" : "text-slate-500";
  const bg = isDark ? "bg-slate-800" : "bg-slate-100";

  return (
    <div className={cn("h-full overflow-hidden p-3 pt-8", isDark ? "bg-slate-900" : "bg-white")}>
      {screen === "home" && (
        <div className="space-y-3">
          <div className={cn("h-24 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-500")} />
          <p className={cn("text-xs font-bold", text)}>Featured This Week</p>
          <div className="flex gap-2 overflow-hidden">
            {[1, 2, 3].map((i) => (
              <div key={i} className={cn("h-16 w-20 shrink-0 rounded-lg", bg)} />
            ))}
          </div>
          <p className={cn("text-xs font-bold", text)}>Categories</p>
          <div className="grid grid-cols-3 gap-2">
            {["Travel", "Beauty", "Bills"].map((c) => (
              <div key={c} className={cn("rounded-lg p-2 text-center", bg)}>
                <div className="mx-auto mb-1 h-6 w-6 rounded-full bg-indigo-400" />
                <p className={cn("text-[8px]", muted)}>{c}</p>
              </div>
            ))}
          </div>
        </div>
      )}
      {screen === "shop" && (
        <div className="space-y-3">
          <p className={cn("text-sm font-bold", text)}>InstaHelp Shop</p>
          <div className="grid grid-cols-2 gap-2">
            {["Grocery", "Fashion", "Electronics", "Deals"].map((c) => (
              <div key={c} className={cn("rounded-lg p-3", bg)}>
                <p className={cn("text-[9px] font-medium", text)}>{c}</p>
              </div>
            ))}
          </div>
        </div>
      )}
      {screen === "deals" && (
        <div className="space-y-2">
          <div className="h-16 rounded-xl bg-gradient-to-r from-amber-400 to-orange-500" />
          {[1, 2, 3].map((i) => (
            <div key={i} className={cn("flex gap-2 rounded-lg p-2", bg)}>
              <div className="h-10 w-10 rounded bg-slate-300" />
              <div>
                <p className={cn("text-[9px] font-medium", text)}>Deal {i}</p>
                <p className={cn("text-[8px]", muted)}>Up to 40% off</p>
              </div>
            </div>
          ))}
        </div>
      )}
      {screen === "profile" && (
        <div className="space-y-3 text-center">
          <div className="mx-auto h-14 w-14 rounded-full bg-indigo-400" />
          <p className={cn("text-xs font-bold", text)}>User Profile</p>
          <div className={cn("rounded-xl p-3", bg)}>
            <p className={cn("text-[9px] font-medium", text)}>Referral Promotion</p>
          </div>
          <div className={cn("rounded-xl p-3", bg)}>
            <p className={cn("text-[9px] font-medium", text)}>Wallet Offers</p>
          </div>
        </div>
      )}
    </div>
  );
}
