import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Notifications from "expo-notifications";
import { Platform } from "react-native";

import type { WeatherHint } from "@/services/weatherContext";

export type DemandNotificationAction = "form" | "whatsapp" | "quick_request";

export type DemandNotificationData = {
  kind: "local-demand";
  action: DemandNotificationAction;
  /** Home lead form `service` param, request slug, or `custom`. */
  serviceId: string;
  whatsappMessage: string;
  /** demand | opportunity | time | weather | reminder | social | instant */
  notificationType?: string;
  quickPresetLabel?: string;
  quickPresetDescription?: string;
};

export type NotificationPersona = "consumer" | "business";

type TimeBand = "morning" | "afternoon" | "evening" | "night";

type SmartCategory = {
  id: string;
  /** Must match `SERVICE_OPTIONS` on Home (lead form). */
  homeServiceId: string;
  aliases: string[];
  action: DemandNotificationAction;
  consumerLines: string[];
  businessLines: string[];
  consumerRainLines?: string[];
  businessRainLines?: string[];
  consumerHeatLines?: string[];
  businessHeatLines?: string[];
  consumerFestivalLines?: string[];
  businessFestivalLines?: string[];
  timeLines?: Partial<Record<TimeBand, { consumer: string[]; business: string[] }>>;
  buildWhatsappMessage: (firstName: string | null) => string;
};

type MetaTemplate = {
  id: string;
  notificationType: DemandNotificationData["notificationType"];
  action: DemandNotificationAction;
  serviceId: string;
  lines: string[];
  businessLines?: string[];
  whatsappMessage: (firstName: string | null) => string;
  quickPresetLabel?: string;
  quickPresetDescription?: string;
};

const CHANNEL_ID = "instahelp-local-demand";
const LAST_SCHEDULED_AT_KEY = "instahelp:last-local-demand-schedule";
const LAST_SCHEDULE_KEY = "instahelp:last-local-demand-key";
const MIN_RESCHEDULE_MS = 20 * 60 * 60 * 1000;
const SCHEDULE_DELAYS_SECONDS = [45 * 60, 22 * 60 * 60, 46 * 60 * 60, 70 * 60 * 60];

function withWhatsappSignature(firstName: string | null, message: string) {
  if (!firstName) return message;
  return `Hi InstaHelp! This is ${firstName}. ${message.replace(/^Hi InstaHelp!\s*/i, "")}`.trim();
}

function daySeed() {
  return Math.floor(Date.now() / (24 * 60 * 60 * 1000));
}

function getTimeBand(date: Date): TimeBand {
  const h = date.getHours();
  if (h >= 5 && h < 12) return "morning";
  if (h >= 12 && h < 17) return "afternoon";
  if (h >= 17 && h < 21) return "evening";
  return "night";
}

function isFestivalSeason(d: Date): boolean {
  const m = d.getMonth();
  return m >= 8 || m <= 0;
}

function stablePick(seed: number, modulo: number) {
  if (modulo <= 0) return 0;
  const x = Math.abs(seed) % 2147483647;
  return x % modulo;
}

function pickLine(seed: number, lines: string[]): string {
  if (lines.length === 0) return "";
  return lines[stablePick(seed, lines.length)] ?? lines[0];
}

function mergePools(...pools: (string[] | undefined)[]): string[] {
  const out: string[] = [];
  for (const p of pools) {
    if (p?.length) out.push(...p);
  }
  return out;
}

function composeCategoryBody(
  cat: SmartCategory,
  ctx: {
    persona: NotificationPersona;
    weather: WeatherHint;
    timeBand: TimeBand;
    festival: boolean;
    seed: number;
    firstName: string | null;
  },
): string {
  const { persona, weather, timeBand, festival, seed, firstName } = ctx;
  const isBiz = persona === "business";

  const baseConsumer = cat.consumerLines;
  const baseBusiness = cat.businessLines;
  const rainPool = isBiz
    ? mergePools(cat.businessRainLines, cat.businessLines)
    : mergePools(cat.consumerRainLines, cat.consumerLines);
  const heatPool = isBiz
    ? mergePools(cat.businessHeatLines, cat.businessLines)
    : mergePools(cat.consumerHeatLines, cat.consumerLines);
  const festPool = isBiz
    ? mergePools(cat.businessFestivalLines, cat.businessLines)
    : mergePools(cat.consumerFestivalLines, cat.consumerLines);

  const timeOverride = cat.timeLines?.[timeBand];
  const timePool = isBiz
    ? mergePools(timeOverride?.business, cat.businessLines)
    : mergePools(timeOverride?.consumer, cat.consumerLines);

  let pool: string[];
  if (weather === "rain" && (cat.consumerRainLines?.length || cat.businessRainLines?.length)) {
    pool = rainPool;
  } else if (weather === "heat" && (cat.consumerHeatLines?.length || cat.businessHeatLines?.length)) {
    pool = heatPool;
  } else if (festival && festPool.length > 0 && (cat.consumerFestivalLines?.length || cat.businessFestivalLines?.length)) {
    pool = festPool;
  } else if (timeOverride && timePool.length > 0) {
    pool = timePool;
  } else {
    pool = isBiz ? baseBusiness : baseConsumer;
  }

  let line = pickLine(seed, pool);
  if (firstName && stablePick(seed + 11, 4) === 0 && !line.includes(firstName)) {
    line = `${firstName} — ${line.charAt(0).toLowerCase()}${line.slice(1)}`;
  }
  return line;
}

const SMART_CATEGORIES: SmartCategory[] = [
  {
    id: "painting",
    homeServiceId: "painting",
    aliases: ["painter", "painting", "paint", "repairs"],
    action: "form",
    consumerLines: [
      "Someone nearby may be looking for painters today.",
      "Painting requests feel a little busier around you this week.",
      "Nearby homes may need touch-ups or fresh coats soon.",
    ],
    businessLines: [
      "Nearby homeowners may need painting help this week.",
      "Local painting interest is steady around your location.",
      "A few nearby households may be planning painting work.",
    ],
    consumerFestivalLines: [
      "Homes nearby often refresh paint before festivities — demand ticks up.",
      "Festive prep nearby sometimes starts with painting and touch-ups.",
    ],
    businessFestivalLines: [
      "Festive prep nearby often lifts painting requests for local pros.",
      "Homes around you may book painters earlier ahead of celebrations.",
    ],
    timeLines: {
      morning: {
        consumer: [
          "Good morning — nearby homes sometimes book painters on quieter weekdays.",
        ],
        business: [
          "Good morning — painter bookings sometimes open early for nearby homes.",
        ],
      },
      night: {
        consumer: [
          "Tomorrow morning painter slots sometimes open nearby — worth a quick look.",
        ],
        business: [
          "Tomorrow’s painter requests nearby sometimes show up the night before.",
        ],
      },
    },
    buildWhatsappMessage: (first) =>
      withWhatsappSignature(
        first,
        "Hi InstaHelp! I’m looking for trusted painters near my location.",
      ),
  },
  {
    id: "plumbing",
    homeServiceId: "plumbing",
    aliases: ["plumber", "plumbing", "water"],
    action: "whatsapp",
    consumerLines: [
      "A nearby household may need plumbing help today.",
      "Plumbing requests can cluster locally on busy days.",
      "Someone around you might be dealing with a small water issue.",
    ],
    businessLines: [
      "A few nearby households may need a plumber today.",
      "Local plumbing demand can spike briefly around your area.",
      "Nearby families sometimes need urgent plumbing support.",
    ],
    consumerRainLines: [
      "Rainy weather often nudges leakage and plumbing requests nearby.",
      "Wet evenings nearby sometimes correlate with more plumbing checks.",
    ],
    businessRainLines: [
      "Rain nearby often correlates with a bump in plumbing requests.",
      "Leak checks tend to rise locally during rainy stretches.",
    ],
    buildWhatsappMessage: (first) =>
      withWhatsappSignature(
        first,
        "Hi InstaHelp! I may need a plumber near my location — can you help?",
      ),
  },
  {
    id: "electrician",
    homeServiceId: "electrician",
    aliases: ["electrician", "electrical", "bolt"],
    action: "form",
    consumerLines: [
      "Electrician searches sometimes pick up locally in the afternoon.",
      "Someone near you may be booking electrical help today.",
      "Small electrical jobs often move fast in nearby homes.",
    ],
    businessLines: [
      "A few potential customers nearby may need electricians today.",
      "Electrical work interest can rise locally on short notice.",
      "Nearby homes may have small electrical jobs opening up.",
    ],
    timeLines: {
      afternoon: {
        consumer: ["Afternoon hours often see more electrician activity nearby."],
        business: ["Afternoon electrician demand can lift around your location."],
      },
    },
    buildWhatsappMessage: (first) =>
      withWhatsappSignature(
        first,
        "Hi InstaHelp! I need a reliable electrician near my location.",
      ),
  },
  {
    id: "ac_repair",
    homeServiceId: "ac_repair",
    aliases: ["ac", "air conditioner", "cooling"],
    action: "form",
    consumerLines: [
      "AC repair demand can feel active near you on warmer days.",
      "Nearby homes sometimes queue AC checks when it heats up.",
      "Local AC help can move quickly — worth checking what’s open.",
    ],
    businessLines: [
      "AC service interest is often elevated around your location on hot days.",
      "More households nearby may be lining up AC checks today.",
      "Local AC demand can rise fast when temperatures climb.",
    ],
    consumerHeatLines: [
      "Hot days nearby often lift AC service requests through the afternoon.",
      "AC demand tends to spike locally when it stays warm into the evening.",
    ],
    businessHeatLines: [
      "Heat waves nearby usually lift AC repair and service requests.",
      "Hot afternoons often mean more AC bookings around your area.",
    ],
    timeLines: {
      afternoon: {
        consumer: ["Afternoon AC requests sometimes increase in nearby homes."],
        business: ["Afternoon AC repair requests can cluster locally."],
      },
    },
    buildWhatsappMessage: (first) =>
      withWhatsappSignature(
        first,
        "Hi InstaHelp! I need AC repair help near my location.",
      ),
  },
  {
    id: "cctv",
    homeServiceId: "cctv",
    aliases: ["cctv", "security", "camera"],
    action: "form",
    consumerLines: [
      "CCTV installation interest is quietly active in nearby homes.",
      "More people nearby seem to be evaluating security upgrades.",
      "Local CCTV requests can pick up without much noise.",
    ],
    businessLines: [
      "CCTV installation searches are trending a bit higher near you.",
      "Nearby homes may be comparing security camera options this week.",
      "Local demand for CCTV help can rise in short bursts.",
    ],
    buildWhatsappMessage: (first) =>
      withWhatsappSignature(
        first,
        "Hi InstaHelp! I need CCTV installation or support near me.",
      ),
  },
  {
    id: "cleaning",
    homeServiceId: "cleaning",
    aliases: ["cleaner", "cleaning", "clean", "deep clean"],
    action: "form",
    consumerLines: [
      "Nearby homes are booking cleaning services more often today.",
      "Local cleaning slots sometimes open and fill the same day.",
      "Someone around you may be lining up a home cleaning visit.",
    ],
    businessLines: [
      "Home cleaning requests feel active around your location today.",
      "Nearby households may be booking cleaners on short notice.",
      "Local cleaning demand can lift midweek around you.",
    ],
    consumerFestivalLines: [
      "Festive prep nearby often includes deep cleaning requests.",
      "Homes around you may be booking cleaning ahead of gatherings.",
    ],
    businessFestivalLines: [
      "Festive prep nearby tends to lift home cleaning bookings locally.",
      "More households around you may book cleaning before events.",
    ],
    timeLines: {
      morning: {
        consumer: [
          "Good morning — nearby homes sometimes book cleaning visits for the same day.",
        ],
        business: [
          "Good morning — cleaning bookings can start early in nearby neighborhoods.",
        ],
      },
    },
    buildWhatsappMessage: (first) =>
      withWhatsappSignature(
        first,
        "Hi InstaHelp! I’d like to book a home cleaning service near me.",
      ),
  },
  {
    id: "moving",
    homeServiceId: "moving",
    aliases: ["packers", "movers", "moving", "shifting", "package"],
    action: "form",
    consumerLines: [
      "Packers and movers requests sometimes cluster locally at month-end.",
      "A nearby move may be creating short-term booking activity.",
      "Shifting help can pop up nearby with little warning.",
    ],
    businessLines: [
      "More households nearby may be planning moves this week.",
      "Local movers can see a small surge when leases turn over.",
      "Nearby moving requests may be worth a quick scan.",
    ],
    buildWhatsappMessage: (first) =>
      withWhatsappSignature(
        first,
        "Hi InstaHelp! I need packers and movers help near my location.",
      ),
  },
  {
    id: "carpenter",
    homeServiceId: "carpenter",
    aliases: ["carpenter", "carpentry", "furniture", "woodwork"],
    action: "form",
    consumerLines: [
      "Carpentry jobs sometimes surface nearby in small batches.",
      "Someone near you may need a carpenter for a quick fix.",
      "Local carpentry requests can be easy to miss until they stack up.",
    ],
    businessLines: [
      "Nearby homes may post small carpentry jobs this week.",
      "Local carpenter demand can be steady without feeling loud.",
      "A few nearby households may need woodwork help.",
    ],
    buildWhatsappMessage: (first) =>
      withWhatsappSignature(
        first,
        "Hi InstaHelp! I need a carpenter near my location.",
      ),
  },
  {
    id: "pest_control",
    homeServiceId: "pest_control",
    aliases: ["pest", "pest control", "termite", "cockroach"],
    action: "form",
    consumerLines: [
      "Pest control checks sometimes rise locally after humid stretches.",
      "Nearby homes quietly book pest visits before issues spread.",
      "Someone around you may be dealing with a seasonal pest nudge.",
    ],
    businessLines: [
      "Pest control inquiries can cluster locally after warm, humid days.",
      "Nearby households may be booking pest visits this week.",
      "Local pest control demand can tick up with little fanfare.",
    ],
    buildWhatsappMessage: (first) =>
      withWhatsappSignature(
        first,
        "Hi InstaHelp! I need pest control help near my location.",
      ),
  },
  {
    id: "appliance_repair",
    homeServiceId: "appliance_repair",
    aliases: ["appliance", "fridge", "washing machine", "microwave"],
    action: "form",
    consumerLines: [
      "Appliance repair requests often move fast in nearby homes.",
      "Someone near you may need a quick appliance fix today.",
      "Local appliance help can be surprisingly busy midweek.",
    ],
    businessLines: [
      "Appliance repair leads can appear in bursts around your location.",
      "Nearby homes may need appliance support on short notice.",
      "Local appliance repair interest is worth watching this week.",
    ],
    buildWhatsappMessage: (first) =>
      withWhatsappSignature(
        first,
        "Hi InstaHelp! I need appliance repair help near me.",
      ),
  },
  {
    id: "beauty",
    homeServiceId: "salon",
    aliases: ["beauty", "salon", "spa", "grooming"],
    action: "form",
    consumerLines: [
      "Beauty at-home slots sometimes open nearby on the same day.",
      "Someone around you may be booking grooming help tonight.",
      "Local beauty services can fill quietly around weekends.",
    ],
    businessLines: [
      "Nearby at-home beauty bookings may be picking up this week.",
      "Local beauty demand can lift ahead of weekends and events.",
      "A few nearby clients may be searching for trusted pros.",
    ],
    buildWhatsappMessage: (first) =>
      withWhatsappSignature(
        first,
        "Hi InstaHelp! I’m looking for at-home beauty services near me.",
      ),
  },
  {
    id: "real_estate",
    homeServiceId: "real_estate",
    aliases: ["real estate", "property", "broker", "rent"],
    action: "whatsapp",
    consumerLines: [
      "Real estate conversations often pick up locally in short cycles.",
      "Someone nearby may be exploring a move or a lease change.",
      "Local property questions sometimes spike after fresh listings.",
    ],
    businessLines: [
      "Property inquiries can cluster nearby when listings refresh.",
      "More local eyes may be on real estate around you this week.",
      "Nearby families sometimes restart housing searches quietly.",
    ],
    buildWhatsappMessage: (first) =>
      withWhatsappSignature(
        first,
        "Hi InstaHelp! I’d like help with a real estate question near my location.",
      ),
  },
  {
    id: "tutor",
    homeServiceId: "tutor",
    aliases: ["tutor", "tuition", "education", "classes"],
    action: "form",
    consumerLines: [
      "Tutor requests often rise nearby around exam season.",
      "Someone near you may be looking for learning support this week.",
      "Local tuition interest can move in small waves.",
    ],
    businessLines: [
      "Tutor demand can lift locally around tests and term breaks.",
      "Nearby families may be searching for learning support.",
      "Local tuition inquiries sometimes cluster midweek.",
    ],
    buildWhatsappMessage: (first) =>
      withWhatsappSignature(
        first,
        "Hi InstaHelp! I need a tutor or tuition help near my location.",
      ),
  },
  {
    id: "doctor",
    homeServiceId: "doctor",
    aliases: ["doctor", "clinic", "physician", "health"],
    action: "whatsapp",
    consumerLines: [
      "Local health-related questions sometimes spike nearby after busy weeks.",
      "Someone around you may be looking for a trusted clinic visit.",
      "Nearby care searches can be sensitive — handled quietly here.",
    ],
    businessLines: [
      "Clinic-related local searches can rise gently around your area.",
      "Nearby households may be looking for dependable care options.",
      "Local health service interest can lift without feeling loud.",
    ],
    buildWhatsappMessage: (first) =>
      withWhatsappSignature(
        first,
        "Hi InstaHelp! I need help finding a doctor or clinic near me.",
      ),
  },
  {
    id: "car_wash",
    homeServiceId: "car_wash",
    aliases: ["car wash", "carwash", "detailing"],
    action: "form",
    consumerLines: [
      "Car wash and detailing slots sometimes open nearby on short notice.",
      "Someone near you may be booking vehicle care today.",
      "Local car care requests can cluster ahead of weekends.",
    ],
    businessLines: [
      "Vehicle detailing interest can lift locally before weekends.",
      "Nearby drivers may be booking washes on short notice.",
      "Local car care demand can pop up in small bursts.",
    ],
    buildWhatsappMessage: (first) =>
      withWhatsappSignature(
        first,
        "Hi InstaHelp! I need car wash or detailing help near me.",
      ),
  },
  {
    id: "laundry",
    homeServiceId: "laundry",
    aliases: ["laundry", "dry clean", "wash and fold"],
    action: "form",
    consumerLines: [
      "Laundry pickup requests sometimes rise nearby midweek.",
      "Someone around you may be lining up wash-and-fold help.",
      "Local laundry slots can open quietly around busy homes.",
    ],
    businessLines: [
      "Laundry service inquiries can lift locally on busy weeks.",
      "Nearby households may need pickup laundry support.",
      "Local laundry demand can be steady without feeling promotional.",
    ],
    buildWhatsappMessage: (first) =>
      withWhatsappSignature(
        first,
        "Hi InstaHelp! I need laundry or dry cleaning help near me.",
      ),
  },
  {
    id: "local_shop",
    homeServiceId: "local_shop",
    aliases: ["shop", "local", "store", "vendor"],
    action: "form",
    consumerLines: [
      "Nearby errands and local shop requests quietly pick up some days.",
      "Someone around you may need a quick local pickup or delivery.",
      "Local help for small shop runs can surface nearby.",
    ],
    businessLines: [
      "Local errands and small business requests can cluster near you.",
      "Nearby households sometimes need quick local shop support.",
      "Short local runs can create steady micro-demand around you.",
    ],
    buildWhatsappMessage: (first) =>
      withWhatsappSignature(
        first,
        "Hi InstaHelp! I need help with a local shop, pickup, or errand near me.",
      ),
  },
  {
    id: "custom",
    homeServiceId: "custom",
    aliases: ["errand", "driver", "custom", "help", "urgent"],
    action: "quick_request",
    consumerLines: [
      "Need something handled nearby? A quick note is enough to start.",
      "If it’s urgent, tell us in a sentence — we’ll route it locally.",
      "Nearby help can move fast when the request is clear.",
    ],
    businessLines: [
      "Assorted local requests nearby sometimes need a fast human handoff.",
      "Short local jobs can appear near you without a neat category label.",
      "A quick description is enough for us to connect you locally.",
    ],
    buildWhatsappMessage: (first) =>
      withWhatsappSignature(
        first,
        "Hi InstaHelp! I have a local request — can someone help me today?",
      ),
  },
];

const META_TEMPLATES: MetaTemplate[] = [
  {
    id: "social_proof",
    notificationType: "social",
    action: "form",
    serviceId: "cleaning",
    lines: [
      "Nearby residents are actively booking home services today.",
      "Local households around you moved more bookings this week.",
      "Trusted by people near your location — activity is steady today.",
    ],
    businessLines: [
      "Local businesses around you are seeing more service requests this week.",
      "Nearby pros are picking up a steady stream of local requests.",
      "Your area is quietly busy with local service activity.",
    ],
    whatsappMessage: (first) =>
      withWhatsappSignature(
        first,
        "Hi InstaHelp! I saw a local activity update — can you help me book a service?",
      ),
  },
  {
    id: "instant_action",
    notificationType: "instant",
    action: "quick_request",
    serviceId: "custom",
    lines: [
      "Need help urgently? Tell InstaHelp what you need in under a minute.",
      "Tap once — we’ll connect you with someone nearby.",
      "A single short note is enough to start locally.",
    ],
    businessLines: [
      "Have a local lead to qualify? Share it in one short note.",
      "A quick local brief helps us route opportunities cleanly.",
      "Tell us what you need nearby — we’ll keep it minimal.",
    ],
    whatsappMessage: (first) =>
      withWhatsappSignature(
        first,
        "Hi InstaHelp! I need quick local help — can you connect me?",
      ),
    quickPresetLabel: "Quick local request",
    quickPresetDescription: "",
  },
  {
    id: "reminder_style",
    notificationType: "reminder",
    action: "form",
    serviceId: "repair",
    lines: [
      "Still wrapping a home repair? Local help may be a tap away.",
      "Small fixes nearby often get booked before the weekend.",
      "If something’s pending at home, local slots sometimes open today.",
    ],
    businessLines: [
      "Handyman-style jobs nearby still move midweek for local pros.",
      "Small repair requests can stack quietly around your location.",
      "Nearby homes may post mixed repair jobs worth a glance.",
    ],
    whatsappMessage: (first) =>
      withWhatsappSignature(
        first,
        "Hi InstaHelp! I need help finishing a home repair near me.",
      ),
  },
];

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: false,
    shouldSetBadge: false,
    priority: Notifications.AndroidNotificationPriority.DEFAULT,
  }),
});

function rotate<T>(items: T[], offset: number) {
  if (items.length === 0) return items;
  const normalized = offset % items.length;
  return [...items.slice(normalized), ...items.slice(0, normalized)];
}

function scoreByInterests(category: SmartCategory, favoriteServiceIds: string[]) {
  const favoriteTerms = favoriteServiceIds.map((id) => id.toLowerCase());
  return category.aliases.some((alias) =>
    favoriteTerms.some(
      (favorite) => alias.includes(favorite) || favorite.includes(alias),
    ),
  )
    ? 1
    : 0;
}

function buildCategoryQueue(favoriteServiceIds: string[]) {
  const rotated = rotate(SMART_CATEGORIES, daySeed());
  return [...rotated].sort(
    (a, b) =>
      scoreByInterests(b, favoriteServiceIds) -
      scoreByInterests(a, favoriteServiceIds),
  );
}

function pickMetaTemplate(slotIndex: number, persona: NotificationPersona): MetaTemplate {
  const rotated = rotate(META_TEMPLATES, daySeed() + slotIndex * 3);
  const seedPick = stablePick(daySeed() * 17 + slotIndex * 5, rotated.length);
  return rotated[seedPick] ?? rotated[0];
}

function buildMetaBody(meta: MetaTemplate, persona: NotificationPersona, seed: number, firstName: string | null) {
  const pool =
    persona === "business" && meta.businessLines?.length
      ? meta.businessLines
      : meta.lines;
  let line = pickLine(seed, pool);
  if (firstName && stablePick(seed + 3, 5) === 0 && !line.includes(firstName)) {
    line = `${firstName} — ${line.charAt(0).toLowerCase()}${line.slice(1)}`;
  }
  return line;
}

async function ensureNotificationPermission() {
  const existing = await Notifications.getPermissionsAsync();
  if (existing.granted) return true;

  const requested = await Notifications.requestPermissionsAsync();
  return requested.granted;
}

async function ensureAndroidChannel() {
  if (Platform.OS !== "android") return;

  await Notifications.setNotificationChannelAsync(CHANNEL_ID, {
    name: "Nearby demand signals",
    importance: Notifications.AndroidImportance.DEFAULT,
    vibrationPattern: [0, 180, 120, 180],
    lightColor: "#004aad",
    sound: null,
    description:
      "Calm, hyperlocal InstaHelp® signals — not promotions.",
  });
}

function normalizeFirstName(rawName: string | null | undefined): string | null {
  if (!rawName) return null;
  const trimmed = rawName.trim().split(/\s+/)[0];
  if (!trimmed) return null;
  return trimmed.charAt(0).toUpperCase() + trimmed.slice(1);
}

function makeScheduleKey(
  firstName: string | null,
  favoriteServiceIds: string[],
  persona: NotificationPersona,
) {
  const favorites = [...favoriteServiceIds].sort().join(",");
  return `${persona}::${firstName ?? ""}::${favorites}`;
}

export async function scheduleSmartLocalDemandNotifications({
  favoriteServiceIds = [],
  firstName: rawFirstName = null,
  persona = "consumer",
  weatherHint = "neutral",
  force = false,
}: {
  favoriteServiceIds?: string[];
  firstName?: string | null;
  persona?: NotificationPersona;
  weatherHint?: WeatherHint;
  force?: boolean;
} = {}) {
  const firstName = normalizeFirstName(rawFirstName);
  const scheduleKey = makeScheduleKey(firstName, favoriteServiceIds, persona);

  const [storedLastScheduledAt, storedScheduleKey] = await Promise.all([
    AsyncStorage.getItem(LAST_SCHEDULED_AT_KEY),
    AsyncStorage.getItem(LAST_SCHEDULE_KEY),
  ]);

  const lastScheduledAt = Number(storedLastScheduledAt);
  const sameContent = storedScheduleKey === scheduleKey;
  const withinThrottle =
    !!lastScheduledAt && Date.now() - lastScheduledAt < MIN_RESCHEDULE_MS;

  if (!force && sameContent && withinThrottle) {
    return;
  }

  const permitted = await ensureNotificationPermission();
  if (!permitted) return;

  await ensureAndroidChannel();

  const scheduled = await Notifications.getAllScheduledNotificationsAsync();
  const existingDemandNotifications = scheduled.filter(
    (notification) => notification.content.data?.kind === "local-demand",
  );

  await Promise.all(
    existingDemandNotifications.map((notification) =>
      Notifications.cancelScheduledNotificationAsync(notification.identifier),
    ),
  );

  const now = new Date();
  const timeBand = getTimeBand(now);
  const festival = isFestivalSeason(now);
  const queue = buildCategoryQueue(favoriteServiceIds);
  const metaSlot = stablePick(daySeed(), SCHEDULE_DELAYS_SECONDS.length);
  const topCategories = queue.filter((c) => c.id !== "custom").slice(0, 3);
  const pickedMeta = pickMetaTemplate(metaSlot, persona);

  type Planned = {
    body: string;
    data: DemandNotificationData;
  };

  const planned: Planned[] = [];
  let categoryCursor = 0;

  for (let i = 0; i < SCHEDULE_DELAYS_SECONDS.length; i++) {
    const seed = daySeed() * 1009 + i * 127 + stablePick(i * 13 + favoriteServiceIds.length, 997);

    if (i === metaSlot) {
      const meta = pickedMeta;
      const body = buildMetaBody(meta, persona, seed, firstName);
      const wa = meta.whatsappMessage(firstName);
      planned.push({
        body,
        data: {
          kind: "local-demand",
          action: meta.action,
          serviceId: meta.serviceId,
          whatsappMessage: wa,
          notificationType: meta.notificationType,
          quickPresetLabel: meta.quickPresetLabel,
          quickPresetDescription: meta.quickPresetDescription,
        },
      });
      continue;
    }

    const cat = topCategories[categoryCursor % topCategories.length] ?? queue[0];
    categoryCursor += 1;
    const body = composeCategoryBody(cat, {
      persona,
      weather: weatherHint,
      timeBand,
      festival,
      seed,
      firstName,
    });
    const type =
      persona === "business"
        ? "opportunity"
        : weatherHint !== "neutral"
          ? "weather"
          : timeBand === "morning" || timeBand === "night"
            ? "time"
            : "demand";

    if (cat.action === "quick_request") {
      planned.push({
        body,
        data: {
          kind: "local-demand",
          action: "quick_request",
          serviceId: cat.homeServiceId,
          whatsappMessage: cat.buildWhatsappMessage(firstName),
          notificationType: type,
          quickPresetLabel: "Nearby help",
          quickPresetDescription: "",
        },
      });
    } else if (cat.action === "whatsapp") {
      planned.push({
        body,
        data: {
          kind: "local-demand",
          action: "whatsapp",
          serviceId: cat.homeServiceId,
          whatsappMessage: cat.buildWhatsappMessage(firstName),
          notificationType: type,
        },
      });
    } else {
      planned.push({
        body,
        data: {
          kind: "local-demand",
          action: "form",
          serviceId: cat.homeServiceId,
          whatsappMessage: cat.buildWhatsappMessage(firstName),
          notificationType: type,
        },
      });
    }
  }

  await Promise.all(
    planned.map((item, index) =>
      Notifications.scheduleNotificationAsync({
        content: {
          title: "InstaHelp\u00ae",
          subtitle: "We\u2019ll get it done.",
          body: item.body,
          data: item.data,
        },
        trigger: {
          type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
          seconds: SCHEDULE_DELAYS_SECONDS[index],
          repeats: false,
          channelId: CHANNEL_ID,
        },
      }),
    ),
  );

  await Promise.all([
    AsyncStorage.setItem(LAST_SCHEDULED_AT_KEY, String(Date.now())),
    AsyncStorage.setItem(LAST_SCHEDULE_KEY, scheduleKey),
  ]);
}

export function getDemandNotificationData(
  response: Notifications.NotificationResponse | null,
): DemandNotificationData | null {
  const data = response?.notification.request.content.data;
  if (!data || data.kind !== "local-demand") return null;
  if (data.action !== "form" && data.action !== "whatsapp" && data.action !== "quick_request") {
    return null;
  }
  if (typeof data.serviceId !== "string") return null;
  if (typeof data.whatsappMessage !== "string") return null;

  return data as DemandNotificationData;
}
