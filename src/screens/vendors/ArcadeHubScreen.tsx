import { GameWebViewPlayer } from "@/components/gaming/GameWebViewPlayer";
import { GamingAdBanner } from "@/components/gaming/hub/GamingAdBanner";
import { GamingHubBackground } from "@/components/gaming/hub/GamingHubBackground";
import { GamingHubHeader } from "@/components/gaming/hub/GamingHubHeader";
import { InstantPlaysSection } from "@/components/gaming/hub/InstantPlaysSection";
import { MyGamesSection } from "@/components/gaming/hub/MyGamesSection";
import { RecommendedSection } from "@/components/gaming/hub/RecommendedSection";
import {
  FEATURED_AD_GAME,
  MY_GAMES,
  RECOMMENDED_GAMES,
  TOP_INSTANT_PLAYS,
} from "@/constants/gamingHub";
import type { GamezopGame } from "@/constants/gamezopGames";
import { usePlayRewardsStore } from "@/store/playRewardsStore";
import { StatusBar } from "expo-status-bar";
import { useCallback, useState } from "react";
import { Alert, ScrollView, StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export function ArcadeHubScreen() {
  const insets = useSafeAreaInsets();
  const [activeGame, setActiveGame] = useState<GamezopGame | null>(null);
  const [playerVisible, setPlayerVisible] = useState(false);
  const playCoins = usePlayRewardsStore((s) => s.playCoins);
  const claimDaily = usePlayRewardsStore((s) => s.claimDailyReward);

  const openGame = useCallback((game: GamezopGame) => {
    setActiveGame(game);
    setPlayerVisible(true);
  }, []);

  const closePlayer = useCallback(() => {
    setPlayerVisible(false);
    setTimeout(() => setActiveGame(null), 220);
  }, []);

  const onGiftPress = useCallback(() => {
    const result = claimDaily();
    if (result.ok) {
      Alert.alert("Daily reward", `+${result.amount} play coins added!`);
    } else {
      Alert.alert("Rewards", `You have ${playCoins} play coins. Keep playing to earn more!`);
    }
  }, [claimDaily, playCoins]);

  return (
    <View style={styles.root}>
      <StatusBar style="light" />
      <GamingHubBackground />

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={{
          paddingTop: insets.top + 6,
          paddingBottom: insets.bottom + 24,
        }}
        showsVerticalScrollIndicator={false}
      >
        <GamingHubHeader onGiftPress={onGiftPress} />
        <MyGamesSection games={MY_GAMES} onPlay={openGame} />
        <RecommendedSection games={RECOMMENDED_GAMES} onPlay={openGame} />
        <GamingAdBanner
          game={FEATURED_AD_GAME}
          displayTitle="Arrow GO!"
          onPlay={openGame}
        />
        <InstantPlaysSection games={TOP_INSTANT_PLAYS} onPlay={openGame} />
      </ScrollView>

      <GameWebViewPlayer
        game={activeGame}
        visible={playerVisible}
        onClose={closePlayer}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: "#1a0b2e",
  },
  scroll: {
    flex: 1,
  },
});
