/** Fixed-horizon, 50:50, two-arm experiment. Alpha=.05 (two-sided), power=.8. */
export function samplePerArm(baseline: number, mde: number) {
  if (!Number.isFinite(baseline) || !Number.isFinite(mde) || baseline <= 0 || mde <= 0 || baseline + mde >= 1) throw new Error("Invalid baseline or MDE");
  const treatment = baseline + mde, mean = (baseline + treatment) / 2;
  return Math.ceil((1.95996398454 * Math.sqrt(2 * mean * (1 - mean)) + .84162123357 * Math.sqrt(baseline * (1 - baseline) + treatment * (1 - treatment))) ** 2 / mde ** 2);
}

export function wilson(successes: number, total: number): [number, number] {
  if (!total) return [0, 1];
  const z = 1.95996398454, p = successes / total, divisor = 1 + z * z / total;
  const middle = (p + z * z / (2 * total)) / divisor;
  const half = z * Math.sqrt(p * (1 - p) / total + z * z / (4 * total * total)) / divisor;
  return [Math.max(0, middle - half), Math.min(1, middle + half)];
}

/** Newcombe interval for independent proportions; avoids zero-variance Wald intervals. */
export function differenceInterval(a: number, na: number, b: number, nb: number): [number, number] {
  if (!na || !nb) return [-1, 1];
  const pa = a / na, pb = b / nb, delta = pb - pa;
  const [la, ua] = wilson(a, na), [lb, ub] = wilson(b, nb);
  return [Math.max(-1, delta - Math.sqrt((pb - lb) ** 2 + (ua - pa) ** 2)), Math.min(1, delta + Math.sqrt((ub - pb) ** 2 + (pa - la) ** 2))];
}

function erfc(x: number) {
  const t = 1 / (1 + .5 * Math.abs(x));
  const ans = t * Math.exp(-x*x - 1.26551223 + t*(1.00002368 + t*(.37409196 + t*(.09678418 + t*(-.18628806 + t*(.27886807 + t*(-1.13520398 + t*(1.48851587 + t*(-.82215223 + t*.17087277)))))))));
  return x >= 0 ? ans : 2 - ans;
}
export function sampleRatioP(a: number, b: number) {
  const total = a + b;
  if (!total) return 1;
  return Math.min(1, erfc(Math.sqrt(((a - b) ** 2 / total) / 2)));
}

export type Arm = { assigned: number; exposed: number; mature: number; starts: number; conversions: number };
export function analyzeExperiment(a: Arm, b: Arm, plan: { status: string; required_per_arm: number; min_days: number; started_at: number | null; ended_at: number | null; stopped_by_plan: number; interrupted: number }, now = Date.now()) {
  const srmP = sampleRatioP(a.assigned, b.assigned);
  const interval = differenceInterval(a.conversions, a.mature, b.conversions, b.mature);
  const delta = a.mature && b.mature ? b.conversions / b.mature - a.conversions / a.mature : null;
  const elapsed = !!plan.started_at && (plan.ended_at ?? now) - plan.started_at >= plan.min_days * 86_400_000;
  const pending = a.exposed + b.exposed - a.mature - b.mature;
  const enough = a.mature >= plan.required_per_arm && b.mature >= plan.required_per_arm;
  let decision = "Menunggu data";
  if (a.assigned + b.assigned >= 20 && srmP < .01) decision = "Tahan keputusan: pembagian sampel tidak seimbang (SRM)";
  else if (plan.status !== "ended") decision = "Eksperimen belum ditutup; hasil masih deskriptif";
  else if (!plan.stopped_by_plan || plan.interrupted) decision = "Eksploratif: ditutup manual atau pernah dijeda; jangan tetapkan pemenang";
  else if (!elapsed || !enough || pending > 0) decision = "Belum konklusif: sampel, durasi, atau jendela observasi belum cukup";
  else if (interval[0] > 0) decision = "B meningkatkan penyelesaian latihan pada eksperimen ini";
  else if (interval[1] < 0) decision = "A meningkatkan penyelesaian latihan pada eksperimen ini";
  else decision = "Belum ada bukti perbedaan; bukan bukti kedua varian setara";
  return { srmP, interval, delta, pending, enough, elapsed, decision };
}
