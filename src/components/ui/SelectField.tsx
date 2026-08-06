import { AnimatedPressable } from "@/components/ui/AnimatedPressable";
import { Ionicons } from "@expo/vector-icons";
import { MotiView } from "moti";
import { useState } from "react";
import { Modal, Pressable, ScrollView, Text, View } from "react-native";

export type SelectOption<T extends string = string> = {
  value: T;
  label: string;
  hint?: string;
};

type Props<T extends string = string> = {
  value: T | "";
  options: SelectOption<T>[];
  onChange: (value: T) => void;
  placeholder?: string;
  /** Title displayed at the top of the bottom-sheet picker. */
  pickerTitle?: string;
  error?: boolean;
  disabled?: boolean;
};

export function SelectField<T extends string = string>({
  value,
  options,
  onChange,
  placeholder = "Select an option",
  pickerTitle,
  error,
  disabled,
}: Props<T>) {
  const [open, setOpen] = useState(false);
  const selected = options.find((o) => o.value === value);

  const close = () => setOpen(false);

  return (
    <>
      <AnimatedPressable
        onPress={() => !disabled && setOpen(true)}
        accessibilityRole="button"
        accessibilityLabel={pickerTitle ?? placeholder}
        accessibilityState={{ disabled: !!disabled }}
        scaleTo={0.98}
        className={`flex-row items-center justify-between rounded-2xl border bg-white px-4 py-3.5 ${
          error ? "border-red-400" : "border-neutral-200"
        } ${disabled ? "opacity-50" : ""}`}
      >
        <Text
          className={`flex-1 text-base ${
            selected ? "text-neutral-900" : "text-neutral-400"
          }`}
          numberOfLines={1}
        >
          {selected ? selected.label : placeholder}
        </Text>
        <MotiView
          animate={{ rotate: open ? "180deg" : "0deg" }}
          transition={{ type: "timing", duration: 200 }}
        >
          <Ionicons
            name="chevron-down"
            size={18}
            color={error ? "#dc2626" : "#737373"}
          />
        </MotiView>
      </AnimatedPressable>

      <Modal
        transparent
        visible={open}
        animationType="fade"
        onRequestClose={close}
      >
        <Pressable
          onPress={close}
          className="flex-1 items-center justify-end bg-black/40"
        >
          <MotiView
            from={{ translateY: 40, opacity: 0 }}
            animate={{ translateY: 0, opacity: 1 }}
            transition={{ type: "spring", damping: 22, stiffness: 260 }}
          >
          <Pressable
            onPress={() => {}}
            className="w-full rounded-t-3xl bg-white pb-6 pt-5"
          >
            <View className="mx-auto mb-3 h-1 w-10 rounded-full bg-neutral-200" />
            <View className="px-5 pb-3">
              <Text className="text-base font-extrabold text-neutral-900">
                {pickerTitle ?? "Pick an option"}
              </Text>
            </View>
            <ScrollView
              style={{ maxHeight: 360 }}
              contentContainerStyle={{ paddingBottom: 8 }}
            >
              {options.map((opt) => {
                const active = opt.value === value;
                return (
                  <Pressable
                    key={opt.value}
                    onPress={() => {
                      onChange(opt.value);
                      close();
                    }}
                    className={`flex-row items-center gap-3 px-5 py-3.5 ${
                      active ? "bg-neutral-50" : ""
                    } active:bg-neutral-100`}
                  >
                    <MotiView
                      animate={{
                        backgroundColor: active ? "#171717" : "#ffffff",
                        borderColor: active ? "#171717" : "#d4d4d4",
                      }}
                      transition={{ type: "timing", duration: 160 }}
                      className="h-5 w-5 items-center justify-center rounded-full border"
                    >
                      <MotiView
                        from={{ scale: 0, opacity: 0 }}
                        animate={{
                          scale: active ? 1 : 0,
                          opacity: active ? 1 : 0,
                        }}
                        transition={{ type: "spring", damping: 14, stiffness: 400 }}
                      >
                        <Ionicons name="checkmark" size={12} color="#ffffff" />
                      </MotiView>
                    </MotiView>
                    <View className="flex-1">
                      <Text
                        className={`text-[15px] ${
                          active
                            ? "font-bold text-neutral-900"
                            : "font-medium text-neutral-800"
                        }`}
                      >
                        {opt.label}
                      </Text>
                      {opt.hint ? (
                        <Text className="mt-0.5 text-xs text-neutral-500">
                          {opt.hint}
                        </Text>
                      ) : null}
                    </View>
                  </Pressable>
                );
              })}
            </ScrollView>
          </Pressable>
          </MotiView>
        </Pressable>
      </Modal>
    </>
  );
}
