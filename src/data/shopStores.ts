/** Curated stores catalog mirrored from https://instahelp.in/shop */

export type ShopStoreCategoryId =
  | "popular"
  | "grocery"
  | "beauty"
  | "electronics"
  | "fashion"
  | "health"
  | "home"
  | "jewelry"
  | "sports"
  | "kids"
  | "travel"
  | "entertainment";

export type ShopStore = {
  id: string;
  name: string;
  url: string;
  category: ShopStoreCategoryId;
  logo?: string;
  logoType?: "wordmark" | "icon";
};

export type ShopStoreSection = {
  id: ShopStoreCategoryId;
  title: string;
  /** Ionicons glyph used when remote category artwork fails to load */
  icon:
    | "flame-outline"
    | "basket-outline"
    | "sparkles-outline"
    | "hardware-chip-outline"
    | "shirt-outline"
    | "medkit-outline"
    | "home-outline"
    | "diamond-outline"
    | "football-outline"
    | "happy-outline"
    | "airplane-outline"
    | "film-outline";
};

export const SHOP_STORE_LOGO_BASE = "https://instahelp.in/image/shop";

export const SHOP_CATEGORY_IMAGES: Record<ShopStoreCategoryId, number> = {
  popular: require("../../assets/shop/categories/popular.png"),
  grocery: require("../../assets/shop/categories/grocery.png"),
  beauty: require("../../assets/shop/categories/beauty.png"),
  electronics: require("../../assets/shop/categories/electronics.png"),
  fashion: require("../../assets/shop/categories/fashion.png"),
  health: require("../../assets/shop/categories/health.png"),
  home: require("../../assets/shop/categories/home.png"),
  jewelry: require("../../assets/shop/categories/jewelry.png"),
  sports: require("../../assets/shop/categories/sports.png"),
  kids: require("../../assets/shop/categories/kids.png"),
  travel: require("../../assets/shop/categories/travel.png"),
  entertainment: require("../../assets/shop/categories/entertainment.png"),
};

export const SHOP_STORE_SECTIONS: ShopStoreSection[] = [
  { id: "popular", title: "Popular Stores", icon: "flame-outline" },
  { id: "grocery", title: "Grocery", icon: "basket-outline" },
  { id: "beauty", title: "Beauty", icon: "sparkles-outline" },
  { id: "electronics", title: "Electronics", icon: "hardware-chip-outline" },
  { id: "fashion", title: "Fashion", icon: "shirt-outline" },
  { id: "health", title: "Health", icon: "medkit-outline" },
  { id: "home", title: "Home", icon: "home-outline" },
  { id: "jewelry", title: "Jewelry", icon: "diamond-outline" },
  { id: "sports", title: "Sports", icon: "football-outline" },
  { id: "kids", title: "Kids", icon: "happy-outline" },
  { id: "travel", title: "Travel", icon: "airplane-outline" },
  { id: "entertainment", title: "Entertainment", icon: "film-outline" },
];

export const SHOP_STORES: ShopStore[] = [
  { id: "amazon", name: "Amazon", url: "https://www.amazon.in/", category: "popular", logo: "amazon.svg", logoType: "wordmark" },
  { id: "flipkart", name: "Flipkart", url: "https://www.flipkart.com/", category: "popular" },
  { id: "myntra", name: "Myntra", url: "https://www.myntra.com/", category: "popular" },
  { id: "meesho", name: "Meesho", url: "https://www.meesho.com/", category: "popular" },
  { id: "blinkit", name: "Blinkit", url: "https://blinkit.com/", category: "popular" },
  { id: "zepto", name: "Zepto", url: "https://www.zeptonow.com/", category: "popular" },
  { id: "swiggy", name: "Swiggy Instamart", url: "https://www.swiggy.com/instamart", category: "popular" },
  { id: "tata1mg", name: "Tata 1mg", url: "https://www.1mg.com/", category: "popular" },
  { id: "snapdeal", name: "Snapdeal", url: "https://www.snapdeal.com/", category: "popular" },
  { id: "bigbasket", name: "BigBasket", url: "https://www.bigbasket.com/", category: "grocery" },
  { id: "dmart", name: "DMart Ready", url: "https://www.dmart.in/", category: "grocery" },
  { id: "jiomart", name: "JioMart", url: "https://www.jiomart.com/", category: "grocery" },
  { id: "naturesbasket", name: "Nature's Basket", url: "https://www.naturesbasket.co.in/", category: "grocery" },
  { id: "spencers", name: "Spencer's", url: "https://www.spencers.in/", category: "grocery" },
  { id: "licious", name: "Licious", url: "https://www.licious.in/", category: "grocery" },
  { id: "freshtohome", name: "FreshToHome", url: "https://www.freshtohome.com/", category: "grocery" },
  { id: "countrydelight", name: "Country Delight", url: "https://countrydelight.in/", category: "grocery" },
  { id: "nykaa", name: "Nykaa", url: "https://www.nykaa.com/", category: "beauty" },
  { id: "purplle", name: "Purplle", url: "https://www.purplle.com/", category: "beauty" },
  { id: "mamaearth", name: "Mamaearth", url: "https://mamaearth.in/", category: "beauty" },
  { id: "smytten", name: "Smytten", url: "https://www.smytten.com/", category: "beauty" },
  { id: "forestessentials", name: "Forest Essentials", url: "https://www.forestessentialsindia.com/", category: "beauty" },
  { id: "sephora", name: "Sephora India", url: "https://sephora.nnnow.com/", category: "beauty" },
  { id: "minimalist", name: "Minimalist", url: "https://beminimalist.co/", category: "beauty" },
  { id: "dotandkey", name: "Dot & Key", url: "https://www.dotandkey.com/", category: "beauty" },
  { id: "sugar", name: "SUGAR Cosmetics", url: "https://in.sugarcosmetics.com/", category: "beauty" },
  { id: "lakme", name: "Lakme", url: "https://www.lakmeindia.com/", category: "beauty" },
  { id: "croma", name: "Croma", url: "https://www.croma.com/", category: "electronics" },
  { id: "reliancedigital", name: "Reliance Digital", url: "https://www.reliancedigital.in/", category: "electronics" },
  { id: "samsung", name: "Samsung", url: "https://www.samsung.com/in/", category: "electronics" },
  { id: "vijaysales", name: "Vijay Sales", url: "https://www.vijaysales.com/", category: "electronics" },
  { id: "apple", name: "Apple India", url: "https://www.apple.com/in/shop", category: "electronics" },
  { id: "boat", name: "boAt", url: "https://www.boat-lifestyle.com/", category: "electronics" },
  { id: "oneplus", name: "OnePlus", url: "https://www.oneplus.in/", category: "electronics" },
  { id: "mi", name: "Xiaomi", url: "https://www.mi.com/in/", category: "electronics" },
  { id: "dell", name: "Dell", url: "https://www.dell.com/en-in/shop", category: "electronics" },
  { id: "lenovo", name: "Lenovo", url: "https://www.lenovo.com/in/en/", category: "electronics" },
  { id: "noise", name: "Noise", url: "https://www.gonoise.com/", category: "electronics" },
  { id: "ajio", name: "Ajio", url: "https://www.ajio.com/", category: "fashion" },
  { id: "nykaafashion", name: "Nykaa Fashion", url: "https://www.nykaafashion.com/", category: "fashion" },
  { id: "lenskart", name: "Lenskart", url: "https://www.lenskart.com/", category: "fashion" },
  { id: "tatacliq", name: "Tata CLiQ", url: "https://www.tatacliq.com/", category: "fashion" },
  { id: "hm", name: "H&M", url: "https://www2.hm.com/en_in", category: "fashion" },
  { id: "snitch", name: "Snitch", url: "https://www.snitch.co.in/", category: "fashion" },
  { id: "zara", name: "Zara", url: "https://www.zara.com/in/", category: "fashion" },
  { id: "uniqlo", name: "Uniqlo", url: "https://www.uniqlo.com/in/en/", category: "fashion" },
  { id: "bewakoof", name: "Bewakoof", url: "https://www.bewakoof.com/", category: "fashion" },
  { id: "fabindia", name: "FabIndia", url: "https://www.fabindia.com/", category: "fashion" },
  { id: "pharmeasy", name: "Pharmeasy", url: "https://pharmeasy.in/", category: "health" },
  { id: "netmeds", name: "Netmeds", url: "https://www.netmeds.com/", category: "health" },
  { id: "healthkart", name: "HealthKart", url: "https://www.healthkart.com/", category: "health" },
  { id: "apollo247", name: "Apollo 247", url: "https://www.apollo247.com/", category: "health" },
  { id: "medplus", name: "MedPlus", url: "https://www.medplusmart.com/", category: "health" },
  { id: "truemeds", name: "Truemeds", url: "https://www.truemeds.in/", category: "health" },
  { id: "muscleblaze", name: "MuscleBlaze", url: "https://www.muscleblaze.com/", category: "health" },
  { id: "practo", name: "Practo", url: "https://www.practo.com/", category: "health" },
  { id: "pepperfry", name: "Pepperfry", url: "https://www.pepperfry.com/", category: "home" },
  { id: "urbanladder", name: "Urban Ladder", url: "https://www.urbanladder.com/", category: "home" },
  { id: "ikea", name: "IKEA India", url: "https://www.ikea.com/in/en/", category: "home" },
  { id: "wakefit", name: "Wakefit", url: "https://www.wakefit.co/", category: "home" },
  { id: "homecentre", name: "Home Centre", url: "https://www.homecentre.in/", category: "home" },
  { id: "duroflex", name: "Duroflex", url: "https://www.duroflexworld.com/", category: "home" },
  { id: "livspace", name: "Livspace", url: "https://www.livspace.com/in", category: "home" },
  { id: "nilkamal", name: "Nilkamal", url: "https://nilkamalfurniture.com/", category: "home" },
  { id: "tanishq", name: "Tanishq", url: "https://www.tanishq.co.in/", category: "jewelry" },
  { id: "caratlane", name: "CaratLane", url: "https://www.caratlane.com/", category: "jewelry" },
  { id: "giva", name: "GIVA", url: "https://www.giva.co/", category: "jewelry" },
  { id: "candere", name: "Candere", url: "https://www.candere.com/", category: "jewelry" },
  { id: "bluestone", name: "BlueStone", url: "https://www.bluestone.com/", category: "jewelry" },
  { id: "melorra", name: "Melorra", url: "https://www.melorra.com/", category: "jewelry" },
  { id: "joyalukkas", name: "Joyalukkas", url: "https://www.joyalukkas.in/", category: "jewelry" },
  { id: "decathlon", name: "Decathlon", url: "https://www.decathlon.in/", category: "sports" },
  { id: "adidas", name: "Adidas", url: "https://www.adidas.co.in/", category: "sports" },
  { id: "nike", name: "Nike", url: "https://www.nike.com/in/", category: "sports" },
  { id: "cultfit", name: "Cult.fit", url: "https://www.cult.fit/", category: "sports" },
  { id: "puma", name: "Puma", url: "https://in.puma.com/", category: "sports" },
  { id: "reebok", name: "Reebok", url: "https://www.reebok.in/", category: "sports" },
  { id: "skechers", name: "Skechers", url: "https://www.skechers.in/", category: "sports" },
  { id: "underarmour", name: "Under Armour", url: "https://www.underarmour.co.in/", category: "sports" },
  { id: "firstcry", name: "FirstCry", url: "https://www.firstcry.com/", category: "kids" },
  { id: "hopscotch", name: "Hopscotch", url: "https://www.hopscotch.in/", category: "kids" },
  { id: "babyoye", name: "Babyoye", url: "https://www.babyoye.com/", category: "kids" },
  { id: "mothercare", name: "Mothercare", url: "https://www.mothercare.in/", category: "kids" },
  { id: "hamleys", name: "Hamleys", url: "https://www.hamleys.in/", category: "kids" },
  { id: "trawel", name: "Trawel.in", url: "https://www.trawel.in/", category: "travel" },
  { id: "makemytrip", name: "MakeMyTrip", url: "https://www.makemytrip.com/", category: "travel" },
  { id: "ixigo", name: "Ixigo", url: "https://www.ixigo.com/", category: "travel" },
  { id: "goibibo", name: "Goibibo", url: "https://www.goibibo.com/", category: "travel" },
  { id: "yatra", name: "Yatra", url: "https://www.yatra.com/", category: "travel" },
  { id: "cleartrip", name: "Cleartrip", url: "https://www.cleartrip.com/", category: "travel" },
  { id: "easemytrip", name: "EaseMyTrip", url: "https://www.easemytrip.com/", category: "travel" },
  { id: "irctc", name: "IRCTC", url: "https://www.irctc.co.in/", category: "travel" },
  { id: "airbnb", name: "Airbnb", url: "https://www.airbnb.co.in/", category: "travel" },
  { id: "booking", name: "Booking.com", url: "https://www.booking.com/", category: "travel" },
  { id: "indigo", name: "IndiGo", url: "https://www.goindigo.in/", category: "travel" },
  { id: "agoda", name: "Agoda", url: "https://www.agoda.com/en-in/", category: "travel" },
  { id: "bookmyshow", name: "BookMyShow", url: "https://in.bookmyshow.com/", category: "entertainment" },
  { id: "hotstar", name: "Disney+ Hotstar", url: "https://www.hotstar.com/in/home", category: "entertainment" },
  { id: "netflix", name: "Netflix", url: "https://www.netflix.com/in/", category: "entertainment" },
  { id: "spotify", name: "Spotify", url: "https://open.spotify.com/", category: "entertainment" },
  { id: "sonyliv", name: "Sony LIV", url: "https://www.sonyliv.com/", category: "entertainment" },
  { id: "zee5", name: "ZEE5", url: "https://www.zee5.com/", category: "entertainment" },
];

export function shopStoreLogoUrl(store: ShopStore): string {
  // Prefer PNG — React Native image views do not reliably render remote SVG.
  const file = store.logo
    ? store.logo.replace(/\.svg$/i, ".png")
    : `${store.id}.png`;
  return `${SHOP_STORE_LOGO_BASE}/${file}`;
}

export function shopCategoryImage(id: ShopStoreCategoryId): number {
  return SHOP_CATEGORY_IMAGES[id];
}
