export type RazorpayCheckoutSuccess = {
  razorpay_payment_id: string;
  razorpay_order_id: string;
  razorpay_signature: string;
};

type BuildCheckoutHtmlInput = {
  keyId: string;
  orderId: string;
  amount: number;
  name?: string;
  description?: string;
  prefillContact?: string;
  prefillName?: string;
};

export function buildRazorpayCheckoutHtml(input: BuildCheckoutHtmlInput): string {
  const payload = JSON.stringify({
    key: input.keyId,
    amount: input.amount,
    currency: "INR",
    name: input.name ?? "InstaHelp",
    description: input.description ?? "Explore plan subscription",
    order_id: input.orderId,
    prefill: {
      contact: input.prefillContact ?? "",
      name: input.prefillName ?? "",
    },
    theme: { color: "#004aad" },
  });

  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1" />
  <title>Payment</title>
  <style>body { margin: 0; background: #fff; }</style>
</head>
<body>
  <script src="https://checkout.razorpay.com/v1/checkout.js"></script>
  <script>
    (function () {
      var options = ${payload};
      options.handler = function (response) {
        window.ReactNativeWebView.postMessage(JSON.stringify({
          type: "success",
          razorpay_payment_id: response.razorpay_payment_id,
          razorpay_order_id: response.razorpay_order_id,
          razorpay_signature: response.razorpay_signature
        }));
      };
      options.modal = {
        ondismiss: function () {
          window.ReactNativeWebView.postMessage(JSON.stringify({ type: "dismiss" }));
        }
      };
      try {
        var rzp = new Razorpay(options);
        rzp.on("payment.failed", function (resp) {
          window.ReactNativeWebView.postMessage(JSON.stringify({
            type: "error",
            message: (resp.error && resp.error.description) || "Payment failed"
          }));
        });
        rzp.open();
      } catch (err) {
        window.ReactNativeWebView.postMessage(JSON.stringify({
          type: "error",
          message: err && err.message ? err.message : "Could not open checkout"
        }));
      }
    })();
  </script>
</body>
</html>`;
}

const RAZORPAY_HOSTS = new Set([
  "api.razorpay.com",
  "checkout.razorpay.com",
  "lumberjack.razorpay.com",
]);

export function isRazorpayNavigationAllowed(url: string): boolean {
  try {
    const host = new URL(url).hostname;
    return RAZORPAY_HOSTS.has(host);
  } catch {
    return false;
  }
}

export function parseRazorpayWebViewMessage(raw: string): {
  type: "success" | "dismiss" | "error";
  data?: RazorpayCheckoutSuccess;
  message?: string;
} | null {
  try {
    const parsed = JSON.parse(raw) as {
      type?: string;
      message?: string;
      razorpay_payment_id?: string;
      razorpay_order_id?: string;
      razorpay_signature?: string;
    };
    if (parsed.type === "success") {
      if (
        !parsed.razorpay_payment_id ||
        !parsed.razorpay_order_id ||
        !parsed.razorpay_signature
      ) {
        return { type: "error", message: "Incomplete payment response" };
      }
      return {
        type: "success",
        data: {
          razorpay_payment_id: parsed.razorpay_payment_id,
          razorpay_order_id: parsed.razorpay_order_id,
          razorpay_signature: parsed.razorpay_signature,
        },
      };
    }
    if (parsed.type === "dismiss") return { type: "dismiss" };
    if (parsed.type === "error") {
      return { type: "error", message: parsed.message ?? "Payment failed" };
    }
    return null;
  } catch {
    return null;
  }
}
