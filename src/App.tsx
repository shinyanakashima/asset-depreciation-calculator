import { useState } from "react";
import type { DepreciationInput, DepreciationResult } from "@/types/depreciation";
import { calcDeclining200 } from "@/lib/depreciation";
import { InputForm } from "@/components/input-form";
import { ParameterCard } from "@/components/parameter-card";
import { DepreciationTable } from "@/components/depreciation-table";
import { MonthlySummary } from "@/components/monthly-summary";
import { CalculationBasis } from "@/components/calculation-basis";
import { MonthlyBreakdown } from "@/components/monthly-breakdown";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TrendingDown } from "lucide-react";
import { WreeeLogoSvg } from "@/components/wreee-logo";

export default function App() {
  const [input, setInput] = useState<DepreciationInput | null>(null);
  const [result, setResult] = useState<DepreciationResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleCalculate = (newInput: DepreciationInput) => {
    try {
      const r = calcDeclining200(newInput);
      setInput(newInput);
      setResult(r);
      setError(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : "計算エラーが発生しました");
      setResult(null);
    }
  };

  const currentYearIndex = result?.currentYearRow?.yearIndex ?? null;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10 shadow-sm">
        <div className="max-w-screen-xl mx-auto px-4 h-16 flex items-center gap-4">
          <WreeeLogoSvg className="h-8 w-auto" />
          <div className="h-5 w-px bg-gray-200" />
          <span className="text-sm font-bold text-gray-800 tracking-tight">当初計画確認アプリ</span>
          <span className="text-xs px-2.5 py-1 rounded-full bg-brand-500 text-white font-semibold shadow-sm">
            IT事業部 イノベ課
          </span>
        </div>
      </header>

      <div className="max-w-screen-xl mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-[320px_1fr] gap-6 items-start">
          {/* Left column: Input */}
          <div className="space-y-4">
            <InputForm onCalculate={handleCalculate} />
          </div>

          {/* Right column: Results */}
          <div className="space-y-4">
            {error && (
              <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
                {error}
              </div>
            )}

            {result && input ? (
              <>
                <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
                  <ParameterCard input={input} />
                  <MonthlySummary result={result} input={input} />
                </div>

                <Tabs defaultValue="all">
                  <TabsList>
                    <TabsTrigger value="all">年次償却表（全期間）</TabsTrigger>
                    <TabsTrigger value="current">当期のみ</TabsTrigger>
                    <TabsTrigger value="basis">計算根拠</TabsTrigger>
                  </TabsList>

                  <TabsContent value="all">
                    <div className="rounded-xl border border-gray-200 bg-white shadow-sm">
                      <div className="px-4 py-3 border-b border-gray-100">
                        <p className="text-xs text-gray-500">
                          <span className="inline-block w-1.5 h-1.5 rounded-full bg-brand-500 mr-1" />
                          青行が当期、黄行が改定償却率切替以降
                        </p>
                      </div>
                      <DepreciationTable
                        result={result}
                        currentYearIndex={currentYearIndex}
                        showAll
                      />
                    </div>
                  </TabsContent>

                  <TabsContent value="current">
                    <div className="space-y-4">
                      <div className="rounded-xl border border-gray-200 bg-white shadow-sm">
                        <DepreciationTable
                          result={result}
                          currentYearIndex={currentYearIndex}
                          showAll={false}
                        />
                      </div>
                      <MonthlyBreakdown result={result} input={input} />
                    </div>
                  </TabsContent>

                  <TabsContent value="basis">
                    <CalculationBasis result={result} input={input} />
                  </TabsContent>
                </Tabs>
              </>
            ) : (
              !error && (
                <div className="rounded-xl border-2 border-dashed border-gray-200 bg-white p-12 text-center">
                  <TrendingDown className="h-10 w-10 text-brand-200 mx-auto mb-3" />
                  <p className="text-gray-400 text-sm">
                    左のフォームに入力して「計算する」を押してください
                  </p>
                </div>
              )
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
