import { AUTH_FONT } from "@/constants/authPremium";
import { TutorialStickOnly } from "@/components/onboarding/TutorialGuideCharacter";
import type { GuidePose } from "@/components/onboarding/TutorialGuideCharacter";
import { Ionicons } from "@expo/vector-icons";
import { useRef, useState } from "react";
import {
  Dimensions,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  View,
  type ViewToken,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const { width: SCREEN_W } = Dimensions.get("window");
const PANEL_W = SCREEN_W - 40;

type ComicPanel = {
  id: string;
  step: string;
  bubble: string;
  title: string;
  body: string;
  pose: GuidePose;
  accent: string;
  bubbleBg: string;
};

const PANELS: ComicPanel[] = [
  {
    id: "welcome",
    step: "1",
    bubble: "Hey! Busy day? I have got you.",
    title: "Your everyday concierge",
    body: "InstaHelp brings trusted local help to your phone — so chores stop eating your week.",
    pose: "wave",
    accent: "#E11D48",
    bubbleBg: "#FFF1F2",
  },
  {
    id: "request",
    step: "2",
    bubble: "Cleaning, repairs, errands — just tell us.",
    title: "Request in one tap",
    body: "Open New request, describe what you need, and our team routes it to the right pro.",
    pose: "point-down",
    accent: "#2563EB",
    bubbleBg: "#EFF6FF",
  },
  {
    id: "vendors",
    step: "3",
    bubble: "4,500+ vendors. Verified. Nearby.",
    title: "Discover on Home",
    body: "Browse services across India, compare ratings, and unlock contacts when you are ready.",
    pose: "talk",
    accent: "#059669",
    bubbleBg: "#ECFDF5",
  },
  {
    id: "experiences",
    step: "4",
    bubble: "Need a break? We plan stays too.",
    title: "Resorts & experiences",
    body: "Explore handpicked resorts and build quick itineraries — book through your concierge.",
    pose: "point-tab",
    accent: "#059669",
    bubbleBg: "#ECFDF5",
  },
  {
    id: "life",
    step: "5",
    bubble: "Less stress. More life.",
    title: "Time back for what matters",
    body: "Track bookings, chat on WhatsApp, and let InstaHelp handle the follow-ups. That is the point.",
    pose: "celebrate",
    accent: "#DB2777",
    bubbleBg: "#FDF2F8",
  },
];

type Props = {
  onComplete: () => void;
  onSkip: () => void;
};

export function AppComicTutorial({ onComplete, onSkip }: Props) {
  const insets = useSafeAreaInsets();
  const listRef = useRef<FlatList<ComicPanel>>(null);
  const [index, setIndex] = useState(0);
  const isLast = index === PANELS.length - 1;
  const activePanel = PANELS[index];

  const onViewableItemsChanged = useRef(
    ({ viewableItems }: { viewableItems: ViewToken[] }) => {
      const i = viewableItems[0]?.index;
      if (i != null) setIndex(i);
    },
  ).current;

  const goNext = () => {
    if (isLast) {
      onComplete();
      return;
    }
    listRef.current?.scrollToIndex({ index: index + 1, animated: true });
  };

  return (
    <View style={[styles.root, { paddingTop: insets.top + 8, paddingBottom: insets.bottom + 12 }]}>
      <View style={styles.topBar}>
        <Text style={[styles.brandText, { fontFamily: AUTH_FONT.bold }]}>InstaHelp</Text>
        <Pressable onPress={onSkip} hitSlop={12} accessibilityRole="button">
          <Text style={[styles.skip, { fontFamily: AUTH_FONT.semibold }]}>Skip</Text>
        </Pressable>
      </View>

      <FlatList
        ref={listRef}
        data={PANELS}
        keyExtractor={(item) => item.id}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        decelerationRate="fast"
        snapToInterval={PANEL_W + 12}
        snapToAlignment="start"
        contentContainerStyle={styles.listContent}
        onViewableItemsChanged={onViewableItemsChanged}
        viewabilityConfig={{ viewAreaCoveragePercentThreshold: 60 }}
        getItemLayout={(_, i) => ({
          length: PANEL_W + 12,
          offset: (PANEL_W + 12) * i,
          index: i,
        })}
        renderItem={({ item }) => (
          <View style={{ width: PANEL_W + 12, paddingRight: 12 }}>
            <View style={styles.card}>
              <Text
                style={[styles.stepLabel, { color: item.accent, fontFamily: AUTH_FONT.bold }]}
              >
                STEP {item.step}
              </Text>
              <View style={styles.castRow}>
                <TutorialStickOnly
                  pose={item.pose}
                  scale={0.8}
                  cloudFill="#FFFFFF"
                  cloudAccent={item.bubbleBg}
                  animated={false}
                />
                <View style={styles.speechCol}>
                  <View style={[styles.speech, { backgroundColor: item.bubbleBg }]}>
                    <Text style={[styles.bubbleText, { fontFamily: AUTH_FONT.semibold }]}>
                      {item.bubble}
                    </Text>
                  </View>
                  <Text
                    style={[styles.stickName, { color: item.accent, fontFamily: AUTH_FONT.bold }]}
                  >
                    Stick
                  </Text>
                </View>
              </View>
            </View>
            <Text style={[styles.panelTitle, { fontFamily: AUTH_FONT.bold }]}>{item.title}</Text>
            <Text style={[styles.panelBody, { fontFamily: AUTH_FONT.regular }]}>{item.body}</Text>
          </View>
        )}
      />

      <View style={styles.footer}>
        <View style={styles.dots}>
          {PANELS.map((p, i) => (
            <View
              key={p.id}
              style={[
                styles.dot,
                i === index && [styles.dotActive, { backgroundColor: activePanel.accent }],
              ]}
            />
          ))}
        </View>

        <Pressable
          onPress={goNext}
          accessibilityRole="button"
          accessibilityLabel={isLast ? "Get started" : "Next panel"}
          style={({ pressed }) => [
            styles.cta,
            { backgroundColor: activePanel.accent },
            pressed && styles.ctaPressed,
          ]}
        >
          <Text style={[styles.ctaText, { fontFamily: AUTH_FONT.bold }]}>
            {isLast ? "Get started" : "Next"}
          </Text>
          <Ionicons name={isLast ? "arrow-forward" : "chevron-forward"} size={18} color="#FFFFFF" />
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: "#F8FAFC",
  },
  topBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  brandText: {
    fontSize: 16,
    color: "#171717",
    letterSpacing: -0.3,
  },
  skip: {
    fontSize: 14,
    color: "#78716C",
  },
  listContent: {
    paddingHorizontal: 20,
  },
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 16,
    minHeight: 200,
    shadowColor: "#171717",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
  stepLabel: {
    fontSize: 10,
    letterSpacing: 1.4,
    marginBottom: 12,
  },
  castRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  speechCol: {
    flex: 1,
    minWidth: 0,
  },
  speech: {
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  bubbleText: {
    fontSize: 14,
    lineHeight: 20,
    color: "#171717",
  },
  stickName: {
    marginTop: 6,
    marginLeft: 4,
    fontSize: 11,
  },
  panelTitle: {
    marginTop: 18,
    fontSize: 22,
    lineHeight: 28,
    letterSpacing: -0.4,
    color: "#171717",
  },
  panelBody: {
    marginTop: 8,
    fontSize: 15,
    lineHeight: 22,
    color: "#57534E",
  },
  footer: {
    paddingHorizontal: 20,
    paddingTop: 20,
    gap: 16,
  },
  dots: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 6,
  },
  dot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: "#D6D3D1",
  },
  dotActive: {
    width: 22,
  },
  cta: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    borderRadius: 12,
    paddingVertical: 15,
  },
  ctaPressed: {
    opacity: 0.9,
  },
  ctaText: {
    fontSize: 15,
    color: "#FFFFFF",
  },
});
