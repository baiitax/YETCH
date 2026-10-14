// Report formulas. Each function documents its definition. A zero denominator returns N/A, never a division.
// Counts are integers. Percentages are display values only, computed after the counts are exact.

export type Ratio = {
  numerator: number;
  denominator: number;
  /** null when the denominator is zero. */
  percent: number | null;
  display: string;
};

export function ratio(numerator: number, denominator: number): Ratio {
  if (denominator === 0) {
    return { numerator, denominator, percent: null, display: 'N/A' };
  }
  const percent = Math.round((numerator / denominator) * 1000) / 10;
  return { numerator, denominator, percent, display: `${percent.toFixed(1)}%` };
}

export type CohortLead = {
  createdAt: Date;
  qualifiedAt: Date | null;
  hasWonOpportunity: boolean;
};

/**
 * Lead funnel for leads created within the report window (the cohort).
 * - qualificationRate: cohort leads that were ever qualified ÷ cohort leads.
 * - qualifiedToWonRate: cohort leads with a won opportunity ÷ cohort leads that were ever qualified.
 */
export function leadFunnel(leads: readonly CohortLead[], from: Date, to: Date) {
  const cohort = leads.filter((l) => l.createdAt >= from && l.createdAt < to);
  const qualified = cohort.filter((l) => l.qualifiedAt !== null);
  const won = qualified.filter((l) => l.hasWonOpportunity);
  return {
    totalLeads: cohort.length,
    qualifiedLeads: qualified.length,
    wonFromQualified: won.length,
    qualificationRate: ratio(qualified.length, cohort.length),
    qualifiedToWonRate: ratio(won.length, qualified.length),
  };
}

export type SourceLead = { originalSource: string };

/** Lead counts by original acquisition source. The original source is never overwritten by later edits. */
export function sourceBreakdown(leads: readonly SourceLead[]) {
  const counts = new Map<string, number>();
  for (const lead of leads) counts.set(lead.originalSource, (counts.get(lead.originalSource) ?? 0) + 1);
  const total = leads.length;
  return [...counts.entries()]
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
    .map(([source, count]) => ({ source, count, share: ratio(count, total) }));
}

export type SentProposal = { status: string; sentAt: Date | null };

/**
 * Proposal acceptance: recorded acceptances ÷ proposals that were sent.
 * Proposals still open (sent, no decision) are counted in the denominator, so the rate is not overstated.
 */
export function proposalAcceptance(proposals: readonly SentProposal[]) {
  const sent = proposals.filter((p) => p.sentAt !== null);
  const accepted = sent.filter((p) => p.status === 'accepted');
  return { sent: sent.length, accepted: accepted.length, rate: ratio(accepted.length, sent.length) };
}

export type WonDeal = { finalValueMinor: bigint; currency: string };

/** Average won value per currency, in minor units (floor division). N/A where no deals were won. */
export function averageWonValue(deals: readonly WonDeal[]) {
  const byCurrency = new Map<string, { total: bigint; count: number }>();
  for (const d of deals) {
    const current = byCurrency.get(d.currency) ?? { total: 0n, count: 0 };
    byCurrency.set(d.currency, { total: current.total + d.finalValueMinor, count: current.count + 1 });
  }
  return [...byCurrency.entries()].map(([currency, { total, count }]) => ({
    currency,
    count,
    averageMinor: count === 0 ? null : total / BigInt(count),
  }));
}

export type OpenOpportunity = { amountMinor: bigint; currency: string; probabilityPct: number | null };

/**
 * Open pipeline by currency.
 * - unweighted: sum of open opportunity amounts.
 * - weighted: sum of amount × probability, only for opportunities with a probability set (floor division).
 * No exchange rates are applied. Mixed currencies are reported separately.
 */
export function pipeline(opps: readonly OpenOpportunity[]) {
  const result = new Map<string, { unweightedMinor: bigint; weightedMinor: bigint; withoutProbability: number; count: number }>();
  for (const o of opps) {
    const row = result.get(o.currency) ?? { unweightedMinor: 0n, weightedMinor: 0n, withoutProbability: 0, count: 0 };
    row.unweightedMinor += o.amountMinor;
    row.count += 1;
    if (o.probabilityPct === null) row.withoutProbability += 1;
    else row.weightedMinor += (o.amountMinor * BigInt(o.probabilityPct)) / 100n;
    result.set(o.currency, row);
  }
  return [...result.entries()].map(([currency, v]) => ({ currency, ...v }));
}
