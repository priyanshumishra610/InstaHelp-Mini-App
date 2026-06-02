import { useMemo, useState } from "react";
import {
  ActivityIndicator,
  StyleSheet,
  View,
  type ViewStyle,
} from "react-native";
import WebView from "react-native-webview";

type Props = {
  html: string;
  /** width / height of the affiliate embed */
  aspectRatio: number;
  style?: ViewStyle;
};

export function FlipkartAffiliateWebView({ html, aspectRatio, style }: Props) {
  const [loading, setLoading] = useState(true);
  const [failed, setFailed] = useState(false);

  const heightStyle = useMemo(
    () => ({ width: "100%" as const, aspectRatio }),
    [aspectRatio],
  );

  return (
    <View style={[styles.wrap, heightStyle, style]}>
      {loading && !failed ? (
        <View style={styles.loader} pointerEvents="none">
          <ActivityIndicator color="#004aad" size="small" />
        </View>
      ) : null}
      {failed ? (
        <View style={styles.loader}>
          <ActivityIndicator color="#94a3b8" size="small" />
        </View>
      ) : (
        <WebView
          source={{ html }}
          originWhitelist={["*"]}
          javaScriptEnabled
          domStorageEnabled
          scrollEnabled={false}
          nestedScrollEnabled
          showsHorizontalScrollIndicator={false}
          showsVerticalScrollIndicator={false}
          setSupportMultipleWindows={false}
          style={styles.webview}
          containerStyle={styles.webviewContainer}
          onLoadStart={() => {
            setLoading(true);
            setFailed(false);
          }}
          onLoadEnd={() => setLoading(false)}
          onError={() => {
            setLoading(false);
            setFailed(true);
          }}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    overflow: "hidden",
    backgroundColor: "transparent",
  },
  webview: {
    flex: 1,
    backgroundColor: "transparent",
  },
  webviewContainer: {
    backgroundColor: "transparent",
  },
  loader: {
    ...StyleSheet.absoluteFillObject,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255,255,255,0.55)",
  },
});
