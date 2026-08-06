import { AUTH_PRIMARY } from "@/constants/authPremium";
import { ActivityIndicator, StyleSheet, View } from "react-native";

export function AuthLoadingSkeleton() {
  return (
    <View style={styles.root}>
      <ActivityIndicator color={AUTH_PRIMARY} size="large" />
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#F7F6FB",
  },
});
