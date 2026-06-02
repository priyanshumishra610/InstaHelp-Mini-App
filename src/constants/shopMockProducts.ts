import type { ShopCategoryId } from "@/constants/shop";

export type ShopProductCategoryId = Exclude<ShopCategoryId, "all">;

export type ShopProduct = {
  id: string;
  title: string;
  categoryId: ShopProductCategoryId;
  imageUrl: string;
  price: number; // INR
  rating: number; // 0-5
  reviewCount: number;
  badge?: string;
  description: string;
  highlights: string[];
};

export const SHOP_MOCK_PRODUCTS: ShopProduct[] = [
  {
    id: "p-earbuds-noise-cancel",
    title: "Noise Cancelling Earbuds",
    categoryId: "electronics",
    imageUrl:
      "https://images.unsplash.com/photo-1585386959984-a4155223168f?auto=format&fit=crop&w=900&q=70",
    price: 1999,
    rating: 4.4,
    reviewCount: 1242,
    badge: "Bestseller",
    description:
      "Comfort-fit earbuds with deep bass tuning and clear calls—made for everyday commutes.",
    highlights: ["Active noise reduction", "Up to 28h battery", "Dual mic for calls"],
  },
  {
    id: "p-smartwatch-sport",
    title: "Sport Smartwatch (44mm)",
    categoryId: "electronics",
    imageUrl:
      "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=900&q=70",
    price: 3499,
    rating: 4.6,
    reviewCount: 832,
    badge: "Top rated",
    description:
      "Track workouts, steps and sleep with a bright display and water resistance for daily wear.",
    highlights: ["Fitness tracking", "Water resistant", "Bright always-on display"],
  },
  {
    id: "p-powerbank-20000",
    title: "Power Bank 20,000mAh (Fast Charge)",
    categoryId: "electronics",
    imageUrl:
      "https://images.unsplash.com/photo-1585334200299-41c7fb6d6a53?auto=format&fit=crop&w=900&q=70",
    price: 1499,
    rating: 4.5,
    reviewCount: 2601,
    badge: "Value pick",
    description:
      "Stay charged on the go with fast charging support and multiple device compatibility.",
    highlights: ["Fast charging", "Dual output ports", "Smart temperature control"],
  },

  {
    id: "p-vitamin-c-serum",
    title: "Vitamin C Serum (Brightening)",
    categoryId: "beauty",
    imageUrl:
      "https://images.unsplash.com/photo-1620916566398-39f1143ab7be?auto=format&fit=crop&w=900&q=70",
    price: 899,
    rating: 4.3,
    reviewCount: 541,
    badge: "Glow",
    description:
      "A gentle vitamin C blend to help brighten your complexion and support even tone.",
    highlights: ["Lightweight gel", "Suitable for daily use", "Non-greasy finish"],
  },
  {
    id: "p-hydrating-face-moisturizer",
    title: "Hydrating Face Moisturizer",
    categoryId: "beauty",
    imageUrl:
      "https://images.unsplash.com/photo-1556228724-4b0b575ad589?auto=format&fit=crop&w=900&q=70",
    price: 799,
    rating: 4.4,
    reviewCount: 933,
    description:
      "A soft, moisture-locking moisturizer that leaves skin smooth and refreshed.",
    highlights: ["Long-lasting hydration", "Fragrance-free (mock)", "Barrier support"],
  },
  {
    id: "p-hair-oil-repair",
    title: "Hair Repair Oil (Nourish + Shine)",
    categoryId: "beauty",
    imageUrl:
      "https://images.unsplash.com/photo-1597931752949-98c74b5b159b?auto=format&fit=crop&w=900&q=70",
    price: 649,
    rating: 4.2,
    reviewCount: 321,
    description:
      "Nourishing hair oil that helps reduce frizz and adds a healthy shine (mock product).",
    highlights: ["Lightweight oil", "Reduces frizz", "Helps smooth hair"],
  },

  {
    id: "p-cabin-luggage-20",
    title: "Cabin Luggage 20 inch (Hard Shell)",
    categoryId: "travel",
    imageUrl:
      "https://images.unsplash.com/photo-1526481280695-3c687fd643ed?auto=format&fit=crop&w=900&q=70",
    price: 2799,
    rating: 4.5,
    reviewCount: 178,
    badge: "Carry-on",
    description:
      "A compact, durable cabin suitcase with smooth wheels and secure compartments.",
    highlights: ["Hard shell protection", "360° wheels", "Secure inner organizer"],
  },
  {
    id: "p-travel-backpack-30l",
    title: "Travel Backpack 30L (Water Resistant)",
    categoryId: "travel",
    imageUrl:
      "https://images.unsplash.com/photo-1526481280695-3c687fd643ed?auto=format&fit=crop&w=900&q=70",
    price: 1899,
    rating: 4.4,
    reviewCount: 412,
    description:
      "Comfort-fit straps with a structured layout for daily travel and weekend trips.",
    highlights: ["Water resistant fabric", "Padded back", "Quick access pocket"],
  },
  {
    id: "p-utility-packing-cubes",
    title: "Packing Cubes Set (5 pcs)",
    categoryId: "travel",
    imageUrl:
      "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=900&q=70",
    price: 799,
    rating: 4.6,
    reviewCount: 289,
    badge: "Pack smart",
    description:
      "Keep your kit organized with breathable packing cubes that compress when needed.",
    highlights: ["Breathable fabric", "Compression zips", "Tidy organization"],
  },

  {
    id: "p-wireless-controller",
    title: "Wireless Controller (Low Latency)",
    categoryId: "gaming",
    imageUrl:
      "https://images.unsplash.com/photo-1592841200221-a6898f307baa?auto=format&fit=crop&w=900&q=70",
    price: 2499,
    rating: 4.7,
    reviewCount: 1206,
    badge: "Pro feel",
    description:
      "Responsive controls with comfortable grips for fast sessions and long playtime.",
    highlights: ["Low latency", "Comfort grips", "Multi device support (mock)"],
  },
  {
    id: "p-gaming-headset",
    title: "Gaming Headset (Surround Sound)",
    categoryId: "gaming",
    imageUrl:
      "https://images.unsplash.com/photo-1618366712010-f4ae9c647dcb?auto=format&fit=crop&w=900&q=70",
    price: 1999,
    rating: 4.5,
    reviewCount: 764,
    description:
      "Clear in-game audio and a noise-reducing mic for team chats (mock product).",
    highlights: ["Comfort fit", "Clear mic", "Immersive audio"],
  },
  {
    id: "p-mechanical-keyboard",
    title: "Mechanical Keyboard (Tactile Switches)",
    categoryId: "gaming",
    imageUrl:
      "https://images.unsplash.com/photo-1587829741301-dc798b83add3?auto=format&fit=crop&w=900&q=70",
    price: 4599,
    rating: 4.6,
    reviewCount: 521,
    badge: "Creator pick",
    description:
      "A satisfying typing + gaming keyboard with clean key legends and smooth actuation.",
    highlights: ["Tactile feel", "Programmable keys (mock)", "Durable build"],
  },

  {
    id: "p-sneakers-everyday",
    title: "Everyday Sneakers (Street Ready)",
    categoryId: "fashion",
    imageUrl:
      "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=900&q=70",
    price: 1599,
    rating: 4.3,
    reviewCount: 987,
    badge: "Comfort",
    description:
      "Lightweight sneakers designed for daily walks with a supportive sole.",
    highlights: ["Lightweight", "Cushioned sole", "Breathable upper"],
  },
  {
    id: "p-denim-jacket-classic",
    title: "Classic Denim Jacket",
    categoryId: "fashion",
    imageUrl:
      "https://images.unsplash.com/photo-1520975958225-3f61bfc8f756?auto=format&fit=crop&w=900&q=70",
    price: 2799,
    rating: 4.4,
    reviewCount: 402,
    description:
      "A timeless denim jacket that pairs easily with tees, shirts and hoodies.",
    highlights: ["Classic fit", "Stitched detailing", "Easy to style"],
  },
  {
    id: "p-crossbody-bag",
    title: "Crossbody Bag (Everyday Essentials)",
    categoryId: "fashion",
    imageUrl:
      "https://images.unsplash.com/photo-1590874103328-eac38a683ce7?auto=format&fit=crop&w=900&q=70",
    price: 1299,
    rating: 4.2,
    reviewCount: 219,
    description:
      "A compact crossbody bag with practical compartments for your daily essentials.",
    highlights: ["Compact", "Zipper compartments", "Comfort strap"],
  },

  {
    id: "p-led-smart-bulb",
    title: "Smart LED Bulb (Warm to Cool)",
    categoryId: "decor",
    imageUrl:
      "https://images.unsplash.com/photo-1543191878-f1a3bb58b7e5?auto=format&fit=crop&w=900&q=70",
    price: 599,
    rating: 4.4,
    reviewCount: 1180,
    badge: "Mood light",
    description:
      "Set the vibe with color temperature control (mock product) for any room.",
    highlights: ["Warm to cool", "Energy saving (mock)", "Easy setup"],
  },
  {
    id: "p-wall-clock-modern",
    title: "Modern Wall Clock (Silent)",
    categoryId: "decor",
    imageUrl:
      "https://images.unsplash.com/photo-1523413651479-597eb2da0ad6?auto=format&fit=crop&w=900&q=70",
    price: 899,
    rating: 4.5,
    reviewCount: 333,
    description:
      "A clean, silent wall clock with a minimal design and crisp time markers.",
    highlights: ["Silent movement", "Minimal design", "Clear markers"],
  },
  {
    id: "p-desk-lamp",
    title: "Desk Lamp (Adjustable Arm)",
    categoryId: "decor",
    imageUrl:
      "https://images.unsplash.com/photo-1519710164239-da123dc03ef4?auto=format&fit=crop&w=900&q=70",
    price: 1099,
    rating: 4.3,
    reviewCount: 257,
    description:
      "An adjustable desk lamp for reading and work—bright where you need it.",
    highlights: ["Adjustable arm", "Stable base", "Bright illumination (mock)"],
  },

  {
    id: "p-personalized-mug",
    title: "Personalized Coffee Mug",
    categoryId: "gifts",
    imageUrl:
      "https://images.unsplash.com/photo-1517705008128-361805f42e86?auto=format&fit=crop&w=900&q=70",
    price: 499,
    rating: 4.6,
    reviewCount: 1450,
    badge: "Giftable",
    description:
      "A fun personalized mug for birthdays, anniversaries and everyday motivation.",
    highlights: ["Personalized (mock)", "Microwave safe (mock)", "Gift-ready"],
  },
  {
    id: "p-birthday-hamper",
    title: "Birthday Hamper (Assorted)",
    categoryId: "gifts",
    imageUrl:
      "https://images.unsplash.com/photo-1549465220-1a8a12c4f5f2?auto=format&fit=crop&w=900&q=70",
    price: 1399,
    rating: 4.4,
    reviewCount: 318,
    description:
      "A curated hamper with delightful surprises—ideal for quick gifting.",
    highlights: ["Assorted items", "Ready to gift", "Limited mock edition"],
  },
  {
    id: "p-chocolate-bouquet",
    title: "Chocolate Bouquet (Sweet Surprise)",
    categoryId: "gifts",
    imageUrl:
      "https://images.unsplash.com/photo-1549007994-cb92caebd54b?auto=format&fit=crop&w=900&q=70",
    price: 999,
    rating: 4.2,
    reviewCount: 189,
    description:
      "A sweet bouquet-style gift that looks great and tastes even better (mock).",
    highlights: ["Looks impressive", "Gift wrapping (mock)", "Sweet variety"],
  },
];

