import { useState } from "react";
import type { DepreciationInput } from "@/types/depreciation";
import { DECLINING200_PARAMS } from "@/master/depreciationParams";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { isValidDate } from "@/lib/date-utils";
import { Calculator, Info } from "lucide-react";
import { Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip";

const FISCAL_START_MONTH = 4;

const USEFUL_LIFE_HINTS = [
  { label: "PC・サーバー", years: 4 },
  { label: "ソフトウェア（業務用）", years: 5 },
  { label: "乗用車", years: 6 },
  { label: "軽自動車", years: 4 },
  { label: "複合機・コピー機", years: 5 },
  { label: "エアコン（器具・備品）", years: 6 },
  { label: "机・椅子（金属製）", years: 15 },
  { label: "机・椅子（木製）", years: 8 },
  { label: "工具・金型", years: 3 },
] as const;

/**
 * 指定した基準日を含む事業年度の期末日を返す
 * 例: baseDate=2026-08-15, fiscalStartMonth=4 → 2027-03-31
 * 例: baseDate=2026-03-01, fiscalStartMonth=4 → 2026-03-31
 */
function calcFiscalYearEnd(baseDate: string, fiscalStartMonth: number): string {
  const d = new Date(baseDate);
  const year = d.getFullYear();
  const month = d.getMonth() + 1; // 1-12

  // 期末月 = 開始月の前月（開始月=1なら12月）
  const endMonth = fiscalStartMonth === 1 ? 12 : fiscalStartMonth - 1;

  // 基準日の月 >= 開始月 なら当年度（期末は翌年 or 同年）、未満なら前年度
  let endYear: number;
  if (month >= fiscalStartMonth) {
    endYear = fiscalStartMonth === 1 ? year : year + 1;
  } else {
    endYear = year;
  }

  const lastDay = new Date(endYear, endMonth, 0).getDate();
  return `${endYear}-${String(endMonth).padStart(2, "0")}-${String(lastDay).padStart(2, "0")}`;
}

type FormValues = {
  acquisitionCost: string;
  acquisitionDate: string;
  serviceStartDate: string;
  method: string;
  usefulLife: string;
  fiscalYearEndDate: string;
  keepOneYen: boolean;
  rounding: string;
};

type InputFormProps = {
  onCalculate: (input: DepreciationInput) => void;
};

type ValidationErrors = Partial<Record<keyof FormValues, string>>;

function validate(values: FormValues): ValidationErrors {
  const errors: ValidationErrors = {};

  const cost = Number(values.acquisitionCost);
  if (!values.acquisitionCost || isNaN(cost) || cost < 1 || !Number.isInteger(cost)) {
    errors.acquisitionCost = "1以上の整数を入力してください";
  }
  if (!isValidDate(values.acquisitionDate)) {
    errors.acquisitionDate = "正しい日付を入力してください";
  }
  if (!isValidDate(values.serviceStartDate)) {
    errors.serviceStartDate = "正しい日付を入力してください";
  }
  if (
    isValidDate(values.acquisitionDate) &&
    isValidDate(values.serviceStartDate) &&
    values.serviceStartDate < values.acquisitionDate
  ) {
    errors.serviceStartDate = "供用日は取得日以降にしてください";
  }
  if (!values.usefulLife) {
    errors.usefulLife = "耐用年数を選択してください";
  }
  return errors;
}

export function InputForm({ onCalculate }: InputFormProps) {
  const today = new Date().toISOString().slice(0, 10);
  const [values, setValues] = useState<FormValues>({
    acquisitionCost: "",
    acquisitionDate: "",
    serviceStartDate: "",
    method: "declining200",
    usefulLife: "",
    fiscalYearEndDate: calcFiscalYearEnd(today, FISCAL_START_MONTH),
    keepOneYen: true,
    rounding: "floor",
  });
  const [errors, setErrors] = useState<ValidationErrors>({});

  const set = (key: keyof FormValues, value: string | boolean) => {
    setValues((prev) => {
      const next = { ...prev, [key]: value };
      // 供用日が有効な日付に変わったら、その日付を含む期末に自動更新
      if (key === "serviceStartDate" && typeof value === "string" && value.length === 10) {
        next.fiscalYearEndDate = calcFiscalYearEnd(value, FISCAL_START_MONTH);
      }
      return next;
    });
    if (errors[key]) {
      setErrors((prev) => ({ ...prev, [key]: undefined }));
    }
  };

  const handleSubmit = () => {
    const errs = validate(values);
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }
    onCalculate({
      acquisitionCost: Number(values.acquisitionCost),
      acquisitionDate: values.acquisitionDate,
      serviceStartDate: values.serviceStartDate,
      method: values.method as DepreciationInput["method"],
      usefulLife: Number(values.usefulLife),
      fiscalYearStartMonth: FISCAL_START_MONTH,
      fiscalYearEndDate: values.fiscalYearEndDate,
      keepOneYen: values.keepOneYen,
      rounding: values.rounding as DepreciationInput["rounding"],
    });
  };

  const ErrorMsg = ({ field }: { field: keyof FormValues }) =>
    errors[field] ? (
      <p className="mt-1 text-xs text-red-600">{errors[field]}</p>
    ) : null;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base flex items-center gap-2">
          <Calculator className="h-4 w-4" />
          入力条件
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* 取得価額 */}
        <div>
          <Label htmlFor="acquisitionCost">取得価額（円）</Label>
          <Input
            id="acquisitionCost"
            type="number"
            min={1}
            step={1}
            placeholder="例: 1000000"
            value={values.acquisitionCost}
            onChange={(e) => set("acquisitionCost", e.target.value)}
            className={errors.acquisitionCost ? "border-red-400" : ""}
          />
          {values.acquisitionCost && !errors.acquisitionCost && Number(values.acquisitionCost) >= 1 && (
            <p className="mt-1 text-sm font-medium text-brand-600 tabular-nums">
              {Number(values.acquisitionCost).toLocaleString("ja-JP")} 円
            </p>
          )}
          <ErrorMsg field="acquisitionCost" />
        </div>

        {/* 取得日 */}
        <div>
          <Label htmlFor="acquisitionDate">取得日</Label>
          <Input
            id="acquisitionDate"
            type="date"
            value={values.acquisitionDate}
            onChange={(e) => set("acquisitionDate", e.target.value)}
            className={errors.acquisitionDate ? "border-red-400" : ""}
          />
          <ErrorMsg field="acquisitionDate" />
        </div>

        {/* 供用日 */}
        <div>
          <Label htmlFor="serviceStartDate">供用日（事業の用に供した日）</Label>
          <Input
            id="serviceStartDate"
            type="date"
            value={values.serviceStartDate}
            onChange={(e) => set("serviceStartDate", e.target.value)}
            className={errors.serviceStartDate ? "border-red-400" : ""}
          />
          <ErrorMsg field="serviceStartDate" />
        </div>

        {/* 償却方法 */}
        <div>
          <Label>償却方法</Label>
          <Select value={values.method} onValueChange={(v) => set("method", v)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="declining200">200%定率法</SelectItem>
              <SelectItem value="straight" disabled>
                定額法（準備中）
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* 耐用年数 */}
        <div>
          <div className="flex items-center gap-1.5">
            <Label>耐用年数</Label>
            <Tooltip>
              <TooltipTrigger asChild>
                <button type="button" className="text-gray-400 hover:text-brand-500 transition-colors">
                  <Info className="h-3.5 w-3.5" />
                </button>
              </TooltipTrigger>
              <TooltipContent>
                <p className="font-semibold text-gray-700 mb-2">主な資産の法定耐用年数</p>
                <table className="w-full text-xs">
                  <tbody>
                    {USEFUL_LIFE_HINTS.map((h) => (
                      <tr key={h.label}>
                        <td className="py-0.5 pr-4 text-gray-600">{h.label}</td>
                        <td className="py-0.5 text-right font-semibold text-gray-800">{h.years}年</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                <div className="mt-2.5 pt-2 border-t border-gray-100 space-y-1">
                  <a
                    href="https://www.nta.go.jp/taxes/shiraberu/taxanswer/shotoku/2100.htm"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 text-brand-600 hover:underline"
                  >
                    <span>No.2100 減価償却のあらまし（国税庁）</span>
                  </a>
                  <a
                    href="https://www.nta.go.jp/taxes/shiraberu/taxanswer/hojin/5404.htm"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 text-brand-600 hover:underline"
                  >
                    <span>No.5404 中古資産の耐用年数（国税庁）</span>
                  </a>
                  <a
                    href="https://laws.e-gov.go.jp/law/340M50000040015"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 text-brand-600 hover:underline"
                  >
                    <span>耐用年数省令 別表（e-Gov）</span>
                  </a>
                </div>
              </TooltipContent>
            </Tooltip>
          </div>
          <Select
            value={values.usefulLife}
            onValueChange={(v) => set("usefulLife", v)}
          >
            <SelectTrigger className={errors.usefulLife ? "border-red-400" : ""}>
              <SelectValue placeholder="耐用年数を選択" />
            </SelectTrigger>
            <SelectContent>
              {DECLINING200_PARAMS.map((p) => (
                <SelectItem key={p.usefulLife} value={String(p.usefulLife)}>
                  {p.usefulLife}年
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <ErrorMsg field="usefulLife" />
        </div>

        {/* 当期末日（自動計算・表示のみ） */}
        <div>
          <Label>当期末日</Label>
          <div className="mt-1 flex h-9 items-center rounded-md border border-gray-200 bg-gray-50 px-3 text-sm text-gray-700 tabular-nums">
            {values.fiscalYearEndDate}
          </div>
          <p className="mt-1 text-xs text-gray-400">供用日から自動計算（4月始まり）</p>
        </div>

        {/* 端数処理 */}
        <div>
          <Label>端数処理</Label>
          <Select
            value={values.rounding}
            onValueChange={(v) => set("rounding", v)}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="floor">切り捨て</SelectItem>
              <SelectItem value="round">四捨五入</SelectItem>
              <SelectItem value="ceil">切り上げ</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* 1円残し */}
        <div className="flex items-center gap-3">
          <input
            id="keepOneYen"
            type="checkbox"
            className="h-4 w-4 rounded border-gray-300 accent-brand-500"
            checked={values.keepOneYen}
            onChange={(e) => set("keepOneYen", e.target.checked)}
          />
          <Label htmlFor="keepOneYen">1円残しを行う</Label>
        </div>

        <Button className="w-full" onClick={handleSubmit}>
          計算する
        </Button>
      </CardContent>
    </Card>
  );
}
