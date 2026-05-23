import { getPublicEnv } from "@/config/env";
import type { FirebaseApp } from "firebase/app";
import { getApp, getApps, initializeApp } from "firebase/app";
import type { Firestore } from "firebase/firestore";
import { getFirestore } from "firebase/firestore";
import type { FirebaseStorage } from "firebase/storage";
import { getStorage } from "firebase/storage";

export const FIREBASE_CONFIG = {
  apiKey: getPublicEnv("EXPO_PUBLIC_FIREBASE_API_KEY"),
  authDomain: getPublicEnv("EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN"),
  projectId: getPublicEnv("EXPO_PUBLIC_FIREBASE_PROJECT_ID"),
  storageBucket: getPublicEnv("EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET"),
  messagingSenderId: getPublicEnv("EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID"),
  appId: getPublicEnv("EXPO_PUBLIC_FIREBASE_APP_ID"),
};

export function isFirebaseConfigured(): boolean {
  return Boolean(
    FIREBASE_CONFIG.apiKey &&
      FIREBASE_CONFIG.projectId &&
      FIREBASE_CONFIG.appId,
  );
}

export type VendorCatalogSource = "firestore" | "local_json";

export function getVendorCatalogSource(): VendorCatalogSource {
  const explicit = getPublicEnv("EXPO_PUBLIC_VENDOR_CATALOG_SOURCE");
  if (explicit === "local_json") return "local_json";
  if (explicit === "firestore" && isFirebaseConfigured()) return "firestore";
  if (isFirebaseConfigured()) return "firestore";
  return "local_json";
}

export function useFirestoreCatalog(): boolean {
  return getVendorCatalogSource() === "firestore";
}

let app: FirebaseApp | null = null;
let db: Firestore | null = null;
let storage: FirebaseStorage | null = null;

export function getFirebaseApp(): FirebaseApp {
  if (!isFirebaseConfigured()) {
    throw new Error(
      "Firebase is not configured. Set EXPO_PUBLIC_FIREBASE_* in .env",
    );
  }
  if (!app) {
    app = getApps().length ? getApp() : initializeApp(FIREBASE_CONFIG);
  }
  return app;
}

export function getFirestoreDb(): Firestore {
  if (!db) {
    db = getFirestore(getFirebaseApp());
  }
  return db;
}

export function getFirebaseStorage(): FirebaseStorage {
  if (!storage) {
    storage = getStorage(getFirebaseApp());
  }
  return storage;
}

export const COLLECTIONS = {
  vendors: "vendors",
  categories: "categories",
  services: "services",
  featuredVendors: "featured_vendors",
  users: "users",
} as const;
