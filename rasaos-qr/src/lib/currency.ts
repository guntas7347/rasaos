export function formatCurrency(amountInPaisa: number): string {
  return (amountInPaisa / 100).toFixed(2);
}
