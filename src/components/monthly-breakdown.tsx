import { useState } from "react";
import type { DepreciationInput, DepreciationResult } from "@/types/depreciation";
import { calcMonthlyBreakdown } from "@/lib/depreciation";
import { formatCurrency } from "@/lib/format";
import { Copy, Check } from "lucide-react";

type MonthlyBreakdownProps = {
  result: DepreciationResult;
  input: DepreciationInput;
};

export function MonthlyBreakdown({ result, input }: MonthlyBreakdownProps) {
  const { currentYearRow } = result;
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  if (!currentYearRow) return null;

  const rows = calcMonthlyBreakdown(currentYearRow, input);

  const handleCopy = (index: number, value: number) => {
    navigator.clipboard.writeText(String(value)).then(() => {
      setCopiedIndex(index);
      setTimeout(() => setCopiedIndex(null), 2000);
    });
  };

  return (
    <div className="rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden">
      <div className="px-4 py-3 border-b border-gray-100">
        <p className="text-xs font-semibold text-gray-500">月別償却費内訳</p>
        <p className="text-xs text-gray-400 mt-0.5">
          各月の費用 = 年額 {formatCurrency(currentYearRow.annualDepreciation)} ÷ 12
        </p>
      </div>
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-gray-100 bg-gray-50 text-xs text-gray-500">
            <th className="px-4 py-2 text-left font-medium">月</th>
            <th className="px-4 py-2 text-right font-medium">償却費（円）</th>
            <th className="px-4 py-2 w-10" />
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={row.month} className="border-b border-gray-50 hover:bg-gray-50">
              <td className="px-4 py-2.5 tabular-nums text-gray-700">
                {row.month.replace("-", "年").replace(/^(\d+年)(\d+)$/, "$1$2月")}
              </td>
              <td className="px-4 py-2.5 text-right tabular-nums font-medium text-gray-800">
                {formatCurrency(row.depreciation)}
              </td>
              <td className="px-4 py-2.5 text-center">
                <button
                  onClick={() => handleCopy(i, row.depreciation)}
                  title="コピー"
                  className="text-gray-300 hover:text-brand-600 transition-colors"
                >
                  {copiedIndex === i ? (
                    <Check className="h-3.5 w-3.5 text-green-500" />
                  ) : (
                    <Copy className="h-3.5 w-3.5" />
                  )}
                </button>
              </td>
            </tr>
          ))}
        </tbody>
        <tfoot>
          <tr className="bg-brand-50 border-t border-brand-100">
            <td className="px-4 py-2.5 text-xs font-semibold text-brand-700">合計</td>
            <td className="px-4 py-2.5 text-right tabular-nums font-semibold text-brand-700">
              {formatCurrency(currentYearRow.currentDepreciation)}
            </td>
            <td />
          </tr>
        </tfoot>
      </table>
    </div>
  );
}
