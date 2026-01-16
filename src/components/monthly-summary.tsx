import { useState } from "react";
import type { DepreciationInput, DepreciationResult } from "@/types/depreciation";
import { calcMonthlySummary } from "@/lib/depreciation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency } from "@/lib/format";
import { CalendarDays, Copy, Check } from "lucide-react";

type MonthlySummaryProps = {
  result: DepreciationResult;
  input: DepreciationInput;
};

export function MonthlySummary({ result, input }: MonthlySummaryProps) {
  const { currentYearRow } = result;
  if (!currentYearRow) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <CalendarDays className="h-4 w-4" />
            当期月割計算
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-500">当期に該当する年度が見つかりません。</p>
        </CardContent>
      </Card>
    );
  }

  const summary = calcMonthlySummary(currentYearRow, input);
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(String(summary.currentDepreciation)).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base flex items-center gap-2">
          <CalendarDays className="h-4 w-4" />
          当期月割計算
          <span className="text-xs text-gray-500 font-normal ml-1">
            {currentYearRow.periodLabel}
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3 mb-4">
          <Stat label="年額償却費" value={`${formatCurrency(summary.annualDepreciation)} 円`} />
          <Stat label="月割月数" value={`${summary.proratedMonths} か月`} />
          <Stat
            label="当期償却額"
            value={`${formatCurrency(summary.currentDepreciation)} 円`}
            highlight
            onCopy={handleCopy}
            copied={copied}
          />
        </div>

        <div className="rounded-lg bg-gray-50 px-4 py-3">
          <p className="text-xs text-gray-500 mb-1">計算式</p>
          <p className="text-sm font-mono font-medium text-gray-800">{summary.formula}</p>
        </div>

        <div className="mt-4 space-y-1 text-xs text-gray-500">
          <p>・供用月（{input.serviceStartDate.slice(0, 7)}）を1か月として算入</p>
          <p>・当期末日: {input.fiscalYearEndDate}</p>
        </div>
      </CardContent>
    </Card>
  );
}

function Stat({
  label,
  value,
  highlight,
  onCopy,
  copied,
}: {
  label: string;
  value: string;
  highlight?: boolean;
  onCopy?: () => void;
  copied?: boolean;
}) {
  return (
    <div
      className={[
        "rounded-lg p-3",
        highlight ? "bg-brand-50 border border-brand-200" : "bg-gray-50",
      ].join(" ")}
    >
      <div className="flex items-center justify-between">
        <p className="text-xs text-gray-500">{label}</p>
        {onCopy && (
          <button
            onClick={onCopy}
            title="コピー"
            className="text-gray-400 hover:text-brand-600 transition-colors"
          >
            {copied ? (
              <Check className="h-3.5 w-3.5 text-green-500" />
            ) : (
              <Copy className="h-3.5 w-3.5" />
            )}
          </button>
        )}
      </div>
      <p
        className={[
          "text-lg font-semibold tabular-nums mt-0.5",
          highlight ? "text-brand-700" : "text-gray-800",
        ].join(" ")}
      >
        {value}
      </p>
    </div>
  );
}
