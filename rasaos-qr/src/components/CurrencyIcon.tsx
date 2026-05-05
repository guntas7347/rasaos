interface CurrencyIconProps {
  className?: string;
  currency?: 'INR' | 'USD';
}

export function CurrencyIcon({ className = '', currency = 'INR' }: CurrencyIconProps) {
  if (currency === 'INR') {
    return <span className={className}>₹</span>;
  }
  return <span className={className}>$</span>;
}
