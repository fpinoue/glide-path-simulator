export default function Header() {
  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-10">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 h-16 flex items-center gap-3">
        <div className="h-8 w-1 bg-primary-500 rounded-full" />
        <div>
          <h1 className="text-xl font-bold text-slate-800">グライドパス・シミュレーター</h1>
          <p className="text-xs text-slate-500">退職に向けた株式比率の段階的引き下げを計算する</p>
        </div>
      </div>
    </header>
  );
}
