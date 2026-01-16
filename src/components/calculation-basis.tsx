import type { DepreciationInput, DepreciationResult } from "@/types/depreciation";
import { getDecl200Param } from "@/master/depreciationParams";
import { formatCurrency, formatRate } from "@/lib/format";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BookOpen, ExternalLink } from "lucide-react";

const OFFICIAL_LINKS = [
  {
    label: "No.5410 減価償却（定額法と定率法）",
    org: "国税庁",
    href: "https://www.nta.go.jp/taxes/shiraberu/taxanswer/hojin/5410.htm",
  },
  {
    label: "No.5404 中古資産の耐用年数",
    org: "国税庁",
    href: "https://www.nta.go.jp/taxes/shiraberu/taxanswer/hojin/5404.htm",
  },
  {
    label: "減価償却資産の耐用年数等に関する省令（別表第十）",
    org: "e-Gov 法令検索",
    href: "https://laws.e-gov.go.jp/law/340M50000040015",
  },
  {
    label: "法人税法施行令 第48条（償却の方法）",
    org: "e-Gov 法令検索",
    href: "https://laws.e-gov.go.jp/law/340CO0000000097#Mp-At_48",
  },
];

type CalculationBasisProps = {
  result: DepreciationResult;
  input: DepreciationInput;
};

export function CalculationBasis({ result, input }: CalculationBasisProps) {
  const param = getDecl200Param(input.usefulLife);
  if (!param) return null;

  const switchRow = result.rows.find((r) => r.switchedThisYear && r.methodApplied === "revised");

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base flex items-center gap-2">
          <BookOpen className="h-4 w-4" />
          計算根拠
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-5 text-sm text-gray-700">
        <Section title="200%定率法の概要">
          <p>
            200%定率法では、毎期の期首帳簿価額に<strong>償却率（= 2 ÷ 耐用年数）</strong>
            を乗じて償却費を計算します。帳簿価額が逓減するにつれて償却費も減少します。
          </p>
        </Section>

        <Section title="保証額と切替">
          <p>
            通常の定率法償却額が <strong>保証額（= 取得価額 × 保証率）</strong>を下回った年度から、
            <strong>改定償却率</strong>に切り替えます。
          </p>
          <ul className="mt-2 space-y-1 list-disc list-inside text-gray-600">
            <li>
              保証額 = {formatCurrency(input.acquisitionCost)} × {formatRate(param.guaranteeRate, 5)} ={" "}
              <strong>{formatCurrency(result.guaranteeAmount)} 円</strong>
            </li>
            {switchRow ? (
              <li>
                第{switchRow.yearIndex + 1}期（{switchRow.periodLabel}）で改定償却率（
                {formatRate(param.revisedRate)}）に切替
              </li>
            ) : (
              <li>今回の耐用年数では切替なし（または未到達）</li>
            )}
          </ul>
        </Section>

        <Section title="月割計算">
          <p>
            供用開始月を1か月として算入し、期末月まで月数を数えます。
            年間償却費 × 月割月数 ÷ 12 で当期償却額を算出します。
          </p>
          <p className="mt-1 text-gray-500">
            ※ 2期目以降は12か月で計算します（期中取得の初年度のみ月割）
          </p>
        </Section>

        <Section title="1円残し調整">
          <p>
            最終年度は帳簿価額が1円になるよう調整します。
            最終年度の償却額 = 期首帳簿価額 - 1円
          </p>
        </Section>

        <Section title="端数処理">
          <p>
            各年の償却費計算では
            <strong>
              {input.rounding === "floor"
                ? "切り捨て"
                : input.rounding === "round"
                ? "四捨五入"
                : "切り上げ"}
            </strong>
            を適用しています。
          </p>
        </Section>

        {/* 公式リンク */}
        <div className="border-t border-gray-100 pt-4">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">
            公式資料・根拠法令
          </p>
          <ul className="space-y-2">
            {OFFICIAL_LINKS.map((link) => (
              <li key={link.href}>
                <a
                  href={link.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-start gap-2 text-sm text-brand-600 hover:text-brand-700 hover:underline group"
                >
                  <ExternalLink className="h-3.5 w-3.5 mt-0.5 shrink-0 opacity-60 group-hover:opacity-100" />
                  <span>
                    {link.label}
                    <span className="ml-1.5 text-xs text-gray-400">{link.org}</span>
                  </span>
                </a>
              </li>
            ))}
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h3 className="font-semibold text-gray-800 mb-1.5">{title}</h3>
      <div className="text-sm text-gray-600 leading-relaxed">{children}</div>
    </div>
  );
}
