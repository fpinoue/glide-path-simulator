import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

function fmtYAxis(v) {
  if (v === 0) return '0';
  // 目盛りが 0.25億刻みになることがあるため小数第2位まで出し、末尾の0は落とす（0.25億・0.5億・1億）
  return `${parseFloat((v / 10000).toFixed(2))}億`;
}

function CustomTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  const equity = payload.find((p) => p.dataKey === 'equity');
  const newFund = payload.find((p) => p.dataKey === 'newFund');
  const total = (equity?.value ?? 0) + (newFund?.value ?? 0);
  return (
    <div className="bg-white border border-slate-200 rounded-lg shadow-sm px-3 py-2 text-sm min-w-[160px]">
      <p className="font-semibold text-slate-700 mb-1">{label}歳</p>
      {equity && (
        <p style={{ color: '#3b82f6' }}>株式ファンド：{Math.round(equity.value).toLocaleString()}万円</p>
      )}
      {newFund && (
        <p style={{ color: '#10b981' }}>新ファンド：{Math.round(newFund.value).toLocaleString()}万円</p>
      )}
      <p className="text-slate-500 mt-1 border-t border-slate-100 pt-1">
        合計：{Math.round(total).toLocaleString()}万円
      </p>
    </div>
  );
}

export default function PortfolioChart({ timeline, planLabel, newFundLabel }) {
  const data = timeline.map((row) => ({
    age: row.age,
    equity: Math.round(row.equity),
    newFund: Math.round(row.newFund),
  }));

  const fundName = newFundLabel || '新ファンド';

  return (
    <section className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
      <div className="flex items-center gap-3 mb-1">
        <div className="h-7 w-1 bg-primary-500 rounded-full" />
        <h2 className="text-xl font-bold text-slate-800">ポートフォリオ推移</h2>
        <span className="text-sm text-slate-400">（{planLabel}）</span>
      </div>
      <p className="text-xs text-slate-400 mb-5 pl-4">単位：万円</p>

      <ResponsiveContainer width="100%" height={340}>
        <BarChart data={data} margin={{ top: 10, right: 20, left: 10, bottom: 20 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
          <XAxis
            dataKey="age"
            tickFormatter={(v) => `${v}歳`}
            tick={{ fontSize: 11, fill: '#64748b' }}
            label={{ value: '年齢', position: 'insideBottom', offset: -10, fill: '#94a3b8', fontSize: 12 }}
          />
          <YAxis
            tickFormatter={fmtYAxis}
            tick={{ fontSize: 11, fill: '#64748b' }}
            width={52}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend
            verticalAlign="top"
            formatter={(value) => (value === 'equity' ? '株式ファンド' : fundName)}
            wrapperStyle={{ fontSize: 13, paddingBottom: 8 }}
          />
          <Bar dataKey="equity" name="equity" stackId="a" fill="#3b82f6" radius={[0, 0, 0, 0]} />
          <Bar dataKey="newFund" name="newFund" stackId="a" fill="#10b981" radius={[3, 3, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </section>
  );
}
