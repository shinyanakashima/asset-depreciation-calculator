import type { DepreciationInput } from "@/types/depreciation";
import { getDecl200Param } from "@/master/depreciationParams";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency, formatRate } from "@/lib/format";
import { Info } from "lucide-react";

type ParameterCardProps = {
  input: DepreciationInput;
};

export function ParameterCard({ input }: ParameterCardProps) {
  const param = getDecl200Param(input.usefulLife);
  if (!param) return null;

  const guaranteeAmount = Math.floor(input.acquisitionCost * param.guaranteeRate);

  const rows = [
    { label: "償却方法", value: "200%定率法" },
    { label: "耐用年数", value: `${param.usefulLife}年` },
    { label: "償却率", value: formatRate(param.depreciationRate) },
    { label: "改定償却率", value: formatRate(param.revisedRate) },
    { label: "保証率", value: formatRate(param.guaranteeRate, 5) },
    {
      label: "保証額",
      value: `${formatCurrency(guaranteeAmount)} 円`,
      sub: `${formatCurrency(input.acquisitionCost)} × ${formatRate(param.guaranteeRate, 5)}`,
    },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base flex items-center gap-2">
          <Info className="h-4 w-4" />
          償却パラメータ
        </CardTitle>
      </CardHeader>
      <CardContent>
        <dl className="space-y-2">
          {rows.map((row) => (
            <div key={row.label} className="flex justify-between items-start py-1.5 border-b border-gray-100 last:border-0">
              <dt className="text-sm text-gray-500 shrink-0">{row.label}</dt>
              <dd className="text-sm font-medium text-right">
                <span>{row.value}</span>
                {row.sub && (
                  <span className="block text-xs text-gray-400 font-normal">{row.sub}</span>
                )}
              </dd>
            </div>
          ))}
        </dl>
        <p className="mt-4 text-xs text-gray-400 leading-relaxed">
          ※ 保証額を下回った期から改定償却率に切り替えます
        </p>
      </CardContent>
    </Card>
  );
}
