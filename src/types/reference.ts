// Year-level reference blocks (retrogrades / eclipses). These are produced at
// runtime by KnowledgeService from the real ephemeris + knowledge base — no
// hardcoded dates anywhere. Consumed by RetrogradeBlock / EclipseBlock.

export interface RetrogradePlanet {
  planet: string;
  periods: string[];
  zodiac_signs: string;
  interpretation: string;
}

export interface EclipseEntry {
  event: string;
  date: string;
  type: string;
  zodiac_position: string;
  description: string;
}
