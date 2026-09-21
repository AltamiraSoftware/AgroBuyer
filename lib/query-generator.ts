import type { BuyerSegment } from "./types";

export const segmentKeywords: Record<BuyerSegment, string[]> = {
  processor: ["fábrica papas fritas", "fabricante snacks", "procesadora de papas"],
  catering: ["catering industrial", "comedor industrial", "alimentación colectiva"],
  distributor: ["distribuidor de alimentos", "distribuidor gastronómico", "mayorista de verduras"],
  retail: ["cadena de supermercados", "supermercado mayorista", "autoservicio"],
  restaurant: ["cadena de restaurantes", "grupo gastronómico", "restaurante institucional"],
};

export function generateQueries(segment: BuyerSegment, location: string): string[] {
  return segmentKeywords[segment].map((keyword) => `${keyword} ${location}`);
}
