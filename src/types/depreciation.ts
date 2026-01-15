export type DepreciationMethod = "straight" | "declining200";
export type RoundingMethod = "floor" | "round" | "ceil";

export type DepreciationInput = {
  acquisitionCost: number;
  acquisitionDate: string; // YYYY-MM-DD
  serviceStartDate: string; // YYYY-MM-DD
  method: DepreciationMethod;
  usefulLife: number;
  fiscalYearStartMonth: number; // 1-12
  fiscalYearEndDate: string; // YYYY-MM-DD
  keepOneYen: boolean;
  rounding: RoundingMethod;
};

export type MethodApplied = "declining" | "revised" | "final";

export type DepreciationRow = {
  yearIndex: number;
  periodLabel: string;
  bookValueStart: number;
  methodApplied: MethodApplied;
  rate: number;
  annualDepreciation: number;
  proratedMonths: number;
  currentDepreciation: number;
  bookValueEnd: number;
  switchedThisYear: boolean;
  note?: string;
};

export type DepreciationParam = {
  usefulLife: number;
  depreciationRate: number;
  revisedRate: number;
  guaranteeRate: number;
};

export type DepreciationResult = {
  rows: DepreciationRow[];
  guaranteeAmount: number;
  currentYearRow: DepreciationRow | null;
};
