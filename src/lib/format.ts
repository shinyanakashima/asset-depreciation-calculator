/**
 * 数値を3桁カンマ区切り（円）でフォーマット
 */
export function formatCurrency(value: number): string {
  return value.toLocaleString("ja-JP");
}

/**
 * 小数をパーセント表記にフォーマット（例: 0.400 → "0.400"）
 */
export function formatRate(value: number, digits = 3): string {
  return value.toFixed(digits);
}

/**
 * 月数フォーマット
 */
export function formatMonths(months: number): string {
  return `${months}か月`;
}
