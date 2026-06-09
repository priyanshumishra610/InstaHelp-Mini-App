export type HubbleEnvironment = "development" | "production";

export type HubbleSdkParams = {
  clientId: string;
  appSecret: string;
  "wrap-plt": "rn";
  appVersion?: string;
  deviceId?: string;
};

export type HubbleActionName = "close" | "app_ready" | "error";

export type HubbleActionEvent = {
  type: "action";
  action: HubbleActionName;
};

export type HubbleAnalyticsEvent = {
  type: "analytics";
  event: string;
  properties: Record<string, unknown>;
};

export type HubbleHostEvent = HubbleActionEvent | HubbleAnalyticsEvent;

export type BuildHubbleUrlInput = {
  environment: HubbleEnvironment;
  clientId: string;
  appSecret: string;
  wrapPlt: "rn";
  /** RS256 JWT from your backend — required when lazy login is off on the Hubble tenant. */
  token?: string;
  appVersion?: string;
  deviceId?: string;
  /**
   * SDK route after the host per Hubble deep links, without leading slash.
   * Examples: "", "search", "buy/{brandId}", "transactions", "help", "coin-transactions"
   */
  sdkPath?: string;
  extraQuery?: Record<string, string | number | boolean | undefined | null>;
};
