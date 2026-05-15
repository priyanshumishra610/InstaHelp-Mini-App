import type { DiscoveryCategory, DiscoveryService } from "@/types/discovery";

const svc = (
  id: string,
  label: string,
  icon: DiscoveryService["icon"],
  extra?: Partial<DiscoveryService>,
): DiscoveryService => ({ id, label, icon, ...extra });

export const DISCOVERY_CATEGORIES: DiscoveryCategory[] = [
  {
    id: "home-personal",
    title: "Home & Personal Services",
    subtitle: "Repairs, cleaning, and everyday help at home",
    services: [
      svc("plumber", "Plumber", "water-outline", { formServiceId: "plumbing", popular: true }),
      svc("electrician", "Electrician", "flash-outline", { formServiceId: "electrician", popular: true }),
      svc("carpenter", "Carpenter", "hammer-outline", { formServiceId: "carpenter" }),
      svc("househelper", "Househelper", "home-outline", { formServiceId: "cleaning" }),
      svc("deep-cleaning", "Deep Cleaning", "sparkles-outline", { formServiceId: "cleaning", popular: true }),
      svc("pest-control", "Pest Control", "bug-outline", { formServiceId: "pest_control" }),
      svc("ac-servicing", "AC Servicing", "snow-outline", { formServiceId: "ac_repair" }),
      svc("appliance-repair", "Appliance Repair", "settings-outline", { formServiceId: "appliance_repair" }),
      svc("handyman", "Handyman", "construct-outline", { formServiceId: "repair" }),
      svc("furniture-assembly", "Furniture Assembly", "layers-outline", { formServiceId: "carpenter" }),
      svc("lawn-gardening", "Lawn & Gardening", "leaf-outline"),
      svc("smart-home", "Smart Home Setup", "wifi-outline"),
      svc("babysitter", "Babysitter", "people-outline"),
      svc("home-cook", "Home Cook", "restaurant-outline"),
      svc("grocery-help", "Grocery Help", "cart-outline", { formServiceId: "errand" }),
    ],
  },
  {
    id: "education",
    title: "Education & Tutoring",
    subtitle: "Coaching, lessons, and skill-building",
    services: [
      svc("home-tutor", "Home Tutor", "book-outline", { formServiceId: "tutor", recommended: true }),
      svc("neet-coaching", "NEET Coaching", "school-outline"),
      svc("jee-prep", "JEE Prep", "calculator-outline"),
      svc("music-lessons-edu", "Music Lessons", "musical-notes-outline"),
      svc("language-classes", "Language Classes", "language-outline"),
      svc("chess-coaching", "Chess Coaching", "grid-outline"),
    ],
  },
  {
    id: "real-estate",
    title: "Real Estate",
    subtitle: "Search, rentals, sales, and property guidance",
    layout: "row",
    services: [
      svc("property-search", "Property Search", "search-outline", { formServiceId: "real_estate" }),
      svc("rental-help", "Rental Help", "key-outline", { formServiceId: "real_estate" }),
      svc("sale-assistance", "Sale Assistance", "trending-up-outline", { formServiceId: "real_estate" }),
      svc("vastu-consultant", "Vastu Consultant", "compass-outline"),
      svc("property-legal", "Property Legal", "document-text-outline"),
    ],
  },
  {
    id: "personal-care",
    title: "Personal Care & Wellness",
    subtitle: "Health, fitness, beauty, and daily support",
    services: [
      svc("elder-care", "Elder Care", "heart-outline", { recommended: true }),
      svc("pet-sitting", "Pet Sitting", "paw-outline"),
      svc("meal-prep", "Meal Prep", "nutrition-outline"),
      svc("fitness-trainer", "Fitness Trainer", "barbell-outline"),
      svc("yoga-instructor", "Yoga Instructor", "body-outline"),
      svc("massage-therapy", "Massage Therapy", "hand-left-outline"),
      svc("salon-at-home", "Salon at Home", "cut-outline", { formServiceId: "salon", popular: true }),
      svc("errand-running", "Errand Running", "walk-outline", { formServiceId: "errand" }),
    ],
  },
  {
    id: "manufacturers",
    title: "Manufacturers & Suppliers",
    subtitle: "Packaging, fabrication, and bulk sourcing",
    services: [
      svc("corrugated-boxes", "Corrugated Boxes", "cube-outline"),
      svc("packaging-suppliers", "Packaging Suppliers", "archive-outline"),
      svc("printing-vendors", "Printing Vendors", "print-outline"),
      svc("garment-manufacturers", "Garment Manufacturers", "shirt-outline"),
      svc("corporate-gifting", "Corporate Gifting", "gift-outline"),
      svc("cnc-machining", "CNC Machining", "cog-outline"),
      svc("sheet-metal", "Sheet Metal Fabrication", "shapes-outline"),
      svc("raw-materials", "Raw Materials", "layers-outline"),
      svc("3d-printing", "3D Printing", "print-outline"),
    ],
  },
  {
    id: "business",
    title: "Business & Professional",
    subtitle: "Compliance, hiring, and back-office support",
    services: [
      svc("chartered-accountant", "Chartered Accountant", "calculator-outline"),
      svc("gst-tax", "GST & Tax Help", "receipt-outline"),
      svc("company-registration", "Company Registration", "business-outline"),
      svc("business-lawyer", "Business Lawyer", "scale-outline"),
      svc("hiring-recruitment", "Hiring & Recruitment", "person-add-outline"),
      svc("virtual-assistant", "Virtual Assistant", "desktop-outline"),
      svc("hr-payroll", "HR & Payroll", "people-circle-outline"),
      svc("data-entry", "Data Entry", "create-outline"),
    ],
  },
  {
    id: "tech-creative",
    title: "Tech & Creative",
    subtitle: "Build, design, market, and secure your presence",
    layout: "row",
    services: [
      svc("website-dev", "Website Development", "globe-outline", { recommended: true }),
      svc("app-dev", "App Development", "phone-portrait-outline"),
      svc("ui-ux", "UI/UX Design", "color-palette-outline"),
      svc("graphic-design", "Graphic Design", "brush-outline"),
      svc("social-media", "Social Media", "share-social-outline"),
      svc("seo", "SEO", "analytics-outline"),
      svc("it-support", "IT Support", "laptop-outline"),
      svc("cybersecurity", "Cybersecurity", "shield-checkmark-outline"),
    ],
  },
  {
    id: "events-travel",
    title: "Events & Travel",
    subtitle: "Moments, moves, and journeys handled smoothly",
    services: [
      svc("event-planner", "Event Planner", "calendar-outline"),
      svc("wedding-photographer", "Wedding Photographer", "camera-outline", { popular: true }),
      svc("videography", "Videography", "videocam-outline"),
      svc("tour-guides", "Tour Guides", "map-outline"),
      svc("airport-pickup", "Airport Pickup", "airplane-outline"),
      svc("outstation-driver", "Outstation Driver", "car-outline", { formServiceId: "driver" }),
      svc("packers-movers", "Packers & Movers", "cube-outline", { formServiceId: "moving", popular: true }),
      svc("visa-assistance", "Visa Assistance", "document-outline"),
    ],
  },
  {
    id: "anything-else",
    title: "Anything Else",
    subtitle: "Special requests and local experiences",
    services: [
      svc("interior-designer", "Interior Designer", "color-wand-outline"),
      svc("personal-shopper", "Personal Shopper", "bag-outline"),
      svc("caterer", "Caterer", "restaurant-outline"),
      svc("courier-services", "Courier Services", "bicycle-outline"),
      svc("mechanic-on-demand", "Mechanic On-demand", "build-outline"),
      svc("car-washing", "Car Washing", "water-outline", { formServiceId: "car_wash" }),
      svc("music-lessons-exp", "Music Lessons", "musical-note-outline"),
      svc("local-experiences", "Local Experiences", "star-outline"),
    ],
  },
];

export const ALL_DISCOVERY_SERVICES: DiscoveryService[] = DISCOVERY_CATEGORIES.flatMap(
  (c) => c.services,
);

export function getPopularServices(): DiscoveryService[] {
  return ALL_DISCOVERY_SERVICES.filter((s) => s.popular);
}

export function getRecommendedServices(): DiscoveryService[] {
  return ALL_DISCOVERY_SERVICES.filter((s) => s.recommended);
}

export function findDiscoveryService(id: string): DiscoveryService | undefined {
  return ALL_DISCOVERY_SERVICES.find((s) => s.id === id);
}

export function findCategoryForService(serviceId: string): DiscoveryCategory | undefined {
  return DISCOVERY_CATEGORIES.find((c) => c.services.some((s) => s.id === serviceId));
}
