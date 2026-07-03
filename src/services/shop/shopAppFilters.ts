import type { ShopCategoryId } from "@/constants/shop";
import type { ShopApp } from "@/types/shopApp";
import type { ShopFilterId, ShopSortId } from "@/services/shop/shopProductFilters";

function matchesAppFilters(
  app: ShopApp,
  filters: Set<ShopFilterId>,
): boolean {
  const wantsApps =
    filters.has("apps") ||
    filters.has("trending-apps") ||
    filters.has("new-apps");

  if (!wantsApps) return true;

  if (
    filters.has("apps") &&
    !filters.has("trending-apps") &&
    !filters.has("new-apps")
  ) {
    return true;
  }

  if (filters.has("trending-apps") && !app.isTrending) return false;
  if (filters.has("new-apps") && !app.isNew) return false;
  return true;
}

function appSearchHaystack(app: ShopApp): string {
  return `${app.name} ${app.description} ${app.features.join(" ")} ${app.appCategoryId} ${app.badge ?? ""}`.toLowerCase();
}

function sortApps(apps: ShopApp[], sortBy: ShopSortId): ShopApp[] {
  const list = [...apps];

  list.sort((a, b) => {
    if (sortBy === "featured") {
      if (a.sortPriority !== b.sortPriority) return a.sortPriority - b.sortPriority;
      return b.reviewCount - a.reviewCount;
    }
    if (sortBy === "rating") {
      const diff = b.rating - a.rating;
      return diff !== 0 ? diff : b.reviewCount - a.reviewCount;
    }
    if (sortBy === "reviews") {
      return b.reviewCount - a.reviewCount;
    }
    if (a.sortPriority !== b.sortPriority) return a.sortPriority - b.sortPriority;
    return b.reviewCount - a.reviewCount;
  });

  return list;
}

export function filterShopApps(
  apps: ShopApp[],
  options: {
    category: ShopCategoryId;
    search: string;
    sortBy: ShopSortId;
    filters: Set<ShopFilterId>;
  },
): ShopApp[] {
  const q = options.search.trim().toLowerCase();

  let list = apps;

  if (q) {
    list = list.filter((app) => appSearchHaystack(app).includes(q));
  } else if (options.category !== "all") {
    list = list.filter((app) => app.shopCategoryId === options.category);
  }

  list = list.filter((app) => matchesAppFilters(app, options.filters));

  if (options.filters.has("rated-4")) {
    list = list.filter((app) => app.rating >= 4);
  }
  if (options.filters.has("has-reviews")) {
    list = list.filter((app) => app.reviewCount > 0);
  }

  return sortApps(list, options.sortBy);
}

export function getSimilarApps(
  apps: ShopApp[],
  current: ShopApp,
  limit = 6,
): ShopApp[] {
  return apps
    .filter(
      (app) =>
        app.id !== current.id &&
        (app.appCategoryId === current.appCategoryId ||
          app.shopCategoryId === current.shopCategoryId),
    )
    .sort((a, b) => a.sortPriority - b.sortPriority)
    .slice(0, limit);
}
