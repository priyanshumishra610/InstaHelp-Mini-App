import { formatStartingPrice } from "@/services/vendors/vendorPresentation";
import { vendorGallerySources } from "@/services/vendors/vendorPresentation";
import { vendorDisplayName } from "@/services/vendors/vendorQueryHelpers";
import type { VendorRecord } from "@/types/vendorMarketplace";
import { Image, Pressable, Text, View } from "react-native";

type Props = {
  vendor: VendorRecord;
  distanceKm?: number | null;
  onPress: () => void;
};

// Fallbacks sourced from `assets/Resort list.csv` image columns.
const RESORT_DATA_FALLBACK_IMAGES = [
  "https://assets.hyatt.com/content/dam/hyatt/hyattdam/images/2016/10/10/1651/Grand-Hyatt-Goa-P029-Hotel-Pool.jpg/Grand-Hyatt-Goa-P029-Hotel-Pool.16x9.jpg?imwidth=2560",
  "https://cdn.sanity.io/images/ocl5w36p/prod5/5c70cae58e378301924776dfce5ca539f25197a0-1920x1440.jpg?w=768&auto=format&dpr=2",
  "https://cache.marriott.com/content/dam/marriott-renditions/GOIWH/goiwh-porte-2327-hor-clsc.jpg?output-quality=70&interpolation=progressive-bilinear&downsize=1336px:*",
  "https://assets.hyatt.com/content/dam/hyatt/hyattdam/images/2022/05/27/0750/GOIAL-P0280-Exterior-Aerial-View.jpg/GOIAL-P0280-Exterior-Aerial-View.16x9.jpg?imwidth=2560",
  "https://cache.marriott.com/is/image/marriotts7prod/xr-goixr-lobby-entrance-41750:Classic-Hor?wid=1336&fit=constrain",
  "https://www.ahstatic.com/photos/8861_ho_01_p_2048x1536.jpg",
  "https://hotel.hardrock.com/goa/files/6021/HRH_Goa_Pool_10.jpeg",
];

export function VendorHomeCard({ vendor, distanceKm, onPress }: Props) {
  const title = vendorDisplayName(vendor);
  const price = formatStartingPrice(vendor);
  const vendorImages = vendorGallerySources(vendor);
  const fallbackIndex =
    vendor.id.split("").reduce((acc, ch) => acc + ch.charCodeAt(0), 0) %
    RESORT_DATA_FALLBACK_IMAGES.length;
  const imageUrl = vendorImages[0] ?? RESORT_DATA_FALLBACK_IMAGES[fallbackIndex];

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      className="mr-3 w-[168px] overflow-hidden rounded-2xl border border-white bg-white active:opacity-90"
      style={{
        shadowColor: "#0f172a",
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.08,
        shadowRadius: 14,
        elevation: 3,
      }}
    >
      <View className="h-[92px] bg-accent-soft">
        <Image
          source={{ uri: imageUrl }}
          className="h-full w-full"
          resizeMode="cover"
        />
        {vendor.isVerified ? (
          <View className="absolute right-2 top-2 rounded-full bg-white/95 px-2 py-0.5">
            <Text className="text-[9px] font-extrabold text-accent-deep">
              Verified
            </Text>
          </View>
        ) : null}
      </View>
      <View className="px-3 py-3">
        <Text className="text-[13px] font-extrabold text-neutral-900" numberOfLines={2}>
          {title}
        </Text>
        <Text className="mt-1 text-[11px] font-semibold text-neutral-500" numberOfLines={1}>
          {vendor.category}
          {vendor.areaLabel ? ` · ${vendor.areaLabel}` : ""}
        </Text>
        <View className="mt-2 flex-row items-center justify-between">
          <Text className="text-[11px] font-bold text-accent-deep">{price}</Text>
          {distanceKm != null ? (
            <Text className="text-[10px] font-semibold text-neutral-400">
              {distanceKm.toFixed(1)} km
            </Text>
          ) : null}
        </View>
      </View>
    </Pressable>
  );
}
