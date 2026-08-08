import { GlowButton } from "@/components/ui/GlowButton";
import { AppIcon } from "@/components/ui/AppIcon";
import { VENDOR_REVEAL_CREDIT_COST } from "@/constants/vendorMarketplace";
import { AUTH_FONT } from "@/constants/authPremium";
import { COLORS, RADIUS, SPACE, cardShadow } from "@/constants/designSystem";
import { ACCENT, ACCENT_TINT } from "@/constants/theme";
import { vendorDisplayName } from "@/services/vendors/vendorQueryHelpers";
import type { VendorRecord } from "@/types/vendorMarketplace";
import { maskPhoneForDisplay, normalizePhoneDigits } from "@/utils/vendorPhone";
import { dialPhone, emailVendor, openVendorWhatsApp } from "@/utils/vendorContactActions";
import type { AppIconKey } from "@/constants/icons";
import { Pressable, StyleSheet, Text, View } from "react-native";

type Props = {
  vendor: VendorRecord;
  unlocked: boolean;
  revealCostLabel?: string;
  usesPlanReveal?: boolean;
  onReveal: () => void;
  /** card = scroll section · footer = sticky bottom bar */
  mode?: "card" | "footer";
};

function InfoRow({
  label,
  value,
  last,
  onPress,
}: {
  label: string;
  value: string;
  last?: boolean;
  onPress?: () => void;
}) {
  const content = (
    <>
      <Text style={[styles.infoLabel, { fontFamily: AUTH_FONT.medium }]}>{label}</Text>
      <Text
        style={[
          styles.infoValue,
          { fontFamily: AUTH_FONT.semibold },
          onPress && styles.infoValueLink,
        ]}
        selectable
      >
        {value}
      </Text>
    </>
  );

  if (onPress) {
    return (
      <Pressable
        onPress={onPress}
        accessibilityRole="button"
        accessibilityLabel={label}
        style={[styles.infoRow, last && styles.infoRowLast]}
      >
        {content}
      </Pressable>
    );
  }

  return <View style={[styles.infoRow, last && styles.infoRowLast]}>{content}</View>;
}

function ActionButton({
  label,
  icon,
  onPress,
  variant = "primary",
  disabled,
}: {
  label: string;
  icon: AppIconKey;
  onPress: () => void;
  variant?: "primary" | "outline" | "whatsapp";
  disabled?: boolean;
}) {
  const isPrimary = variant === "primary";
  const isWhatsapp = variant === "whatsapp";

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      accessibilityRole="button"
      accessibilityLabel={label}
      style={({ pressed }) => [
        styles.actionBtn,
        isPrimary && styles.actionBtnPrimary,
        isWhatsapp && styles.actionBtnWhatsapp,
        variant === "outline" && styles.actionBtnOutline,
        pressed && styles.actionBtnPressed,
        disabled && styles.actionBtnDisabled,
      ]}
    >
      <AppIcon
        name={icon}
        size={18}
        color={isPrimary ? "#FFFFFF" : isWhatsapp ? "#16A34A" : COLORS.ink}
      />
      <Text
        style={[
          styles.actionLabel,
          { fontFamily: AUTH_FONT.semibold },
          isPrimary && styles.actionLabelPrimary,
          isWhatsapp && styles.actionLabelWhatsapp,
        ]}
      >
        {label}
      </Text>
    </Pressable>
  );
}

export function VendorContactRevealPanel({
  vendor,
  unlocked,
  revealCostLabel,
  usesPlanReveal,
  onReveal,
  mode = "card",
}: Props) {
  const name = vendorDisplayName(vendor);
  const digits = normalizePhoneDigits(vendor.phone);
  const revealLabel = revealCostLabel ?? `${VENDOR_REVEAL_CREDIT_COST} credits`;

  if (mode === "footer") {
    if (unlocked) {
      return (
        <View style={styles.footerRow}>
          <ActionButton
            label="Call"
            icon="phone"
            onPress={() => dialPhone(vendor.phone)}
            disabled={!digits}
            variant="primary"
          />
          <ActionButton
            label="WhatsApp"
            icon="whatsapp"
            onPress={() =>
              openVendorWhatsApp(
                vendor.phone,
                `Hi ${name}, I found you on InstaHelp and would like to book a service.`,
              )
            }
            disabled={digits.length < 8}
            variant="whatsapp"
          />
        </View>
      );
    }

    return (
      <View style={styles.footerLocked}>
        <View style={styles.footerLockedMeta}>
          <View style={styles.lockIconWrap}>
            <AppIcon name="lock" size={16} color={ACCENT} />
          </View>
          <View style={styles.footerLockedText}>
            <Text style={[styles.footerLockedTitle, { fontFamily: AUTH_FONT.semibold }]}>
              Contact locked
            </Text>
            <Text style={[styles.footerLockedHint, { fontFamily: AUTH_FONT.regular }]}>
              {maskPhoneForDisplay(vendor.phone)}
            </Text>
          </View>
        </View>
        <GlowButton
          label={`Reveal · ${revealLabel}`}
          onPress={onReveal}
          fullWidth
          accessibilityLabel="Reveal vendor contact"
        />
      </View>
    );
  }

  if (unlocked) {
    return (
      <View style={[styles.card, cardShadow("card")]}>
        <View style={styles.cardHeader}>
          <AppIcon name="checkCircle" size={18} color={COLORS.success} chip chipColor={COLORS.successSoft} />
          <Text style={[styles.cardTitle, { fontFamily: AUTH_FONT.bold }]}>
            Contact unlocked
          </Text>
        </View>

        <InfoRow
          label="Phone"
          value={vendor.phone ?? "Not available"}
          onPress={digits ? () => dialPhone(vendor.phone) : undefined}
        />
        {vendor.email ? (
          <InfoRow
            label="Email"
            value={vendor.email}
            onPress={() => emailVendor(vendor.email, `Inquiry via InstaHelp — ${name}`)}
          />
        ) : null}
        <InfoRow
          label="Address"
          value={vendor.address || `${vendor.areaLabel}, Bengaluru`}
          last
        />

        <Text style={[styles.cardHint, { fontFamily: AUTH_FONT.regular }]}>
          Use Call or WhatsApp in the bar below to reach this vendor.
        </Text>
      </View>
    );
  }

  return (
    <View style={[styles.card, cardShadow("card")]}>
      <View style={styles.lockedCenter}>
        <View style={styles.lockBadge}>
          <AppIcon name="lock" size={22} color={ACCENT} />
        </View>
        <Text style={[styles.lockedTitle, { fontFamily: AUTH_FONT.bold }]}>
          Contact locked
        </Text>
        <Text style={[styles.lockedBody, { fontFamily: AUTH_FONT.regular }]}>
          {usesPlanReveal
            ? `Use your Explore plan to unlock call and WhatsApp (${revealLabel}).`
            : `Use ${revealLabel} to unlock call and WhatsApp for this vendor.`}
        </Text>
      </View>

      <View style={styles.maskedPhoneBox}>
        <Text style={[styles.maskedPhone, { fontFamily: AUTH_FONT.medium }]}>
          {maskPhoneForDisplay(vendor.phone)}
        </Text>
      </View>

      <GlowButton
        label={`Reveal contact · ${revealLabel}`}
        onPress={onReveal}
        fullWidth
        accessibilityLabel="Reveal vendor contact"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: RADIUS.lg,
    backgroundColor: COLORS.surface,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "rgba(23,23,23,0.08)",
    padding: SPACE.md,
    gap: SPACE.sm,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 4,
  },
  cardTitle: {
    fontSize: 16,
    color: COLORS.ink,
    letterSpacing: -0.2,
  },
  infoRow: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "rgba(23,23,23,0.08)",
    paddingVertical: 12,
  },
  infoRowLast: {
    borderBottomWidth: 0,
  },
  infoLabel: {
    fontSize: 12,
    color: COLORS.inkMuted,
  },
  infoValue: {
    marginTop: 2,
    fontSize: 15,
    color: COLORS.ink,
    lineHeight: 21,
  },
  infoValueLink: {
    color: ACCENT,
  },
  cardHint: {
    marginTop: 4,
    fontSize: 12,
    lineHeight: 17,
    color: COLORS.inkSubtle,
  },
  actionRow: {
    flexDirection: "row",
    gap: 10,
    marginTop: 4,
  },
  actionBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    borderRadius: RADIUS.md,
    paddingVertical: 13,
  },
  actionBtnPrimary: {
    backgroundColor: ACCENT,
  },
  actionBtnWhatsapp: {
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "rgba(22,163,74,0.25)",
  },
  actionBtnOutline: {
    backgroundColor: COLORS.lineLight,
    borderWidth: 1,
    borderColor: "rgba(23,23,23,0.08)",
    marginTop: 2,
  },
  actionBtnPressed: {
    opacity: 0.88,
  },
  actionBtnDisabled: {
    opacity: 0.45,
  },
  actionLabel: {
    fontSize: 14,
    color: COLORS.ink,
  },
  actionLabelPrimary: {
    color: "#FFFFFF",
  },
  actionLabelWhatsapp: {
    color: "#16A34A",
  },
  lockedCenter: {
    alignItems: "center",
    paddingVertical: 8,
    gap: 8,
  },
  lockBadge: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: ACCENT_TINT,
    alignItems: "center",
    justifyContent: "center",
  },
  lockedTitle: {
    fontSize: 17,
    color: COLORS.ink,
    letterSpacing: -0.2,
  },
  lockedBody: {
    fontSize: 13,
    lineHeight: 19,
    color: COLORS.inkMuted,
    textAlign: "center",
    paddingHorizontal: 8,
  },
  maskedPhoneBox: {
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: "rgba(23,23,23,0.08)",
    backgroundColor: COLORS.lineLight,
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  maskedPhone: {
    textAlign: "center",
    fontSize: 15,
    letterSpacing: 1.2,
    color: COLORS.inkMuted,
    fontVariant: ["tabular-nums"],
  },
  footerRow: {
    flexDirection: "row",
    gap: 10,
  },
  footerLocked: {
    gap: 12,
  },
  footerLockedMeta: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  lockIconWrap: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: ACCENT_TINT,
    alignItems: "center",
    justifyContent: "center",
  },
  footerLockedText: {
    flex: 1,
    gap: 2,
  },
  footerLockedTitle: {
    fontSize: 14,
    color: COLORS.ink,
  },
  footerLockedHint: {
    fontSize: 12,
    color: COLORS.inkMuted,
    letterSpacing: 0.8,
    fontVariant: ["tabular-nums"],
  },
});
