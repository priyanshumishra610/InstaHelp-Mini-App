import type { GamezopGame } from "@/constants/gamezopGames";
import { usePlayRewardsStore } from "@/store/playRewardsStore";
import { Ionicons } from "@expo/vector-icons";
import { BlurView } from "expo-blur";
import { LinearGradient } from "expo-linear-gradient";
import * as Haptics from "expo-haptics";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Modal,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import WebView from "react-native-webview";

type Props = {
  game: GamezopGame | null;
  visible: boolean;
  onClose: () => void;
};

export function GameWebViewPlayer({ game, visible, onClose }: Props) {
  const insets = useSafeAreaInsets();
  const webRef = useRef<WebView>(null);
  const [canGoBack, setCanGoBack] = useState(false);
  const [progress, setProgress] = useState(0);
  const [loaded, setLoaded] = useState(false);
  const [loadError, setLoadError] = useState(false);
  const [reloadKey, setReloadKey] = useState(0);
  const recordSession = usePlayRewardsStore((s) => s.recordGameSession);
  const awardedRef = useRef(false);

  const backdropOpacity = useSharedValue(0);
  const spin = useSharedValue(0);

  useEffect(() => {
    if (!visible) {
      setLoaded(false);
      setLoadError(false);
      setProgress(0);
      setCanGoBack(false);
      setReloadKey(0);
      awardedRef.current = false;
      return;
    }
    backdropOpacity.value = withTiming(1, { duration: 280 });
    spin.value = withRepeat(
      withTiming(360, { duration: 1400, easing: Easing.linear }),
      -1,
      false,
    );
  }, [backdropOpacity, spin, visible]);

  const handleClose = useCallback(() => {
    if (game && !awardedRef.current) {
      awardedRef.current = true;
      recordSession(game.rewardCoins);
      void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
    backdropOpacity.value = withTiming(0, { duration: 200 });
    setTimeout(onClose, 180);
  }, [backdropOpacity, game, onClose, recordSession]);

  const loaderSpinStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${spin.value}deg` }],
  }));

  const modalStyle = useAnimatedStyle(() => ({
    opacity: backdropOpacity.value,
  }));

  if (!game) return null;

  const colors = game.gradient;
  const showSplash = !loaded && !loadError;

  return (
    <Modal
      visible={visible}
      animationType="none"
      presentationStyle="fullScreen"
      onRequestClose={handleClose}
    >
      <Animated.View style={[styles.root, modalStyle]}>
        <LinearGradient
          colors={["#070b1a", "#0f172a"]}
          style={StyleSheet.absoluteFill}
        />

        <View style={[styles.topBar, { paddingTop: insets.top + 8 }]}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Go back in game"
            onPress={() => {
              if (canGoBack) webRef.current?.goBack();
              else handleClose();
            }}
            style={styles.iconBtn}
          >
            <BlurView intensity={50} tint="dark" style={styles.iconBlur}>
              <Ionicons
                name={canGoBack ? "arrow-back" : "close"}
                size={22}
                color="#f8fafc"
              />
            </BlurView>
          </Pressable>

          <View style={styles.titleWrap}>
            <Text style={styles.barTitle} numberOfLines={1}>
              {game.title}
            </Text>
            <Text style={styles.barSubtitle}>+{game.rewardCoins} coins on exit</Text>
          </View>

          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Close game"
            onPress={handleClose}
            style={styles.iconBtn}
          >
            <BlurView intensity={50} tint="dark" style={styles.iconBlur}>
              <Ionicons name="close" size={22} color="#f8fafc" />
            </BlurView>
          </Pressable>
        </View>

        {!loaded ? (
          <View style={styles.progressTrack}>
            <LinearGradient
              colors={["#818cf8", "#c084fc"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={[styles.progressFill, { width: `${Math.max(8, progress * 100)}%` }]}
            />
          </View>
        ) : null}

        <View style={styles.webWrap}>
          {showSplash ? (
            <View style={styles.splash}>
              <LinearGradient
                colors={[colors[0], colors[1], colors[2] ?? colors[1]]}
                style={StyleSheet.absoluteFill}
              />
              <BlurView intensity={40} tint="dark" style={StyleSheet.absoluteFill} />
              <Animated.View style={[styles.loaderRing, loaderSpinStyle]}>
                <LinearGradient
                  colors={["#818cf8", "#e879f9", "#818cf8"]}
                  style={styles.loaderGradient}
                />
              </Animated.View>
              <Text style={styles.splashTitle}>Preparing your game…</Text>
              <Text style={styles.splashSubtitle}>{game.title}</Text>
              <ActivityIndicator
                size="small"
                color="#c4b5fd"
                style={{ marginTop: 16 }}
              />
            </View>
          ) : null}

          {loadError ? (
            <View style={styles.error}>
              <Ionicons name="cloud-offline" size={40} color="#f87171" />
              <Text style={styles.errorTitle}>Couldn&apos;t load game</Text>
              <Text style={styles.errorBody}>Check your connection and try again.</Text>
              <Pressable
                onPress={() => {
                  setLoadError(false);
                  setLoaded(false);
                  setProgress(0);
                  setReloadKey((k) => k + 1);
                }}
                style={styles.retryBtn}
              >
                <Text style={styles.retryText}>Retry</Text>
              </Pressable>
            </View>
          ) : (
            <WebView
              key={`${game.url}-${reloadKey}`}
              ref={webRef}
              source={{ uri: game.url }}
              style={[styles.webview, !loaded && styles.webviewHidden]}
              javaScriptEnabled
              domStorageEnabled
              allowsFullscreenVideo
              allowsInlineMediaPlayback
              mediaPlaybackRequiresUserAction={false}
              startInLoadingState={false}
              onLoadProgress={({ nativeEvent }) => setProgress(nativeEvent.progress)}
              onNavigationStateChange={(nav) => setCanGoBack(nav.canGoBack)}
              onLoadEnd={() => setLoaded(true)}
              onError={() => {
                setLoadError(true);
                setLoaded(false);
              }}
            />
          )}
        </View>

        <View style={[styles.bottomSafe, { paddingBottom: insets.bottom + 8 }]} />
      </Animated.View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: "#070b1a",
  },
  topBar: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingBottom: 10,
    gap: 8,
    zIndex: 10,
  },
  iconBtn: {
    borderRadius: 14,
    overflow: "hidden",
  },
  iconBlur: {
    width: 44,
    height: 44,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.12)",
  },
  titleWrap: {
    flex: 1,
    alignItems: "center",
  },
  barTitle: {
    fontSize: 15,
    fontWeight: "900",
    color: "#f8fafc",
  },
  barSubtitle: {
    marginTop: 2,
    fontSize: 11,
    fontWeight: "600",
    color: "rgba(203,213,225,0.8)",
  },
  progressTrack: {
    height: 3,
    backgroundColor: "rgba(255,255,255,0.08)",
    marginHorizontal: 16,
    borderRadius: 999,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    borderRadius: 999,
  },
  webWrap: {
    flex: 1,
    marginTop: 4,
  },
  webview: {
    flex: 1,
    backgroundColor: "transparent",
  },
  webviewHidden: {
    opacity: 0,
    position: "absolute",
    width: "100%",
    height: "100%",
  },
  splash: {
    ...StyleSheet.absoluteFillObject,
    alignItems: "center",
    justifyContent: "center",
    zIndex: 5,
  },
  loaderRing: {
    width: 64,
    height: 64,
    borderRadius: 32,
    padding: 3,
  },
  loaderGradient: {
    flex: 1,
    borderRadius: 32,
    borderWidth: 3,
    borderColor: "transparent",
    ...Platform.select({
      ios: {
        shadowColor: "#a78bfa",
        shadowOpacity: 0.6,
        shadowRadius: 16,
      },
    }),
  },
  splashTitle: {
    marginTop: 20,
    fontSize: 18,
    fontWeight: "900",
    color: "#f8fafc",
  },
  splashSubtitle: {
    marginTop: 6,
    fontSize: 13,
    fontWeight: "600",
    color: "rgba(203,213,225,0.85)",
  },
  error: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
  },
  errorTitle: {
    marginTop: 12,
    fontSize: 18,
    fontWeight: "900",
    color: "#f8fafc",
  },
  errorBody: {
    marginTop: 8,
    fontSize: 14,
    color: "rgba(203,213,225,0.85)",
    textAlign: "center",
  },
  retryBtn: {
    marginTop: 16,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 999,
    backgroundColor: "#6366f1",
  },
  retryText: {
    fontSize: 14,
    fontWeight: "800",
    color: "#fff",
  },
  bottomSafe: {
    backgroundColor: "#070b1a",
  },
});
