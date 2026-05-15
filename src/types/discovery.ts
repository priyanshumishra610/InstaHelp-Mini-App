import type { ComponentProps } from "react";
import type { Ionicons } from "@expo/vector-icons";

export type DiscoveryIcon = ComponentProps<typeof Ionicons>["name"];

export type DiscoveryService = {
  id: string;
  label: string;
  icon: DiscoveryIcon;
  /** Maps to home form `serviceType` when available */
  formServiceId?: string;
  popular?: boolean;
  recommended?: boolean;
};

export type DiscoveryCategory = {
  id: string;
  title: string;
  subtitle: string;
  services: DiscoveryService[];
  /** Horizontal row instead of 2-col grid when true */
  layout?: "grid" | "row";
};

export type RecentlyViewedService = {
  id: string;
  label: string;
  icon: DiscoveryIcon;
  categoryId: string;
  viewedAt: number;
};
