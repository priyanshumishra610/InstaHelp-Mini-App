import { SHOP_VALID_IMAGE_IDS } from "@/data/shop-valid-image-ids";
import type { ShopCatalogProduct } from "@/types/shopCatalog";

function hasHttpImageUrl(product: ShopCatalogProduct): boolean {
  return product.imageUrl.trim().toLowerCase().startsWith("http");
}

/** 0 = verified loadable image, 1 = URL present but unverified, 2 = no image */
export function productImageSortRank(product: ShopCatalogProduct): number {
  if (SHOP_VALID_IMAGE_IDS.has(product.id)) return 0;
  if (hasHttpImageUrl(product)) return 1;
  return 2;
}

export function compareProductImageRank(
  a: ShopCatalogProduct,
  b: ShopCatalogProduct,
): number {
  return productImageSortRank(a) - productImageSortRank(b);
}
