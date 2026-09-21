import { describe, expect, it } from "vitest";
import { generateQueries } from "../lib/query-generator";

describe("query generator", () => {
  it("combines every segment keyword with the geography", () => {
    expect(generateQueries("processor", "Córdoba Argentina")).toEqual([
      "fábrica papas fritas Córdoba Argentina",
      "fabricante snacks Córdoba Argentina",
      "procesadora de papas Córdoba Argentina",
    ]);
  });
});
