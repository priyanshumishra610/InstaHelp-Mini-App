import { clayCardStyle } from "@/components/ui/GlassSurface";
import { AnimatedPressable } from "@/components/ui/AnimatedPressable";
import { AppIcon } from "@/components/ui/AppIcon";
import { RADIUS } from "@/constants/designSystem";
import { formatStartingPrice } from "@/services/vendors/vendorPresentation";
import { vendorGallerySources } from "@/services/vendors/vendorPresentation";
import { vendorDisplayName } from "@/services/vendors/vendorQueryHelpers";
import type { VendorRecord } from "@/types/vendorMarketplace";
import { MotiView } from "moti";
import { Image, Text, View } from "react-native";

type Props = {
  vendor: VendorRecord;
  distanceKm?: number | null;
  onPress: () => void;
  index?: number;
};

const RESORT_DATA_FALLBACK_IMAGES = [
  "https://assets.hyatt.com/content/dam/hyatt/hyattdam/images/2016/10/10/1651/Grand-Hyatt-Goa-P029-Hotel-Pool.jpg/Grand-Hyatt-Goa-P029-Hotel-Pool.16x9.jpg?imwidth=2560",
  "https://cdn.sanity.io/images/ocl5w36p/prod5/5c70cae58e378301924776dfce5ca539f25197a0-1920x1440.jpg?w=768&auto=format&dpr=2",
  "https://cache.marriott.com/content/dam/marriott-renditions/GOIWH/goiwh-porte-2327-hor-clsc.jpg?output-quality=70&interpolation=progressive-bilinear&downsize=1336px:*",
  "https://assets.hyatt.com/content/dam/hyatt/hyattdam/images/2022/05/27/0750/GOIAL-P0280-Exterior-Aerial-View.jpg/GOIAL-P0280-Exterior-Aerial-View.16x9.jpg?imwidth=2560",
  "https://cache.marriott.com/is/image/marriotts7prod/xr-goixr-lobby-entrance-41750:Classic-Hor?wid=1336&fit=constrain",
  "https://www.ahstatic.com/photos/8861_ho_01_p_2048x1536.jpg",
  "https://hotel.hardrock.com/goa/files/6021/HRH_Goa_Pool_10.jpeg",
];

export function VendorHomeCard({ vendor, distanceKm, onPress, index = 0 }: Props) {
  const title = vendorDisplayName(vendor);
  const price = formatStartingPrice(vendor);
  const vendorImages = vendorGallerySources(vendor);
  const fallbackIndex =
    vendor.id.split("").reduce((acc, ch) => acc + ch.charCodeAt(0), 0) %
    RESORT_DATA_FALLBACK_IMAGES.length;
  const imageUrl = vendorImages[0] ?? RESORT_DATA_FALLBACK_IMAGES[fallbackIndex];

  return (
    <MotiView
      from={{ opacity: 0, translateX: 16 }}
      animate={{ opacity: 1, translateX: 0 }}
      transition={{ type: "timing", duration: 380, delay: index * 60 }}
    >
      <AnimatedPressable
        onPress={onPress}
        accessibilityRole="button"
        className="mr-3 w-[176px]"
        style={clayCardStyle(RADIUS.xl)}
      >
        <View className="relative h-[100px] bg-accent-soft">
          <Image
            source={{ uri: imageUrl }}
            className="h-full w-full"
            resizeMode="cover"
          />
          <View className="absolute inset-0 bg-black/5" />
          {vendor.isVerified ? (
            <View className="absolute right-2.5 top-2.5 flex-row items-center gap-1 rounded-full border border-white/70 bg-white/80 px-2 py-1">
              <AppIcon name="shield" size={10} color="#171717" />
              <Text className="text-[9px] font-extrabold text-accent-deep">
                Verified
              </Text>
            </View>
          ) : null}
        </View>
        <View className="px-3.5 py-3.5">
          <Text className="text-[14px] font-extrabold leading-tight text-neutral-900" numberOfLines={2}>
            {title}
          </Text>
          <Text className="mt-1.5 text-[11px] font-medium text-neutral-500" numberOfLines={1}>
            {vendor.category}
            {vendor.areaLabel ? ` · ${vendor.areaLabel}` : ""}
          </Text>
          <View className="mt-2.5 flex-row items-center justify-between">
            <Text className="text-[12px] font-extrabold text-accent">{price}</Text>
            {distanceKm != null ? (
              <View className="flex-row items-center gap-0.5">
                <AppIcon name="navigate" size={10} color="#94A3B8" />
                <Text className="text-[10px] font-semibold text-neutral-400">
                  {distanceKm.toFixed(1)} km
                </Text>
              </View>
            ) : null}
          </View>
        </View>
      </AnimatedPressable>
    </MotiView>
  );
}
