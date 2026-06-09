import { toDisplayText } from "@/components/shop/shopFormatters";
import type { ShopCategoryId } from "@/constants/shop";
import { compareProductImageRank } from "@/services/shop/shopImageSort";
import type { ShopCatalogProduct } from "@/types/shopCatalog";

export type ShopSortId =
  | "featured"
  | "price-asc"
  | "price-desc"
  | "rating"
  | "reviews";
export type ShopFilterId = "discount" | "in-stock" | "rated-4" | "has-reviews";

export const SHOP_SORT_OPTIONS: { id: ShopSortId; label: string }[] = [
  { id: "featured", label: "Featured" },
  { id: "price-asc", label: "Price: Low to High" },
  { id: "price-desc", label: "Price: High to Low" },
  { id: "rating", label: "Top Rated" },
  { id: "reviews", label: "Most Reviewed" },
];

export const SHOP_FILTER_OPTIONS: { id: ShopFilterId; label: string }[] = [
  { id: "discount", label: "On discount" },
  { id: "in-stock", label: "In stock" },
  { id: "rated-4", label: "Rated 4★ & above" },
  { id: "has-reviews", label: "Has reviews" },
];

function isInStock(stock: string): boolean {
  const s = stock.trim().toLowerCase();
  if (!s) return true;
  return !s.includes("out of stock") && !s.includes("unavailable");
}

function matchesFilters(
  product: ShopCatalogProduct,
  filters: Set<ShopFilterId>,
): boolean {
  if (filters.size === 0) return true;

  for (const filter of filters) {
    if (filter === "discount") {
      const onSale =
        product.sheetOnDiscount === true ||
        (product.sheetOnDiscount == null &&
          product.savingsPercent != null &&
          product.savingsPercent > 0);
      if (!onSale) return false;
    }
    if (filter === "in-stock") {
      const available =
        product.sheetInStock === true ||
        (product.sheetInStock == null && isInStock(product.stock));
      if (!available) return false;
    }
    if (filter === "rated-4" && product.rating < 4) {
      return false;
    }
    if (filter === "has-reviews" && product.reviewCount <= 0) {
      return false;
    }
  }
  return true;
}

function sortProducts(
  products: ShopCatalogProduct[],
  sortBy: ShopSortId,
): ShopCatalogProduct[] {
  const list = [...products];
  list.sort((a, b) => {
    const imageRank = compareProductImageRank(a, b);
    if (imageRank !== 0) return imageRank;

    if (sortBy === "featured") {
      const pa = a.sortPriority ?? 9999;
      const pb = b.sortPriority ?? 9999;
      if (pa !== pb) return pa - pb;
      return (a.bestPrice ?? Infinity) - (b.bestPrice ?? Infinity);
    }
    if (sortBy === "price-asc") {
      const pa = a.sortPriority ?? 9999;
      const pb = b.sortPriority ?? 9999;
      if (pa !== pb) return pa - pb;
      return (a.bestPrice ?? Infinity) - (b.bestPrice ?? Infinity);
    }
    if (sortBy === "price-desc") {
      return (b.bestPrice ?? 0) - (a.bestPrice ?? 0);
    }
    if (sortBy === "rating") {
      const diff = b.rating - a.rating;
      return diff !== 0 ? diff : b.reviewCount - a.reviewCount;
    }
    return b.reviewCount - a.reviewCount;
  });
  return list;
}

export function getProductBrand(product: ShopCatalogProduct): string {
  return toDisplayText(product.brand).trim();
}

export function getUniqueBrands(products: ShopCatalogProduct[]): string[] {
  const brands = new Set<string>();
  for (const product of products) {
    const brand = getProductBrand(product);
    if (brand) brands.add(brand);
  }
  return [...brands].sort((a, b) => a.localeCompare(b));
}

export function filterShopProducts(
  products: ShopCatalogProduct[],
  options: {
    category: ShopCategoryId;
    search: string;
    sortBy: ShopSortId;
    filters: Set<ShopFilterId>;
    brand: string | null;
  },
): ShopCatalogProduct[] {
  const q = options.search.trim().toLowerCase();

  let list =
    options.category === "all"
      ? products
      : products.filter((p) => p.categoryId === options.category);

  if (q) {
    list = list.filter((p) => {
      const brand = getProductBrand(p);
      const sub = toDisplayText(p.subCategory);
      const hay =
        `${p.title} ${p.description} ${brand} ${sub} ${p.highlights.join(" ")}`.toLowerCase();
      return hay.includes(q);
    });
  }

  if (options.brand) {
    list = list.filter((p) => getProductBrand(p) === options.brand);
  }

  list = list.filter((p) => matchesFilters(p, options.filters));
  return sortProducts(list, options.sortBy);
}
