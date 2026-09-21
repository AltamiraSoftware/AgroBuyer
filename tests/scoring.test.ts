import { describe, expect, it } from "vitest";
import { calculateBuyerScore, distancePoints, scoreBand } from "../lib/scoring";
import { seedCompanies } from "../lib/seed-companies";

describe("buyer scoring v1", () => {
  it("keeps each distance bracket deterministic", () => {
    expect(distancePoints(50)).toBe(15);
    expect(distancePoints(51)).toBe(12);
    expect(distancePoints(200)).toBe(9);
    expect(distancePoints(351)).toBe(1);
  });

  it("gives the strongest evidenced processor a high-priority score", () => {
    const danal = seedCompanies.find((company) => company.id === "danal");
    expect(danal).toBeDefined();
    const score = calculateBuyerScore(danal!);
    expect(score.total).toBe(97);
    expect(scoreBand(score.total)).toBe("A");
  });

  it("does not promote a company without evidence or volume signals", () => {
    const unknown = seedCompanies.find((company) => company.id === "distribuidor-demo");
    expect(unknown).toBeDefined();
    expect(calculateBuyerScore(unknown!).total).toBeLessThan(55);
  });
});
