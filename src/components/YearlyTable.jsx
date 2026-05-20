function fmt(val) {
  return Math.round(val).toLocaleString();
}

export default function YearlyTable({ timeline, planLabel }) {
  const lastAge = timeline[timeline.length - 1]?.age;

  return (
    <section className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="h-7 w-1 bg-primary-500 rounded-full" />
        <h2 className="text-xl font-bold text-slate-800">年別推移テーブル</h2>
        {planLabel && <span className="text-sm text-slate-400">（{planLabel}）</span>}
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-200">
              <th className="text-left py-2 px-3 font-semibold text-slate-600">年齢</th>
              <th className="text-right py-2 px-3 font-semibold text-slate-600">純株式残高<br /><span className="font-normal text-slate-400">（万円）</span></th>
              <th className="text-right py-2 px-3 font-semibold text-slate-600">新ファンド残高<br /><span className="font-normal text-slate-400">（万円）</span></th>
              <th className="text-right py-2 px-3 font-semibold text-slate-600">合計<br /><span className="font-normal text-slate-400">（万円）</span></th>
              <th className="text-right py-2 px-3 font-semibold text-slate-600">実質株式比率</th>
            </tr>
          </thead>
          <tbody>
            {timeline.map((row) => {
              const isRetirement = row.age === lastAge;
              return (
                <tr
                  key={row.age}
                  className={`border-b border-slate-100 ${isRetirement ? 'bg-primary-50 font-semibold' : 'hover:bg-slate-50'}`}
                >
                  <td className="py-2 px-3 text-slate-700">
                    {row.age}歳
                    {isRetirement && (
                      <span className="ml-2 text-xs bg-primary-100 text-primary-700 px-1.5 py-0.5 rounded">退職</span>
                    )}
                  </td>
                  <td className="py-2 px-3 text-right text-slate-700 tabular-nums">{fmt(row.equity)}</td>
                  <td className="py-2 px-3 text-right text-slate-700 tabular-nums">{fmt(row.newFund)}</td>
                  <td className="py-2 px-3 text-right text-slate-700 tabular-nums">{fmt(row.total)}</td>
                  <td className="py-2 px-3 text-right tabular-nums">
                    <span
                      className={`${
                        row.effectiveEquityRatio > 60
                          ? 'text-blue-600'
                          : row.effectiveEquityRatio > 40
                          ? 'text-emerald-600'
                          : 'text-orange-600'
                      }`}
                    >
                      {row.effectiveEquityRatio.toFixed(1)}%
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <p className="mt-4 text-xs text-slate-400">
        ※ 固定年率リターン・固定年間売却額の確定的モデルです。実際の市場変動は考慮していません。
      </p>
    </section>
  );
}
