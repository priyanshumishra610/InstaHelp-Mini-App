import {
  buildRazorpayCheckoutHtml,
  isRazorpayNavigationAllowed,
  parseRazorpayWebViewMessage,
  type RazorpayCheckoutSuccess,
} from "@/services/payments/razorpayCheckout";
import { useCallback, useMemo, useRef } from "react";
import { Modal } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import WebView from "react-native-webview";

type Props = {
  visible: boolean;
  keyId: string;
  orderId: string;
  amount: number;
  planLabel: string;
  prefillContact?: string;
  prefillName?: string;
  onSuccess: (result: RazorpayCheckoutSuccess) => void;
  onDismiss: () => void;
  onError: (message: string) => void;
};

export function RazorpayCheckoutModal({
  visible,
  keyId,
  orderId,
  amount,
  planLabel,
  prefillContact,
  prefillName,
  onSuccess,
  onDismiss,
  onError,
}: Props) {
  const webRef = useRef<WebView>(null);

  const html = useMemo(
    () =>
      buildRazorpayCheckoutHtml({
        keyId,
        orderId,
        amount,
        description: planLabel,
        prefillContact,
        prefillName,
      }),
    [keyId, orderId, amount, planLabel, prefillContact, prefillName],
  );

  const handleMessage = useCallback(
    (raw: string) => {
      const parsed = parseRazorpayWebViewMessage(raw);
      if (!parsed) return;
      if (parsed.type === "success" && parsed.data) {
        onSuccess(parsed.data);
        return;
      }
      if (parsed.type === "dismiss") {
        onDismiss();
        return;
      }
      if (parsed.type === "error") {
        onError(parsed.message ?? "Payment failed");
      }
    },
    [onDismiss, onError, onSuccess],
  );

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onDismiss}>
      <SafeAreaView className="flex-1 bg-white" edges={["top"]}>
        <WebView
          ref={webRef}
          originWhitelist={["*"]}
          source={{ html, baseUrl: "https://instahelp.in" }}
          javaScriptEnabled
          domStorageEnabled
          onMessage={(e) => handleMessage(e.nativeEvent.data)}
          onShouldStartLoadWithRequest={(req) => {
            if (req.url === "about:blank") return true;
            if (req.url.startsWith("data:")) return true;
            if (req.url.startsWith("https://instahelp.in")) return true;
            return isRazorpayNavigationAllowed(req.url);
          }}
          setSupportMultipleWindows={false}
          style={{ flex: 1, backgroundColor: "#fff" }}
        />
      </SafeAreaView>
    </Modal>
  );
}
