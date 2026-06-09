import type {
  ShopCatalogProduct,
  ShopPlatform,
  ShopPlatformOffer,
} from "@/types/shopCatalog";

export const PLATFORM_ORDER: ShopPlatform[] = [
  "amazon",
  "flipkart",
  "myntra",
  "meesho",
];

type ProductBase = Omit<
  ShopCatalogProduct,
  | "bestPrice"
  | "bestPlatform"
  | "maxPrice"
  | "savingsAmount"
  | "savingsPercent"
>;

export function enrichProductPrices(product: ProductBase): ShopCatalogProduct {
  const visible = getVisiblePlatformOffers(product.platforms);
  const prices = visible
    .map((p) => p.price)
    .filter((p): p is number => p != null);

  const best = pickBestOffer(visible);
  const maxPrice = prices.length ? Math.max(...prices) : null;
  const bestPrice = best?.price ?? null;
  const savingsAmount =
    bestPrice != null && maxPrice != null && maxPrice > bestPrice
      ? maxPrice - bestPrice
      : null;
  const savingsPercent =
    savingsAmount != null && maxPrice != null && maxPrice > 0
      ? Math.round((savingsAmount / maxPrice) * 100)
      : null;

  return {
    ...product,
    platforms: product.platforms,
    bestPrice,
    bestPlatform: best?.platform ?? null,
    maxPrice,
    savingsAmount,
    savingsPercent,
  };
}

export function getVisiblePlatformOffers(
  platforms: ShopPlatformOffer[],
): ShopPlatformOffer[] {
  return platforms.filter(
    (p) =>
      p.price != null &&
      p.affiliateUrl != null &&
      String(p.affiliateUrl).trim().length > 0,
  );
}

export function sortPlatformsByPrice(
  platforms: ShopPlatformOffer[],
): ShopPlatformOffer[] {
  const visible = getVisiblePlatformOffers(platforms);
  return [...visible].sort((a, b) => {
    const priceDiff = (a.price ?? 0) - (b.price ?? 0);
    if (priceDiff !== 0) return priceDiff;
    return (
      PLATFORM_ORDER.indexOf(a.platform) - PLATFORM_ORDER.indexOf(b.platform)
    );
  });
}

function pickBestOffer(
  visible: ShopPlatformOffer[],
): ShopPlatformOffer | null {
  if (!visible.length) return null;

  let best = visible[0];
  for (const offer of visible.slice(1)) {
    if ((offer.price ?? Infinity) < (best.price ?? Infinity)) {
      best = offer;
      continue;
    }
    if (offer.price === best.price) {
      if (
        PLATFORM_ORDER.indexOf(offer.platform) <
        PLATFORM_ORDER.indexOf(best.platform)
      ) {
        best = offer;
      }
    }
  }
  return best;
}

export function shouldShowSavingsBadge(
  savingsPercent: number | null,
): boolean {
  return savingsPercent != null && savingsPercent > 10;
}
