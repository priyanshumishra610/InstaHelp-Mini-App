import { FilterPill, type FilterPillProps } from "@/components/ui/FilterPill";
import { useAppTheme } from "@/hooks/useAppTheme";
import { memo } from "react";

export type MarketplaceChipProps = Omit<FilterPillProps, "index"> & {
  index?: number;
};

/** Explore chips — text-only liquid glass pills with accent active state. */
function MarketplaceChipInner(props: MarketplaceChipProps) {
  const { colors, isDark } = useAppTheme();
  const { icon: _icon, ...rest } = props;
  return (
    <FilterPill
      minimal
      activeColor={isDark ? colors.ink : colors.accent}
      {...rest}
    />
  );
}

export const MarketplaceChip = memo(MarketplaceChipInner);
