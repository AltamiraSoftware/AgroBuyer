export type BuyerSegment =
  | "processor"
  | "catering"
  | "distributor"
  | "retail"
  | "restaurant";

export type EvidenceStrength = "direct" | "indirect" | "none";
export type VolumeSignal = "high" | "medium" | "low" | "unknown";
export type CompanySize = "large" | "medium" | "small" | "unknown";
export type Contactability = "high" | "medium" | "low" | "none";
export type VerificationStatus = "verified" | "partial" | "needs_review";

export interface Evidence {
  claim: string;
  excerpt: string;
  sourceName: string;
  sourceUrl: string;
  checkedAt: string;
  confidence: number;
}

export interface Company {
  id: string;
  commercialName: string;
  legalName?: string;
  cuit?: string;
  city: string;
  province: string;
  distanceKm: number;
  segment: BuyerSegment;
  evidenceStrength: EvidenceStrength;
  volumeSignal: VolumeSignal;
  companySize: CompanySize;
  contactability: Contactability;
  phone?: string;
  email?: string;
  website?: string;
  verificationStatus: VerificationStatus;
  evidence: Evidence[];
}

export interface ScoreBreakdown {
  potatoEvidence: number;
  volume: number;
  buyerType: number;
  distance: number;
  companySize: number;
  contactability: number;
  total: number;
}
