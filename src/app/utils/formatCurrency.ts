// Utility to format numbers as VND currency with the đ symbol
export function formatCurrency(amount: number): string {
  if (isNaN(amount)) return "0đ";
  return amount.toLocaleString("vi-VN") + "đ";
}
