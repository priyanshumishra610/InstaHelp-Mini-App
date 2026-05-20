import { useVendorLeadStore } from "@/store/vendorLeadStore";
import type { CreditTransaction } from "@/types/vendorMarketplace";
import { Ionicons } from "@expo/vector-icons";
import {
  Pressable,
  Modal,
  FlatList,
  Text,
  View,
} from "react-native";

type Props = {
  visible: boolean;
  onClose: () => void;
};

function describeTx(tx: CreditTransaction): string {
  if (tx.kind === "credit_deduct" && tx.vendorId) return "Reveal contact";
  if (tx.kind === "credit_add") return tx.note || "Credits added";
  return tx.note || "Adjustment";
}

export function CreditHistoryModal({ visible, onClose }: Props) {
  const transactions = useVendorLeadStore((s) => s.transactions);
  const credits = useVendorLeadStore((s) => s.credits);

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={onClose}
    >
      <View className="flex-1 justify-end bg-black/45">
        <Pressable className="flex-1" onPress={onClose} accessibilityLabel="Dismiss overlay" />
        <View className="max-h-[72%] rounded-t-[28px] border border-neutral-100 bg-white px-5 pb-8 pt-4">
          <View className="mb-3 flex-row items-center justify-between">
            <Text className="text-[17px] font-extrabold text-neutral-900">
              Credits & unlocks
            </Text>
            <Pressable
              hitSlop={12}
              onPress={onClose}
              accessibilityRole="button"
              accessibilityLabel="Close"
            >
              <Ionicons name="close" size={24} color="#525252" />
            </Pressable>
          </View>
          <View className="mb-4 flex-row items-center justify-between rounded-2xl border border-accent-tint bg-accent-soft px-4 py-3">
            <Text className="text-[13px] font-bold text-accent-deep">
              Current balance
            </Text>
            <Text className="text-[20px] font-extrabold text-accent">{credits}</Text>
          </View>
          <Text className="mb-2 text-[11px] font-bold uppercase tracking-wide text-neutral-500">
            Recent activity
          </Text>
          <FlatList
            data={transactions}
            keyExtractor={(item) => item.id}
            contentContainerStyle={{ paddingBottom: 16 }}
            nestedScrollEnabled
            ListEmptyComponent={
              <Text className="py-6 text-center text-[14px] text-neutral-500">
                No transactions yet.
              </Text>
            }
            renderItem={({ item }) => (
              <View className="mb-2 rounded-2xl border border-neutral-100 bg-neutral-50 px-3 py-3">
                <View className="flex-row items-center justify-between gap-2">
                  <Text className="flex-1 text-[13px] font-bold text-neutral-900">
                    {describeTx(item)}
                  </Text>
                  <Text
                    className={`text-[13px] font-extrabold ${
                      item.delta >= 0 ? "text-emerald-600" : "text-red-600"
                    }`}
                  >
                    {item.delta >= 0 ? "+" : ""}
                    {item.delta}
                  </Text>
                </View>
                <Text className="mt-1 text-[11px] text-neutral-500">
                  {new Date(item.createdAt).toLocaleString("en-IN", {
                    day: "numeric",
                    month: "short",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}{" "}
                  · balance {item.balanceAfter}
                  {item.vendorId ? ` · ${item.vendorId}` : ""}
                </Text>
              </View>
            )}
          />
        </View>
      </View>
    </Modal>
  );
}
