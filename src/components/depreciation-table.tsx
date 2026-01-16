import type { DepreciationResult, DepreciationRow } from "@/types/depreciation";
import { Badge } from "@/components/ui/badge";
import { formatCurrency, formatRate } from "@/lib/format";

type DepreciationTableProps = {
  result: DepreciationResult;
  currentYearIndex: number | null;
  showAll?: boolean;
};

function MethodBadge({ row }: { row: DepreciationRow }) {
  if (row.methodApplied === "final") {
    return <Badge variant="destructive">最終調整</Badge>;
  }
  if (row.methodApplied === "revised") {
    return <Badge variant="warning">改定償却率</Badge>;
  }
  return <Badge variant="secondary">定率</Badge>;
}

export function DepreciationTable({
  result,
  currentYearIndex,
  showAll = true,
}: DepreciationTableProps) {
  const rows = showAll
    ? result.rows
    : result.rows.filter((r) => r.yearIndex === currentYearIndex);

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm border-collapse min-w-[900px]">
        <thead>
          <tr className="bg-gray-50 text-gray-600 text-xs">
            <th className="px-3 py-2 text-left font-medium whitespace-nowrap border-b border-gray-200">
              年度
            </th>
            <th className="px-3 py-2 text-right font-medium whitespace-nowrap border-b border-gray-200">
              期首帳簿価額
            </th>
            <th className="px-3 py-2 text-center font-medium whitespace-nowrap border-b border-gray-200">
              計算方式
            </th>
            <th className="px-3 py-2 text-right font-medium whitespace-nowrap border-b border-gray-200">
              償却率
            </th>
            <th className="px-3 py-2 text-right font-medium whitespace-nowrap border-b border-gray-200">
              年間償却費
            </th>
            <th className="px-3 py-2 text-right font-medium whitespace-nowrap border-b border-gray-200">
              月割月数
            </th>
            <th className="px-3 py-2 text-right font-medium whitespace-nowrap border-b border-gray-200">
              当期償却額
            </th>
            <th className="px-3 py-2 text-right font-medium whitespace-nowrap border-b border-gray-200">
              期末帳簿価額
            </th>
            <th className="px-3 py-2 text-left font-medium whitespace-nowrap border-b border-gray-200">
              備考
            </th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => {
            const isCurrent = row.yearIndex === currentYearIndex;
            const isSwitched =
              row.methodApplied === "revised" || row.methodApplied === "final";
            return (
              <tr
                key={row.yearIndex}
                className={[
                  "border-b border-gray-100 transition-colors",
                  isCurrent
                    ? "bg-brand-50 font-medium"
                    : isSwitched
                    ? "bg-yellow-50"
                    : "hover:bg-gray-50",
                ].join(" ")}
              >
                <td className="px-3 py-2 whitespace-nowrap">
                  <span className="flex items-center gap-1">
                    {isCurrent && (
                      <span className="inline-block w-1.5 h-1.5 rounded-full bg-brand-500" />
                    )}
                    {row.periodLabel}
                  </span>
                </td>
                <td className="px-3 py-2 text-right tabular-nums">
                  {formatCurrency(row.bookValueStart)}
                </td>
                <td className="px-3 py-2 text-center">
                  <MethodBadge row={row} />
                </td>
                <td className="px-3 py-2 text-right tabular-nums">
                  {formatRate(row.rate)}
                </td>
                <td className="px-3 py-2 text-right tabular-nums">
                  {formatCurrency(row.annualDepreciation)}
                </td>
                <td className="px-3 py-2 text-right tabular-nums">
                  {row.proratedMonths}か月
                </td>
                <td className="px-3 py-2 text-right tabular-nums font-medium">
                  {formatCurrency(row.currentDepreciation)}
                </td>
                <td className="px-3 py-2 text-right tabular-nums">
                  {formatCurrency(row.bookValueEnd)}
                </td>
                <td className="px-3 py-2 text-xs text-gray-500 whitespace-nowrap">
                  {row.note}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
