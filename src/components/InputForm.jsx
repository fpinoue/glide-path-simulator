function Field({ label, unit, hint, value, onChange, min, max, step = '1' }) {
  return (
    <div>
      <label className="block text-sm font-medium text-slate-700 mb-1">{label}</label>
      <div className="flex items-center gap-2">
        <input
          type="number"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-400 focus:border-transparent"
        />
        {unit && <span className="text-sm text-slate-500 whitespace-nowrap">{unit}</span>}
      </div>
      {hint && <p className="mt-1 text-xs text-slate-400">{hint}</p>}
    </div>
  );
}

function ModeCard({ value, current, onChange, title, description }) {
  const isSelected = value === current;
  return (
    <label
      className={`flex items-start gap-3 rounded-lg border-2 p-3 cursor-pointer transition-colors ${
        isSelected ? 'border-primary-400 bg-primary-50' : 'border-slate-200 hover:border-slate-300 bg-white'
      }`}
    >
      <input
        type="radio"
        name="migrationMode"
        value={value}
        checked={isSelected}
        onChange={() => onChange(value)}
        className="mt-0.5 accent-primary-500"
      />
      <div>
        <p className={`text-sm font-semibold ${isSelected ? 'text-primary-700' : 'text-slate-700'}`}>{title}</p>
        <p className="text-xs text-slate-400 mt-0.5">{description}</p>
      </div>
    </label>
  );
}

export default function InputForm({ inputs, setInputs, onCalculate }) {
  const setNum = (key) => (val) => setInputs((prev) => ({ ...prev, [key]: Number(val) }));
  const setStr = (key) => (val) => setInputs((prev) => ({ ...prev, [key]: val }));

  return (
    <section className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="h-7 w-1 bg-primary-500 rounded-full" />
        <h2 className="text-xl font-bold text-slate-800">シミュレーション設定</h2>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">

        {/* グライドパス開始時点 */}
        <div className="sm:col-span-2">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">グライドパス開始時点</p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Field
              label="開始時の株式残高"
              unit="万円"
              hint="グライドパスを始める時点での株式ファンドの保有額"
              value={inputs.equityBalance}
              onChange={setNum('equityBalance')}
              min="1"
            />
            <Field
              label="グライドパス開始年齢"
              unit="歳"
              hint="今より将来の年齢でも入力可"
              value={inputs.currentAge}
              onChange={setNum('currentAge')}
              min="20"
              max="80"
            />
            <Field
              label="退職予定年齢"
              unit="歳"
              value={inputs.retirementAge}
              onChange={setNum('retirementAge')}
              min="21"
              max="90"
            />
          </div>
        </div>

        {/* 利回り・積立 */}
        <div className="sm:col-span-2">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">利回り・積立</p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Field
              label="株式ファンドの年率リターン"
              unit="%"
              hint="既存の株式ファンドの想定年率"
              value={inputs.equityReturn}
              onChange={setNum('equityReturn')}
              min="0"
              max="30"
              step="0.1"
            />
            <Field
              label="毎年の積立額"
              unit="万円/年"
              hint="グライドパス期間中に毎年新ファンドへ積み立てる金額"
              value={inputs.annualContribution}
              onChange={setNum('annualContribution')}
              min="0"
            />
            <Field
              label="新ファンドの年率リターン"
              unit="%"
              hint="バランスファンドや債券ファンドの想定年率"
              value={inputs.newFundReturn}
              onChange={setNum('newFundReturn')}
              min="0"
              max="30"
              step="0.1"
            />
          </div>
        </div>

        {/* 退職時のポートフォリオ */}
        <div className="sm:col-span-2">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">退職時のポートフォリオ</p>

          {/* 新ファンドの株式比率 */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
            <Field
              label="新ファンドの株式組入比率"
              unit="%"
              hint="純債券なら0%、50:50バランスなら50%"
              value={inputs.newFundEquityRatio}
              onChange={setNum('newFundEquityRatio')}
              min="0"
              max="100"
              step="1"
            />
          </div>

          {/* Migration mode toggle */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
            <ModeCard
              value="keep-both"
              current={inputs.migrationMode}
              onChange={setStr('migrationMode')}
              title="両方のファンドを保持"
              description="目標の株式比率を達成しながら両ファンドを継続運用"
            />
            <ModeCard
              value="full-migration"
              current={inputs.migrationMode}
              onChange={setStr('migrationMode')}
              title="新ファンドに完全移行"
              description="退職時に株式ファンドをゼロにして新ファンドへ全額移す"
            />
          </div>

          {/* 目標株式比率（keep-bothのみ） */}
          {inputs.migrationMode === 'keep-both' ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field
                label="退職時の目標株式比率"
                unit="%"
                hint="ポートフォリオ全体で保ちたい株式比率"
                value={inputs.targetEquityRatio}
                onChange={setNum('targetEquityRatio')}
                min="0"
                max="100"
                step="1"
              />
            </div>
          ) : (
            <div className="bg-slate-50 rounded-lg px-4 py-3 border border-slate-200 text-sm text-slate-600 inline-flex items-center gap-2">
              <span className="text-slate-400">退職時の実質株式比率：</span>
              <span className="font-bold text-primary-600">{inputs.newFundEquityRatio}%</span>
              <span className="text-slate-400">（新ファンドの組入比率）</span>
            </div>
          )}
        </div>

      </div>

      <div className="mt-6 flex justify-end">
        <button
          onClick={onCalculate}
          className="px-8 py-3 bg-primary-600 hover:bg-primary-700 text-white font-semibold rounded-lg shadow-sm transition-colors"
        >
          計算する
        </button>
      </div>
    </section>
  );
}
