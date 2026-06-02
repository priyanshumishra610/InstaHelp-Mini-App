export function toE164IndianPhone(digits10: string): string {
  const digits = digits10.replace(/\D/g, "").slice(-10);
  if (digits.length !== 10) {
    throw new Error("Enter a valid 10-digit mobile number");
  }
  return `+91${digits}`;
}

export function displayPhone(phone: string | null | undefined): string {
  if (!phone) return "—";
  const digits = phone.replace(/\D/g, "").slice(-10);
  if (digits.length === 10) return `+91 ${digits.slice(0, 5)} ${digits.slice(5)}`;
  return phone;
}
