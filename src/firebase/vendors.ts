import {
  COLLECTIONS,
  getFirestoreDb,
  isFirebaseConfigured,
} from "@/firebase/config";
import {
  mapFirestoreVendorToRecord,
  normalizeFirestoreVendor,
} from "@/firebase/vendorMapper";
import type { FirestoreVendorDoc } from "@/types/firestore";
import type { VendorRecord } from "@/types/vendorMarketplace";
import type { VendorCatalogSort } from "@/services/vendors/vendorCatalogTypes";
import {
  compareVendorRank,
  vendorAvailableNow,
} from "@/services/vendors/vendorQueryHelpers";
import { haversineKm } from "@/services/vendors/vendorGeo";
import {
  collection,
  doc,
  getDoc,
  getDocs,
  limit,
  onSnapshot,
  orderBy,
  query,
  where,
  type DocumentData,
  type QueryConstraint,
  type Unsubscribe,
} from "firebase/firestore";

export const VENDOR_PAGE_SIZE = 24;

export type VendorQueryFilters = {
  search: string;
  areaKey: string | null;
  /** Slug from local catalog meta; mapped to `city` label for Firestore. */
  cityKey?: string | null;
  category: string | null;
  city: string | null;
  verifiedOnly: boolean;
  availableNowOnly: boolean;
  featuredOnly?: boolean;
};

export type VendorQueryOptions = VendorQueryFilters & {
  sort: VendorCatalogSort;
  userLocation: { lat: number; lng: number } | null;
  pageSize?: number;
  pageCount: number;
};

function docToRecord(id: string, data: DocumentData): VendorRecord {
  return mapFirestoreVendorToRecord(normalizeFirestoreVendor(id, data));
}

function buildConstraints(filters: VendorQueryFilters): QueryConstraint[] {
  const constraints: QueryConstraint[] = [
    where("isActive", "==", true),
  ];

  if (filters.featuredOnly) {
    constraints.push(where("isFeatured", "==", true));
  }

  if (filters.city?.trim()) {
    constraints.push(where("city", "==", filters.city.trim()));
  }

  if (filters.areaKey) {
    constraints.push(where("areaKey", "==", filters.areaKey));
  }

  if (filters.category?.trim()) {
    constraints.push(where("category", "==", filters.category.trim()));
  }

  if (filters.verifiedOnly) {
    constraints.push(where("isVerified", "==", true));
  }

  const searchToken = filters.search.trim().toLowerCase().split(/\s+/)[0];
  if (searchToken && searchToken.length >= 2) {
    constraints.push(where("searchTokens", "array-contains", searchToken));
  }

  constraints.push(orderBy("listingBoost", "desc"));
  constraints.push(orderBy("rating", "desc"));

  return constraints;
}

function postFilterAndSort(
  rows: VendorRecord[],
  options: VendorQueryOptions,
): VendorRecord[] {
  const q = options.search.trim().toLowerCase();
  let list = rows;

  if (q) {
    list = list.filter((v) => {
      const hay = [
        v.vendorName,
        v.businessName,
        v.category,
        v.subCategory,
        v.servicesText,
        v.areaLabel,
      ]
        .join(" ")
        .toLowerCase();
      return hay.includes(q);
    });
  }

  if (options.availableNowOnly) {
    list = list.filter((v) => vendorAvailableNow(v));
  }

  const user = options.userLocation;
  const distanceOf = (v: VendorRecord) => {
    if (!user || !v.coordinates) return null;
    return haversineKm(user, v.coordinates);
  };

  const primary =
    options.sort === "distance"
      ? "distance"
      : options.sort === "rating"
        ? "rating"
        : options.sort === "reviews"
          ? "reviews"
          : "recommended";

  return [...list].sort((a, b) =>
    compareVendorRank(a, b, { primary, distanceOf }),
  );
}

export function buildVendorQuery(options: VendorQueryOptions) {
  const pageSize = options.pageSize ?? VENDOR_PAGE_SIZE;
  const fetchLimit = pageSize * Math.max(1, options.pageCount);
  const constraints = buildConstraints(options);
  constraints.push(limit(fetchLimit));
  return query(collection(getFirestoreDb(), COLLECTIONS.vendors), ...constraints);
}

export function subscribeVendors(
  options: VendorQueryOptions,
  onData: (vendors: VendorRecord[]) => void,
  onError: (error: Error) => void,
): Unsubscribe {
  const q = buildVendorQuery(options);
  return onSnapshot(
    q,
    (snap) => {
      const rows = snap.docs
        .map((d) => docToRecord(d.id, d.data()))
        .filter((v) => v.id);
      onData(postFilterAndSort(rows, options));
    },
    (err) => onError(err),
  );
}

export async function fetchVendorsPage(
  options: VendorQueryOptions,
): Promise<VendorRecord[]> {
  const snap = await getDocs(buildVendorQuery(options));
  const rows = snap.docs.map((d) => docToRecord(d.id, d.data()));
  return postFilterAndSort(rows, options);
}

export async function fetchVendorById(
  vendorId: string,
): Promise<VendorRecord | null> {
  if (!isFirebaseConfigured()) return null;
  const ref = doc(getFirestoreDb(), COLLECTIONS.vendors, vendorId);
  const snap = await getDoc(ref);
  if (!snap.exists()) return null;
  const data = snap.data();
  if (data.isActive === false) return null;
  return docToRecord(snap.id, data);
}

export function subscribeVendorById(
  vendorId: string,
  onData: (vendor: VendorRecord | null) => void,
  onError: (error: Error) => void,
): Unsubscribe {
  const ref = doc(getFirestoreDb(), COLLECTIONS.vendors, vendorId);
  return onSnapshot(
    ref,
    (snap) => {
      if (!snap.exists() || snap.data().isActive === false) {
        onData(null);
        return;
      }
      onData(docToRecord(snap.id, snap.data()));
    },
    (err) => onError(err),
  );
}

export async function fetchFeaturedVendors(
  max = 8,
): Promise<VendorRecord[]> {
  return fetchVendorsPage({
    search: "",
    areaKey: null,
    category: null,
    city: null,
    verifiedOnly: false,
    availableNowOnly: false,
    featuredOnly: true,
    sort: "recommended",
    userLocation: null,
    pageCount: 1,
    pageSize: max,
  });
}

export function subscribeFeaturedVendors(
  max: number,
  onData: (vendors: VendorRecord[]) => void,
  onError: (error: Error) => void,
): Unsubscribe {
  return subscribeVendors(
    {
      search: "",
      areaKey: null,
      category: null,
      city: null,
      verifiedOnly: false,
      availableNowOnly: false,
      featuredOnly: true,
      sort: "recommended",
      userLocation: null,
      pageCount: 1,
      pageSize: max,
    },
    onData,
    onError,
  );
}

export async function fetchNearbyVendors(
  userLocation: { lat: number; lng: number },
  max = 6,
): Promise<VendorRecord[]> {
  const rows = await fetchVendorsPage({
    search: "",
    areaKey: null,
    category: null,
    city: "Bengaluru",
    verifiedOnly: false,
    availableNowOnly: false,
    sort: "distance",
    userLocation,
    pageCount: 1,
    pageSize: max * 3,
  });
  return rows.slice(0, max);
}

export type { FirestoreVendorDoc };
