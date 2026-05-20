// PMT formula: annual payment that exactly depletes balance to 0 over N years at growth rate r
function pmt(balance, rate, years) {
  if (years <= 0) return 0;
  if (Math.abs(rate) < 1e-10) return balance / years;
  const factor = Math.pow(1 + rate, years);
  return balance * rate * factor / (factor - 1);
}

function simulatePlan(equityBalance, years, r_eq, r_new, nfRatio, annualContribution, equityContribRatio, annualSell) {
  let equity = equityBalance;
  let newFund = 0;
  for (let i = 0; i < years; i++) {
    const grown = equity * (1 + r_eq) + annualContribution * equityContribRatio;
    const sell = Math.min(annualSell, Math.max(0, grown));
    equity = grown - sell;
    newFund = newFund * (1 + r_new) + sell + annualContribution * (1 - equityContribRatio);
  }
  const total = equity + newFund;
  if (total <= 0) return nfRatio;
  return (equity + newFund * nfRatio) / total;
}

function computePlanKeepBoth(equityBalance, years, r_eq, r_new, nfRatio, annualContribution, equityContribRatio, target, currentAge) {
  const sim = (sell) => simulatePlan(equityBalance, years, r_eq, r_new, nfRatio, annualContribution, equityContribRatio, sell);

  if (sim(0) <= target + 1e-9) {
    return buildTimeline(equityBalance, annualContribution, equityContribRatio, 0, years, r_eq, r_new, nfRatio, currentAge);
  }

  let lo = 0, hi = equityBalance * 2;
  for (let i = 0; i < 120; i++) {
    const mid = (lo + hi) / 2;
    if (sim(mid) > target) lo = mid;
    else hi = mid;
  }
  return buildTimeline(equityBalance, annualContribution, equityContribRatio, (lo + hi) / 2, years, r_eq, r_new, nfRatio, currentAge);
}

function computePlanFullMigration(equityBalance, years, r_eq, r_new, nfRatio, annualContribution, equityContribRatio, currentAge) {
  // Analytical: sell enough to deplete equity to exactly 0 at retirement
  // For プランA (equityContribRatio=0): annualSell = PMT(equityBalance, r_eq, years)
  // For プランB (equityContribRatio>0): add contribution * equityContribRatio to offset annual equity buys
  const annualSell = pmt(equityBalance, r_eq, years) + annualContribution * equityContribRatio;
  return buildTimeline(equityBalance, annualContribution, equityContribRatio, annualSell, years, r_eq, r_new, nfRatio, currentAge);
}

function buildTimeline(equityBalance, annualContribution, equityContribRatio, annualSell, years, r_eq, r_new, nfRatio, currentAge) {
  const timeline = [];
  let equity = equityBalance;
  let newFund = 0;

  timeline.push({
    age: currentAge,
    year: 0,
    equity,
    newFund,
    total: equity + newFund,
    effectiveEquityRatio: 100,
  });

  for (let i = 1; i <= years; i++) {
    const grown = equity * (1 + r_eq) + annualContribution * equityContribRatio;
    const sell = Math.min(annualSell, Math.max(0, grown));
    equity = grown - sell;
    newFund = newFund * (1 + r_new) + sell + annualContribution * (1 - equityContribRatio);
    const total = equity + newFund;
    const effectiveEquityRatio = total > 0 ? ((equity + newFund * nfRatio) / total) * 100 : 0;
    timeline.push({ age: currentAge + i, year: i, equity, newFund, total, effectiveEquityRatio });
  }

  return { annualSell, equityContribRatio, timeline };
}

export function calculateGlidePath({
  equityBalance,
  currentAge,
  retirementAge,
  equityReturn,
  annualContribution,
  newFundReturn,
  newFundEquityRatio,
  targetEquityRatio,
  migrationMode,
}) {
  const years = retirementAge - currentAge;
  if (years < 1) return { error: 'invalid_age' };
  if (equityBalance <= 0) return { error: 'no_equity' };

  const r_eq = equityReturn / 100;
  const r_new = newFundReturn / 100;
  const nfRatio = newFundEquityRatio / 100;
  const target = targetEquityRatio / 100;

  if (migrationMode === 'full-migration') {
    const planA = computePlanFullMigration(equityBalance, years, r_eq, r_new, nfRatio, annualContribution, 0, currentAge);
    const planB = computePlanFullMigration(equityBalance, years, r_eq, r_new, nfRatio, annualContribution, target, currentAge);
    return { planA, planB, error: null, migrationMode };
  }

  // keep-both
  if (nfRatio > target) return { error: 'infeasible' };
  const planA = computePlanKeepBoth(equityBalance, years, r_eq, r_new, nfRatio, annualContribution, 0, target, currentAge);
  const planB = computePlanKeepBoth(equityBalance, years, r_eq, r_new, nfRatio, annualContribution, target, target, currentAge);
  return { planA, planB, error: null, migrationMode };
}
