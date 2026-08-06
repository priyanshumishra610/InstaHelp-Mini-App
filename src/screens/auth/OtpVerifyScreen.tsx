import { AUTH_FONT } from "@/constants/authPremium";
import {
  Poppins_400Regular,
  Poppins_500Medium,
  Poppins_600SemiBold,
  Poppins_700Bold,
  useFonts,
} from "@expo-google-fonts/poppins";
import { LinearGradient } from "expo-linear-gradient";
import { Redirect } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { ActivityIndicator, StyleSheet, Text, View } from "react-native";

/** OTP / Firebase auth disabled — backend sign-in uses phone only. */
export function OtpVerifyScreen() {
  const [fontsLoaded] = useFonts({
    Poppins_400Regular,
    Poppins_500Medium,
    Poppins_600SemiBold,
    Poppins_700Bold,
  });

  if (!fontsLoaded) {
    return (
      <View style={[styles.root, styles.center]}>
        <ActivityIndicator color="#fff" />
      </View>
    );
  }

  return (
    <>
      <Redirect href="/(auth)/phone" />
      <View style={styles.root}>
        <StatusBar style="light" />
        <LinearGradient
          colors={["#0A0A1A", "#0f1028", "#12122a"]}
          style={StyleSheet.absoluteFill}
        />
        <View style={styles.center}>
          <Text style={[styles.note, { fontFamily: AUTH_FONT.medium }]}>
            Redirecting…
          </Text>
        </View>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: "#0A0A1A" },
  center: { flex: 1, alignItems: "center", justifyContent: "center" },
  note: { fontSize: 14, color: "rgba(255,255,255,0.55)" },
});
