import type { ImageSourcePropType } from "react-native";
import type { ComponentProps } from "react";
import type { Ionicons } from "@expo/vector-icons";

export type OfferIconName = ComponentProps<typeof Ionicons>["name"];

/** Single weekly / promotional offer slide (API-ready shape). */
export type WeeklyOffer = {
  id: string;
  title: string;
  subtitle: string;
  cta: string;
  /** Short label on the card, e.g. "Limited Time". */
  tag?: string;
  /** Offer highlight, e.g. "40% OFF". */
  badge?: string;
  /** Optional countdown target (epoch ms). */
  timerEndsAt?: number;
  /** Soft gradient stops — keep muted for a premium feel. */
  gradient: readonly [string, string];
  icon?: OfferIconName;
  image?: ImageSourcePropType;
  /** Deep link or action key for future API routing. */
  action?: string;
};

export type WeeklyOffersResponse = {
  offers: WeeklyOffer[];
  updatedAt?: string;
};
