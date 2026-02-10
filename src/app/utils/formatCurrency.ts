// Utility to format numbers as VND currency with the đ symbol
export function formatCurrency(amount: number): string {
  if (isNaN(amount)) return "0 đ";
  return amount.toLocaleString("vi-VN", { style: "currency", currency: "VND" });
}
