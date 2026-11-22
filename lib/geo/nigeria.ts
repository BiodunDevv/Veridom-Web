/** Rough bounding box of Nigeria: [west, south, east, north]. */
export const NIGERIA_BOUNDS: [number, number, number, number] = [
  2.6, 4.2, 14.8, 13.95,
]

export const inNigeria = (lat: number, lng: number) =>
  lng >= NIGERIA_BOUNDS[0] &&
  lat >= NIGERIA_BOUNDS[1] &&
  lng <= NIGERIA_BOUNDS[2] &&
  lat <= NIGERIA_BOUNDS[3]

/** Lagos, used when nothing else is known. */
export const DEFAULT_CENTER = { lat: 6.5244, lng: 3.3792 }
