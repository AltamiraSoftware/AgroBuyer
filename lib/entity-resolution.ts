export interface EntityCandidate {
  cuit?: string;
  domain?: string;
  phone?: string;
  normalizedAddress?: string;
  normalizedName: string;
}

export interface MatchResult {
  shouldMerge: boolean;
  confidence: number;
  reasons: string[];
}

export function compareEntities(left: EntityCandidate, right: EntityCandidate): MatchResult {
  const reasons: string[] = [];
  let score = 0;

  if (left.cuit && right.cuit && left.cuit === right.cuit) {
    return { shouldMerge: true, confidence: 1, reasons: ["same_cuit"] };
  }
  if (left.domain && right.domain && left.domain === right.domain) {
    score += 0.55;
    reasons.push("same_domain");
  }
  if (left.phone && right.phone && left.phone === right.phone) {
    score += 0.3;
    reasons.push("same_phone");
  }
  if (
    left.normalizedAddress &&
    right.normalizedAddress &&
    left.normalizedAddress === right.normalizedAddress
  ) {
    score += 0.2;
    reasons.push("same_address");
  }
  if (left.normalizedName === right.normalizedName) {
    score += 0.15;
    reasons.push("same_name");
  }

  const confidence = Math.min(score, 0.99);
  return { shouldMerge: confidence >= 0.7, confidence, reasons };
}
