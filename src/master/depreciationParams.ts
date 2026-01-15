import type { DepreciationParam } from "@/types/depreciation";

/**
 * 200%定率法 償却率表（国税庁 耐用年数省令 別表第十）
 * 平成24年4月1日以後取得分
 */
export const DECLINING200_PARAMS: DepreciationParam[] = [
  { usefulLife: 2,  depreciationRate: 1.000, revisedRate: 1.000, guaranteeRate: 0.11089 },
  { usefulLife: 3,  depreciationRate: 0.667, revisedRate: 1.000, guaranteeRate: 0.11005 },
  { usefulLife: 4,  depreciationRate: 0.500, revisedRate: 1.000, guaranteeRate: 0.12499 },
  { usefulLife: 5,  depreciationRate: 0.400, revisedRate: 0.500, guaranteeRate: 0.10800 },
  { usefulLife: 6,  depreciationRate: 0.333, revisedRate: 0.334, guaranteeRate: 0.09911 },
  { usefulLife: 7,  depreciationRate: 0.286, revisedRate: 0.334, guaranteeRate: 0.08680 },
  { usefulLife: 8,  depreciationRate: 0.250, revisedRate: 0.334, guaranteeRate: 0.07909 },
  { usefulLife: 9,  depreciationRate: 0.222, revisedRate: 0.250, guaranteeRate: 0.07126 },
  { usefulLife: 10, depreciationRate: 0.200, revisedRate: 0.250, guaranteeRate: 0.06552 },
  { usefulLife: 11, depreciationRate: 0.182, revisedRate: 0.200, guaranteeRate: 0.05992 },
  { usefulLife: 12, depreciationRate: 0.167, revisedRate: 0.200, guaranteeRate: 0.05566 },
  { usefulLife: 13, depreciationRate: 0.154, revisedRate: 0.167, guaranteeRate: 0.05180 },
  { usefulLife: 14, depreciationRate: 0.143, revisedRate: 0.167, guaranteeRate: 0.04854 },
  { usefulLife: 15, depreciationRate: 0.133, revisedRate: 0.143, guaranteeRate: 0.04565 },
  { usefulLife: 16, depreciationRate: 0.125, revisedRate: 0.143, guaranteeRate: 0.04294 },
  { usefulLife: 17, depreciationRate: 0.118, revisedRate: 0.125, guaranteeRate: 0.04038 },
  { usefulLife: 18, depreciationRate: 0.111, revisedRate: 0.125, guaranteeRate: 0.03800 },
  { usefulLife: 19, depreciationRate: 0.105, revisedRate: 0.112, guaranteeRate: 0.03601 },
  { usefulLife: 20, depreciationRate: 0.100, revisedRate: 0.112, guaranteeRate: 0.03441 },
  { usefulLife: 22, depreciationRate: 0.091, revisedRate: 0.100, guaranteeRate: 0.03112 },
  { usefulLife: 24, depreciationRate: 0.083, revisedRate: 0.084, guaranteeRate: 0.02832 },
  { usefulLife: 25, depreciationRate: 0.080, revisedRate: 0.084, guaranteeRate: 0.02716 },
  { usefulLife: 26, depreciationRate: 0.077, revisedRate: 0.084, guaranteeRate: 0.02616 },
  { usefulLife: 27, depreciationRate: 0.074, revisedRate: 0.077, guaranteeRate: 0.02523 },
  { usefulLife: 28, depreciationRate: 0.071, revisedRate: 0.077, guaranteeRate: 0.02434 },
  { usefulLife: 29, depreciationRate: 0.069, revisedRate: 0.077, guaranteeRate: 0.02348 },
  { usefulLife: 30, depreciationRate: 0.067, revisedRate: 0.072, guaranteeRate: 0.02285 },
  { usefulLife: 31, depreciationRate: 0.065, revisedRate: 0.072, guaranteeRate: 0.02209 },
  { usefulLife: 32, depreciationRate: 0.063, revisedRate: 0.067, guaranteeRate: 0.02160 },
  { usefulLife: 33, depreciationRate: 0.061, revisedRate: 0.067, guaranteeRate: 0.02097 },
  { usefulLife: 34, depreciationRate: 0.059, revisedRate: 0.063, guaranteeRate: 0.02034 },
  { usefulLife: 35, depreciationRate: 0.057, revisedRate: 0.063, guaranteeRate: 0.01974 },
  { usefulLife: 36, depreciationRate: 0.056, revisedRate: 0.059, guaranteeRate: 0.01950 },
  { usefulLife: 38, depreciationRate: 0.053, revisedRate: 0.056, guaranteeRate: 0.01843 },
  { usefulLife: 39, depreciationRate: 0.051, revisedRate: 0.053, guaranteeRate: 0.01788 },
  { usefulLife: 40, depreciationRate: 0.050, revisedRate: 0.053, guaranteeRate: 0.01741 },
  { usefulLife: 45, depreciationRate: 0.044, revisedRate: 0.046, guaranteeRate: 0.01553 },
  { usefulLife: 47, depreciationRate: 0.043, revisedRate: 0.046, guaranteeRate: 0.01496 },
  { usefulLife: 50, depreciationRate: 0.040, revisedRate: 0.042, guaranteeRate: 0.01440 },
];

export function getDecl200Param(usefulLife: number): DepreciationParam | undefined {
  return DECLINING200_PARAMS.find((p) => p.usefulLife === usefulLife);
}
