import { DollarSign, IndianRupee } from "lucide-react";

interface CurrencyIconProps {
  className?: string;
  currency?: "USD" | "INR";
  size?: number;
}

export function CurrencyIcon({ className, currency = "INR", size = 16 }: CurrencyIconProps) {
  if (currency === "USD") {
    return <DollarSign className={className} size={size} />;
  }
  return <IndianRupee className={className} size={size} />;
}
