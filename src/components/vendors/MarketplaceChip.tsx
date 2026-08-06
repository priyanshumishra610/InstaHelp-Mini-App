import { FilterPill, type FilterPillProps } from "@/components/ui/FilterPill";
import { ACCENT } from "@/constants/theme";
import { memo } from "react";

export type MarketplaceChipProps = Omit<FilterPillProps, "index"> & {
  index?: number;
};

/** Explore chips — text-only liquid glass pills with blue active glow. */
function MarketplaceChipInner(props: MarketplaceChipProps) {
  const { icon: _icon, ...rest } = props;
  return <FilterPill minimal activeColor={ACCENT} {...rest} />;
}

export const MarketplaceChip = memo(MarketplaceChipInner);
