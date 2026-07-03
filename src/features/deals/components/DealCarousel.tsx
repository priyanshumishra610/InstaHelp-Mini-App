import { DealCard } from "@/features/deals/components/DealCard";
import type { Deal } from "@/features/deals/types/dealTypes";
import { ScrollView, StyleSheet } from "react-native";

type Props = {
  deals: Deal[];
  cardWidth: number;
  onOpenDeal: (id: string) => void;
  onGetDeal: (deal: Deal) => void;
};

export function DealCarousel({
  deals,
  cardWidth,
  onOpenDeal,
  onGetDeal,
}: Props) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.content}
    >
      {deals.map((deal) => (
        <DealCard
          key={deal.id}
          deal={deal}
          width={cardWidth}
          compact
          onOpen={() => onOpenDeal(deal.id)}
          onGetDeal={() => onGetDeal(deal)}
        />
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingHorizontal: 8,
    gap: 10,
  },
});
