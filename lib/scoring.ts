import type { Company, ScoreBreakdown } from "./types";

const evidencePoints = { direct: 30, indirect: 16, none: 0 } as const;
const volumePoints = { high: 20, medium: 13, low: 6, unknown: 0 } as const;
const segmentPoints = {
  processor: 15,
  catering: 11,
  distributor: 10,
  retail: 8,
  restaurant: 6,
} as const;
const sizePoints = { large: 10, medium: 7, small: 4, unknown: 0 } as const;
const contactPoints = { high: 10, medium: 7, low: 3, none: 0 } as const;

export function distancePoints(distanceKm: number): number {
  if (distanceKm <= 50) return 15;
  if (distanceKm <= 100) return 12;
  if (distanceKm <= 200) return 9;
  if (distanceKm <= 350) return 5;
  return 1;
}

export function calculateBuyerScore(company: Company): ScoreBreakdown {
  const breakdown = {
    potatoEvidence: evidencePoints[company.evidenceStrength],
    volume: volumePoints[company.volumeSignal],
    buyerType: segmentPoints[company.segment],
    distance: distancePoints(company.distanceKm),
    companySize: sizePoints[company.companySize],
    contactability: contactPoints[company.contactability],
  };

  return { ...breakdown, total: Object.values(breakdown).reduce((sum, value) => sum + value, 0) };
}

export function scoreBand(score: number): "A" | "B" | "C" {
  if (score >= 75) return "A";
  if (score >= 55) return "B";
  return "C";
}
