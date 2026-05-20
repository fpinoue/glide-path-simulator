import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceLine,
  ResponsiveContainer,
  Legend,
} from 'recharts';

function CustomTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white border border-slate-200 rounded-lg shadow-sm px-3 py-2 text-sm">
      <p className="font-semibold text-slate-700 mb-1">{label}歳</p>
      {payload.map((p) => (
        <p key={p.dataKey} style={{ color: p.color }}>
          {p.name}：{p.value?.toFixed(1)}%
        </p>
      ))}
    </div>
  );
}

export default function GlidepathChart({ timelineA, timelineB, targetEquityRatio, activePlan }) {
  const showB = timelineB != null;

  const data = timelineA.map((rowA, i) => {
    const rowB = showB ? timelineB[i] : null;
    return {
      age: rowA.age,
      ratioA: Math.round(rowA.effectiveEquityRatio * 10) / 10,
      ratioB: rowB ? Math.round(rowB.effectiveEquityRatio * 10) / 10 : null,
    };
  });

  const allRatios = data.flatMap((d) => [d.ratioA, d.ratioB].filter(Boolean));
  const yMin = Math.max(0, Math.floor((Math.min(...allRatios, targetEquityRatio) - 5) / 10) * 10);

  return (
    <section className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="h-7 w-1 bg-primary-500 rounded-full" />
        <h2 className="text-xl font-bold text-slate-800">実質株式比率の推移</h2>
      </div>

      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={data} margin={{ top: 10, right: 40, left: 0, bottom: 20 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
          <XAxis
            dataKey="age"
            label={{ value: '年齢（歳）', position: 'insideBottom', offset: -10, fill: '#94a3b8', fontSize: 12 }}
            tick={{ fontSize: 12, fill: '#64748b' }}
          />
          <YAxis
            domain={[yMin, 100]}
            tickFormatter={(v) => `${v}%`}
            tick={{ fontSize: 12, fill: '#64748b' }}
            width={48}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend
            verticalAlign="top"
            formatter={(v) => (v === 'ratioA' ? 'プランA' : 'プランB')}
            wrapperStyle={{ fontSize: 12 }}
          />
          <ReferenceLine
            y={targetEquityRatio}
            stroke="#f97316"
            strokeDasharray="6 3"
            strokeWidth={2}
            label={{ value: `目標 ${targetEquityRatio}%`, position: 'right', fill: '#f97316', fontSize: 12 }}
          />
          <Line
            type="monotone"
            dataKey="ratioA"
            name="ratioA"
            stroke={activePlan === 'A' ? '#0ea5e9' : '#94a3b8'}
            strokeWidth={activePlan === 'A' ? 2.5 : 1.5}
            strokeDasharray={activePlan === 'A' ? undefined : '4 2'}
            dot={false}
            activeDot={{ r: 4 }}
          />
          {showB && (
            <Line
              type="monotone"
              dataKey="ratioB"
              name="ratioB"
              stroke={activePlan === 'B' ? '#8b5cf6' : '#94a3b8'}
              strokeWidth={activePlan === 'B' ? 2.5 : 1.5}
              strokeDasharray={activePlan === 'B' ? undefined : '4 2'}
              dot={false}
              activeDot={{ r: 4 }}
            />
          )}
        </LineChart>
      </ResponsiveContainer>
    </section>
  );
}
