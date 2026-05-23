import { ActivityIndicator, StyleSheet, View } from "react-native";

export function AuthLoadingSkeleton() {
  return (
    <View style={styles.root}>
      <ActivityIndicator color="#fff" size="large" />
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#0A0A1A",
  },
});
