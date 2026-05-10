const DEFAULT_APPS_SCRIPT_URL =
  "https://script.google.com/macros/s/AKfycbxY3jUaZff3lpInIyOMxmy_vpRsueaghpf2ko8EQlrrVWERpG58pcFEQkDmLSxxxcq7/exec";

const DEFAULT_WHATSAPP_E164 = "917022702220";

export const APPS_SCRIPT_URL =
  process.env.EXPO_PUBLIC_APPS_SCRIPT_URL || DEFAULT_APPS_SCRIPT_URL;

export const WHATSAPP_E164 =
  process.env.EXPO_PUBLIC_WHATSAPP_E164 || DEFAULT_WHATSAPP_E164;
