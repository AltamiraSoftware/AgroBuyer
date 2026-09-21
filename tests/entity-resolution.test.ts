import { describe, expect, it } from "vitest";
import { compareEntities } from "../lib/entity-resolution";

describe("entity resolution", () => {
  it("merges an exact CUIT match", () => {
    const result = compareEntities(
      { cuit: "30-70861713-6", normalizedName: "snacks danal" },
      { cuit: "30-70861713-6", normalizedName: "gabriel maldonado e hijos" },
    );
    expect(result).toEqual({ shouldMerge: true, confidence: 1, reasons: ["same_cuit"] });
  });

  it("requires several weaker signals before merging", () => {
    const result = compareEntities(
      { domain: "danal.com.ar", phone: "351123", normalizedAddress: "ruta 1", normalizedName: "danal" },
      { domain: "danal.com.ar", phone: "351123", normalizedAddress: "ruta 1", normalizedName: "snacks danal" },
    );
    expect(result.shouldMerge).toBe(true);
    expect(result.reasons).toContain("same_domain");
  });

  it("does not merge on name alone", () => {
    const result = compareEntities(
      { normalizedName: "alimentos cordoba" },
      { normalizedName: "alimentos cordoba" },
    );
    expect(result.shouldMerge).toBe(false);
  });
});
