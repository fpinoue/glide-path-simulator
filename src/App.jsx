import { useState } from 'react';
import Header from './components/Header';
import InputForm from './components/InputForm';
import ResultSummary from './components/ResultSummary';
import PortfolioChart from './components/PortfolioChart';
import GlidepathChart from './components/GlidepathChart';
import YearlyTable from './components/YearlyTable';
import { calculateGlidePath } from './utils/calculate';

const DEFAULT_INPUTS = {
  equityBalance: 2000,
  currentAge: 45,
  retirementAge: 65,
  equityReturn: 7,
  annualContribution: 120,
  newFundReturn: 3,
  newFundEquityRatio: 30,
  targetEquityRatio: 40,
  migrationMode: 'keep-both',
};

export default function App() {
  const [inputs, setInputs] = useState(DEFAULT_INPUTS);
  const [result, setResult] = useState(() => calculateGlidePath(DEFAULT_INPUTS));
  const [activePlan, setActivePlan] = useState('A');

  const handleCalculate = () => {
    const r = calculateGlidePath(inputs);
    setResult(r);
    setActivePlan('A'); // 常にプランAにリセット
  };

  const isFullMigration = result?.migrationMode === 'full-migration';

  // 完全移行時は常にプランA固定
  const effectiveActivePlan = isFullMigration ? 'A' : activePlan;
  const activePlanData = result && !result.error
    ? result.planA  // 完全移行はA固定、keep-bothは選択に従う（effectiveActivePlanで選択）
    : null;

  const shownPlanData = result && !result.error
    ? (effectiveActivePlan === 'A' ? result.planA : result.planB)
    : null;

  // グラフに渡す目標比率：完全移行は新ファンドの株式比率、両方保持は目標株式比率
  const chartTargetRatio = isFullMigration
    ? inputs.newFundEquityRatio
    : inputs.targetEquityRatio;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans pb-24">
      <Header />
      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-8 space-y-6">
        <InputForm inputs={inputs} setInputs={setInputs} onCalculate={handleCalculate} />

        {result && (
          <ResultSummary
            result={result}
            inputs={inputs}
            activePlan={effectiveActivePlan}
            setActivePlan={setActivePlan}
          />
        )}

        {result && !result.error && shownPlanData && (
          <>
            <PortfolioChart
              timeline={shownPlanData.timeline}
              planLabel={isFullMigration ? '完全移行（プランA）' : (effectiveActivePlan === 'A' ? 'プランA' : 'プランB')}
            />
            <GlidepathChart
              timelineA={result.planA.timeline}
              timelineB={isFullMigration ? null : result.planB.timeline}
              targetEquityRatio={chartTargetRatio}
              activePlan={effectiveActivePlan}
            />
            <YearlyTable
              timeline={shownPlanData.timeline}
              planLabel={isFullMigration ? '完全移行（プランA）' : (effectiveActivePlan === 'A' ? 'プランA' : 'プランB')}
            />
          </>
        )}
      </main>
    </div>
  );
}
