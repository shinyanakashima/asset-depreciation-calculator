import type { RoundingMethod } from "@/types/depreciation";

/**
 * 端数処理
 */
export function applyRounding(value: number, method: RoundingMethod): number {
  switch (method) {
    case "floor":
      return Math.floor(value);
    case "round":
      return Math.round(value);
    case "ceil":
      return Math.ceil(value);
  }
}

/**
 * 月割月数を計算する
 * 供用月を1か月として算入（法人税実務基準）
 * fromDate: 供用開始日（YYYY-MM-DD）
 * toDate: 期末日（YYYY-MM-DD）
 * 例: 2024-08-15 〜 2025-03-31 → 8か月
 */
export function calcProratedMonths(fromDate: string, toDate: string): number {
  const from = new Date(fromDate);
  const to = new Date(toDate);

  const fromYear = from.getFullYear();
  const fromMonth = from.getMonth() + 1; // 1-12

  const toYear = to.getFullYear();
  const toMonth = to.getMonth() + 1; // 1-12

  // 供用月から期末月まで（両端含む）
  const months = (toYear - fromYear) * 12 + (toMonth - fromMonth) + 1;
  return Math.max(0, Math.min(months, 12));
}

/**
 * 日付文字列から年・月・日を取得
 */
export function parseDate(dateStr: string): { year: number; month: number; day: number } {
  const [year, month, day] = dateStr.split("-").map(Number);
  return { year: year!, month: month!, day: day! };
}

/**
 * 日付の妥当性検証
 */
export function isValidDate(dateStr: string): boolean {
  if (!dateStr) return false;
  const d = new Date(dateStr);
  return !isNaN(d.getTime());
}
