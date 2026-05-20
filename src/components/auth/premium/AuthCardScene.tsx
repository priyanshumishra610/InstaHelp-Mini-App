import { LoginAuthCard } from "@/components/auth/premium/LoginAuthCard";
import { RegisterAuthCard } from "@/components/auth/premium/RegisterAuthCard";
import { WelcomeAuthCard } from "@/components/auth/premium/WelcomeAuthCard";
import { AUTH_FONT } from "@/constants/authPremium";
import { useCallback, useRef, useState } from "react";
import {
  Dimensions,
  FlatList,
  StyleSheet,
  Text,
  View,
  type NativeScrollEvent,
  type NativeSyntheticEvent,
} from "react-native";
import Animated, { FadeIn, FadeInDown } from "react-native-reanimated";

const { width: SCREEN_W } = Dimensions.get("window");
const CARD_W = Math.min(SCREEN_W - 44, 368);
const PAGE_LABELS = ["Discover", "Sign in", "Join"] as const;
const PAGE_SUBTITLES = [
  "Your city, your services",
  "Mobile number only",
  "Start in seconds",
] as const;
const LOGIN_PAGE = 1;

type LoginCardProps = React.ComponentProps<typeof LoginAuthCard>;
type Props = {
  login: LoginCardProps;
  onFocusLogin: () => void;
  onFocusRegister: () => void;
};

export function AuthCardScene({
  login,
  onFocusLogin,
  onFocusRegister,
}: Props) {
  const pagerRef = useRef<FlatList<number>>(null);
  const [page, setPage] = useState(LOGIN_PAGE);

  const scrollTo = useCallback((index: number, after?: () => void) => {
    pagerRef.current?.scrollToIndex({ index, animated: true });
    setPage(index);
    if (after) {
      setTimeout(after, 320);
    }
  }, []);

  const onScrollEnd = useCallback(
    (e: NativeSyntheticEvent<NativeScrollEvent>) => {
      const next = Math.round(e.nativeEvent.contentOffset.x / SCREEN_W);
      setPage(next);
    },
    [],
  );

  const goLogin = useCallback(() => {
    scrollTo(LOGIN_PAGE, onFocusLogin);
  }, [onFocusLogin, scrollTo]);

  const goRegister = useCallback(() => {
    scrollTo(2, onFocusRegister);
  }, [onFocusRegister, scrollTo]);

  const renderPage = useCallback(
    ({ item: index }: { item: number }) => (
      <View style={[styles.page, { width: SCREEN_W }]}>
        <View style={[styles.cardSlot, { width: CARD_W }]}>
          {index === 0 ? (
            <WelcomeAuthCard onLogin={goLogin} onRegister={goRegister} />
          ) : null}
          {index === 1 ? <LoginAuthCard {...login} /> : null}
          {index === 2 ? (
            <RegisterAuthCard onCreateAccount={goLogin} />
          ) : null}
        </View>
      </View>
    ),
    [goLogin, goRegister, login],
  );

  return (
    <Animated.View entering={FadeIn.duration(500)} style={styles.wrap}>
      <FlatList
        ref={pagerRef}
        data={[0, 1, 2]}
        renderItem={renderPage}
        keyExtractor={(i) => String(i)}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        decelerationRate="fast"
        snapToInterval={SCREEN_W}
        snapToAlignment="center"
        disableIntervalMomentum
        bounces={false}
        initialScrollIndex={LOGIN_PAGE}
        getItemLayout={(_, index) => ({
          length: SCREEN_W,
          offset: SCREEN_W * index,
          index,
        })}
        onMomentumScrollEnd={onScrollEnd}
        keyboardShouldPersistTaps="handled"
        nestedScrollEnabled
        style={styles.pager}
      />

      <View style={styles.chrome}>
        <View style={styles.dotPill}>
          {[0, 1, 2].map((i) => (
            <View
              key={i}
              style={[styles.dot, page === i && styles.dotActive]}
            />
          ))}
        </View>

        <Animated.View
          key={page}
          entering={FadeInDown.duration(280)}
          style={styles.labelBlock}
        >
          <Text style={[styles.pageLabel, { fontFamily: AUTH_FONT.bold }]}>
            {PAGE_LABELS[page]}
          </Text>
          <Text style={[styles.pageSub, { fontFamily: AUTH_FONT.regular }]}>
            {PAGE_SUBTITLES[page]}
          </Text>
        </Animated.View>

        <Text style={[styles.hint, { fontFamily: AUTH_FONT.medium }]}>
          Swipe · InstaHelp
        </Text>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    alignItems: "center",
    paddingTop: 4,
    paddingBottom: 4,
  },
  pager: {
    flexGrow: 0,
  },
  page: {
    minHeight: 408,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 10,
  },
  cardSlot: {
    alignSelf: "center",
  },
  chrome: {
    alignItems: "center",
    marginTop: 8,
    width: "100%",
  },
  dotPill: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 7,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 999,
    backgroundColor: "rgba(255,255,255,0.12)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.2)",
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "rgba(255,255,255,0.35)",
  },
  dotActive: {
    width: 22,
    backgroundColor: "#fff",
  },
  labelBlock: {
    alignItems: "center",
    marginTop: 12,
  },
  pageLabel: {
    fontSize: 13,
    color: "rgba(255,255,255,0.95)",
    letterSpacing: 0.6,
  },
  pageSub: {
    marginTop: 4,
    fontSize: 12,
    color: "rgba(255,255,255,0.55)",
    letterSpacing: 0.2,
  },
  hint: {
    marginTop: 10,
    fontSize: 10,
    color: "rgba(255,255,255,0.38)",
    letterSpacing: 1.6,
    textTransform: "uppercase",
  },
});
