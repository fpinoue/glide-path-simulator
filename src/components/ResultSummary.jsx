function fmt(val) {
  return Math.round(val).toLocaleString();
}

function fmtMonthly(annual) {
  const m = annual / 12;
  return m < 1 ? `${Math.round(m * 10) / 10}` : fmt(m);
}

function PlanCard({ label, plan, inputs, isActive, onClick, clickable = true }) {
  const noSell = plan.annualSell < 0.05;
  const monthly = inputs.annualContribution / 12;
  const target = inputs.targetEquityRatio / 100;
  const finalRow = plan.timeline[plan.timeline.length - 1];
  const equityMonthly = Math.round(monthly * target * 10) / 10;
  const newFundMonthly = Math.round(monthly * (1 - target) * 10) / 10;

  const Tag = clickable ? 'button' : 'div';

  return (
    <Tag
      onClick={clickable ? onClick : undefined}
      className={`w-full text-left rounded-xl border-2 p-5 transition-all ${
        isActive
          ? 'border-primary-500 bg-primary-50'
          : clickable
          ? 'border-slate-200 bg-white hover:border-slate-300'
          : 'border-primary-500 bg-primary-50'
      }`}
    >
      <div className="flex items-center justify-between mb-3">
        <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${isActive || !clickable ? 'bg-primary-500 text-white' : 'bg-slate-100 text-slate-500'}`}>
          {label}
        </span>
        {(isActive || !clickable) && <span className="text-xs text-primary-600 font-medium">選択中</span>}
      </div>

      {/* 積立アクション */}
      <div className="mb-3">
        <p className="text-xs font-semibold text-slate-400 mb-1">毎月の積立</p>
        {plan.equityContribRatio === 0 ? (
          <p className="text-sm text-slate-700">
            <span className="font-semibold text-emerald-700">全額 → 新ファンド</span>
            <span className="text-slate-500 ml-1">（{fmtMonthly(inputs.annualContribution)}万円/月）</span>
          </p>
        ) : (
          <div className="space-y-0.5 text-sm">
            <p className="text-slate-700">
              株式ファンド：<span className="font-semibold text-blue-600">{equityMonthly}万円/月</span>
            </p>
            <p className="text-slate-700">
              新ファンド：<span className="font-semibold text-emerald-600">{newFundMonthly}万円/月</span>
            </p>
          </div>
        )}
      </div>

      {/* 売却アクション */}
      <div className="mb-4">
        <p className="text-xs font-semibold text-slate-400 mb-1">
          {plan.equityContribRatio === 0 ? '毎年の売却' : '毎年のリバランス売却'}
        </p>
        {noSell ? (
          <p className="text-sm text-emerald-700 font-semibold">売却不要</p>
        ) : (
          <p className="text-sm text-slate-700">
            株式ファンドから
            <span className="font-bold text-orange-600 mx-1">{fmt(plan.annualSell)}万円</span>
            売却
            <span className="text-slate-400 text-xs ml-1">（月{fmtMonthly(plan.annualSell)}万円）</span>
          </p>
        )}
      </div>

      {/* サマリー数値 */}
      <div className="grid grid-cols-2 gap-2 pt-3 border-t border-slate-100">
        <div>
          <p className="text-xs text-slate-400">退職時の合計残高</p>
          <p className="text-base font-bold text-slate-800">{fmt(finalRow.total)}<span className="text-xs font-normal ml-0.5">万円</span></p>
        </div>
        <div>
          <p className="text-xs text-slate-400">退職時の株式比率</p>
          <p className="text-base font-bold text-slate-800">{finalRow.effectiveEquityRatio.toFixed(1)}<span className="text-xs font-normal ml-0.5">%</span></p>
        </div>
      </div>
    </Tag>
  );
}

export default function ResultSummary({ result, inputs, activePlan, setActivePlan }) {
  if (result.error === 'invalid_age') {
    return (
      <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-red-700">
        <p className="font-semibold">入力エラー</p>
        <p className="text-sm mt-1">退職予定年齢はグライドパス開始年齢より大きく設定してください。</p>
      </div>
    );
  }
  if (result.error === 'no_equity') {
    return (
      <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-red-700">
        <p className="font-semibold">入力エラー</p>
        <p className="text-sm mt-1">開始時の株式残高を1万円以上で入力してください。</p>
      </div>
    );
  }
  if (result.error === 'infeasible') {
    return (
      <div className="bg-amber-50 border border-amber-200 rounded-xl p-6 text-amber-800">
        <p className="font-semibold text-lg">この条件では目標比率に到達できません</p>
        <p className="text-sm mt-2">
          新ファンドの株式組入比率（{inputs.newFundEquityRatio}%）が目標株式比率（{inputs.targetEquityRatio}%）以上のため、
          株式ファンドをすべて売却しても目標を下回ることができません。
        </p>
        <p className="text-sm mt-1">目標株式比率を上げるか、新ファンドの株式比率を下げてください。</p>
      </div>
    );
  }

  const { planA, planB } = result;
  const years = inputs.retirementAge - inputs.currentAge;
  const isFullMigration = result.migrationMode === 'full-migration';

  return (
    <section className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
      <div className="flex items-center gap-3 mb-2">
        <div className="h-7 w-1 bg-primary-500 rounded-full" />
        <h2 className="text-xl font-bold text-slate-800">アクションプラン</h2>
      </div>
      <p className="text-sm text-slate-500 mb-5 pl-4">
        {isFullMigration
          ? `運用期間 ${years}年 ／ 退職時に株式ファンドをゼロへ移行`
          : `運用期間 ${years}年 ／ 目標株式比率 ${inputs.targetEquityRatio}%。いずれかのプランをクリックしてグラフを切り替えられます。`
        }
      </p>

      {isFullMigration ? (
        /* 完全移行：プランAのみ表示 */
        <div className="max-w-md">
          <p className="text-sm font-semibold text-slate-600 mb-2 px-1">
            積立は全額新ファンドへ、株式ファンドを退職時にゼロへ
          </p>
          <PlanCard
            label="プランA"
            plan={planA}
            inputs={inputs}
            isActive={true}
            clickable={false}
          />
        </div>
      ) : (
        /* 両方保持：プランA・B選択可能 */
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <p className="text-sm font-semibold text-slate-600 mb-2 px-1">
              プランA：積立を全部新ファンドへ
            </p>
            <PlanCard
              label="プランA"
              plan={planA}
              inputs={inputs}
              isActive={activePlan === 'A'}
              onClick={() => setActivePlan('A')}
            />
          </div>
          <div>
            <p className="text-sm font-semibold text-slate-600 mb-2 px-1">
              プランB：目標比率で分散積立＋リバランス
            </p>
            <PlanCard
              label="プランB"
              plan={planB}
              inputs={inputs}
              isActive={activePlan === 'B'}
              onClick={() => setActivePlan('B')}
            />
          </div>
        </div>
      )}

      {isFullMigration && (
        <p className="mt-4 text-xs text-blue-600 bg-blue-50 border border-blue-100 rounded-lg px-3 py-2">
          退職後の実質株式比率は新ファンドの組入比率（{inputs.newFundEquityRatio}%）になります。
        </p>
      )}
      {!isFullMigration && planA.annualSell > 0.05 && planB.annualSell > 0.05 && (
        <p className="mt-4 text-xs text-slate-400 pl-1">
          ※ プランBはリバランスのため株式も買い続けるため、プランAより年間売却額が多くなります（差：約{fmt(planB.annualSell - planA.annualSell)}万円/年）。
        </p>
      )}
    </section>
  );
}
