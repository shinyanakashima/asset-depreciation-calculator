import type {
  DepreciationInput,
  DepreciationRow,
  DepreciationResult,
  MethodApplied,
} from "@/types/depreciation";
import { getDecl200Param } from "@/master/depreciationParams";
import { applyRounding, calcProratedMonths } from "./date-utils";

/**
 * 保証額を計算する
 * 保証額 = 取得価額 × 保証率
 */
export function calcGuaranteeAmount(
  acquisitionCost: number,
  guaranteeRate: number
): number {
  return acquisitionCost * guaranteeRate;
}

/**
 * 切替判定: 通常償却額 < 保証額 になったら改定償却率へ切替
 */
export function shouldSwitchToRevised(
  normalDepreciation: number,
  guaranteeAmount: number
): boolean {
  return normalDepreciation < guaranteeAmount;
}

/**
 * 200%定率法の1年分の年間償却費を計算する
 */
export function calcDeclining200Annual(
  bookValueStart: number,
  depreciationRate: number,
  revisedRate: number,
  guaranteeAmount: number,
  rounding: DepreciationInput["rounding"]
): { amount: number; methodApplied: MethodApplied; rate: number; switched: boolean } {
  const normal = applyRounding(bookValueStart * depreciationRate, rounding);
  if (shouldSwitchToRevised(normal, guaranteeAmount)) {
    const revised = applyRounding(bookValueStart * revisedRate, rounding);
    return { amount: revised, methodApplied: "revised", rate: revisedRate, switched: true };
  }
  return { amount: normal, methodApplied: "declining", rate: depreciationRate, switched: false };
}

/**
 * 年度ラベルを生成する（供用開始年度を第1期として）
 */
function buildPeriodLabel(yearIndex: number, serviceStartDate: string, fiscalYearStartMonth: number): string {
  const [startYear] = serviceStartDate.split("-").map(Number);
  const startMonth = Number(serviceStartDate.split("-")[1]);
  const firstFiscalYear =
    startMonth >= fiscalYearStartMonth ? startYear : startYear - 1;
  const fiscalYear = firstFiscalYear + yearIndex;
  return `${fiscalYear}年度（第${yearIndex + 1}期）`;
}

/**
 * 月割月数を求める（供用開始月〜年度末月）
 * 初年度のみ供用月から、2年度以降は12か月
 */
function calcYearProratedMonths(
  yearIndex: number,
  serviceStartDate: string,
  fiscalYearEndDate: string
): number {
  if (yearIndex === 0) {
    return calcProratedMonths(serviceStartDate, fiscalYearEndDate);
  }
  return 12;
}

/**
 * 200%定率法の償却表を全期間計算する
 */
export function calcDeclining200(input: DepreciationInput): DepreciationResult {
  const param = getDecl200Param(input.usefulLife);
  if (!param) {
    throw new Error(`耐用年数 ${input.usefulLife} 年のパラメータが見つかりません`);
  }

  const guaranteeAmount = calcGuaranteeAmount(input.acquisitionCost, param.guaranteeRate);
  const rows: DepreciationRow[] = [];

  let bookValue = input.acquisitionCost;
  let alreadySwitched = false;

  for (let i = 0; i < input.usefulLife; i++) {
    const bookValueStart = bookValue;
    const isFinalYear = i === input.usefulLife - 1;

    let annualDepreciation: number;
    let methodApplied: MethodApplied;
    let rate: number;
    let switchedThisYear = false;

    if (isFinalYear) {
      annualDepreciation = input.keepOneYen ? bookValueStart - 1 : bookValueStart;
      methodApplied = "final";
      rate = alreadySwitched ? param.revisedRate : param.depreciationRate;
    } else if (alreadySwitched) {
      annualDepreciation = applyRounding(bookValueStart * param.revisedRate, input.rounding);
      methodApplied = "revised";
      rate = param.revisedRate;
    } else {
      const res = calcDeclining200Annual(
        bookValueStart,
        param.depreciationRate,
        param.revisedRate,
        guaranteeAmount,
        input.rounding
      );
      annualDepreciation = res.amount;
      methodApplied = res.methodApplied;
      rate = res.rate;
      switchedThisYear = res.switched;
      if (switchedThisYear) alreadySwitched = true;
    }

    const proratedMonths = calcYearProratedMonths(
      i,
      input.serviceStartDate,
      input.fiscalYearEndDate
    );

    let currentDepreciation: number;
    if (proratedMonths >= 12) {
      currentDepreciation = annualDepreciation;
    } else {
      currentDepreciation = applyRounding(
        (annualDepreciation * proratedMonths) / 12,
        input.rounding
      );
    }

    const bookValueEnd = bookValueStart - currentDepreciation;

    let note: string | undefined;
    if (isFinalYear) note = "最終年度（1円残し調整）";
    else if (switchedThisYear) note = "改定償却率へ切替";

    rows.push({
      yearIndex: i,
      periodLabel: buildPeriodLabel(i, input.serviceStartDate, input.fiscalYearStartMonth),
      bookValueStart,
      methodApplied,
      rate,
      annualDepreciation,
      proratedMonths,
      currentDepreciation,
      bookValueEnd,
      switchedThisYear: switchedThisYear || (alreadySwitched && !isFinalYear && i > 0),
      note,
    });

    bookValue = bookValueEnd;
  }

  const currentYearRow = findCurrentYearRow(rows, input);
  return { rows, guaranteeAmount, currentYearRow };
}

/**
 * 入力された fiscalYearEndDate が属する年度の行を探す
 */
function findCurrentYearRow(
  rows: DepreciationRow[],
  input: DepreciationInput
): DepreciationRow | null {
  const serviceStart = new Date(input.serviceStartDate);
  const fiscalEnd = new Date(input.fiscalYearEndDate);

  const serviceYear = serviceStart.getFullYear();
  const serviceMonth = serviceStart.getMonth() + 1;

  const firstFiscalYear =
    serviceMonth >= input.fiscalYearStartMonth ? serviceYear : serviceYear - 1;

  const endYear = fiscalEnd.getFullYear();
  const endMonth = fiscalEnd.getMonth() + 1;

  let currentFiscalYear = endYear;
  if (endMonth < input.fiscalYearStartMonth) {
    currentFiscalYear = endYear - 1;
  }

  const yearIndex = currentFiscalYear - firstFiscalYear;
  return rows.find((r) => r.yearIndex === yearIndex) ?? null;
}

/**
 * 当期の月別償却費内訳を返す
 * 各月の償却費 = applyRounding(年間償却費 / 12, rounding)
 */
export function calcMonthlyBreakdown(
  row: DepreciationRow,
  input: DepreciationInput
): { month: string; depreciation: number }[] {
  const fiscalEnd = new Date(input.fiscalYearEndDate);
  const endYear = fiscalEnd.getFullYear();
  const endMonth = fiscalEnd.getMonth() + 1;
  const months = row.proratedMonths;
  const perMonth = applyRounding(row.annualDepreciation / 12, input.rounding);

  const result: { month: string; depreciation: number }[] = [];
  for (let i = months - 1; i >= 0; i--) {
    let m = endMonth - i;
    let y = endYear;
    while (m <= 0) {
      m += 12;
      y -= 1;
    }
    result.push({ month: `${y}-${String(m).padStart(2, "0")}`, depreciation: perMonth });
  }
  return result;
}

/**
 * 月割計算の詳細情報を返す
 */
export function calcMonthlySummary(
  row: DepreciationRow,
  _input: DepreciationInput
): {
  annualDepreciation: number;
  proratedMonths: number;
  currentDepreciation: number;
  formula: string;
} {
  const months = row.proratedMonths;
  const formula =
    months >= 12
      ? `${row.annualDepreciation.toLocaleString()} × 12 / 12 = ${row.currentDepreciation.toLocaleString()}`
      : `${row.annualDepreciation.toLocaleString()} × ${months} / 12 = ${row.currentDepreciation.toLocaleString()}`;

  return {
    annualDepreciation: row.annualDepreciation,
    proratedMonths: months,
    currentDepreciation: row.currentDepreciation,
    formula,
  };
}
