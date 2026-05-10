import { cn } from "@/utils/cn";
import { forwardRef, useState } from "react";
import { TextInput, type TextInputProps } from "react-native";

type Props = TextInputProps & {
  className?: string;
  error?: boolean;
};

export const Input = forwardRef<TextInput, Props>(function Input(
  { className, error, onFocus, onBlur, ...rest },
  ref,
) {
  const [focused, setFocused] = useState(false);

  return (
    <TextInput
      ref={ref}
      placeholderTextColor="#9ca3af"
      onFocus={(e) => {
        setFocused(true);
        onFocus?.(e);
      }}
      onBlur={(e) => {
        setFocused(false);
        onBlur?.(e);
      }}
      className={cn(
        "rounded-2xl border bg-white px-4 py-3.5 text-base text-neutral-900 dark:bg-neutral-900 dark:text-neutral-50",
        "border-neutral-200 dark:border-neutral-800",
        focused && "border-accent",
        error && "border-red-400",
        className,
      )}
      {...rest}
    />
  );
});
