// Where the map pans to: [translateX, translateY, scale] for the svg's outer <g>.
// Pure (no imports, no hooks) so test/run.js can check it on its own.
export const panFor = ({ focusedDeck, zoomLevel, xValues, yValues, xScale, yScale, width, height }) => {
  // returning [0, 0, 1] will fit the entire coordinate space into the svg area, viewing everything. Decks will look tiny.
  if (!focusedDeck) return [0, 0, 1];
  // the larger the factor, the more zoomed out.
  // size = 1 * diameter means that one deck circle will fit the viewport at the smallest dimension.
  // size = 10 * diameter means that ten deck circles can fit the viewport at the smallest dimension.
  const size = 1; // diameter * zScale(zoomLevel)

  // mlrec's 2D layout often puts a deck at the edge of its own neighbourhood, so centring on
  // the deck left the cluster half off screen when zoomed out. At the outermost zoom level,
  // centre on the whole neighbourhood (the deck included); from there in, on the deck. (Blending
  // the two landed in the empty gap when a deck sits far from its cluster.)
  const mid = (values, fallback) => values.length ? (Math.min(...values) + Math.max(...values)) / 2 : fallback;
  const t = zoomLevel <= 1 ? 0 : 1;
  const centerX = xScale(mid(xValues, focusedDeck.x) * (1 - t) + focusedDeck.x * t);
  const centerY = yScale(mid(yValues, focusedDeck.y) * (1 - t) + focusedDeck.y * t);

  const k = Math.min(width, height) / size; // scale
  const translate = [
    width / 2 - centerX * k,
    height / 2 - centerY * k
  ];
  return [...translate, k];
};

// How far each zoom level scales the map, on top of panFor's k (zoom 5 = 1, the closest view).
// The outermost level used to be a fixed 0.15 of the closest view. That fits a tight neighbourhood
// (most Commander decks), but where mlrec spreads a deck's neighbours widely (Pauper, often) zoom 1
// showed a sliver of the cluster centred on an empty gap: "zooming out shows an empty map".
// Zoom 1 now fits the whole neighbourhood (with a margin) when that needs more room than 0.15,
// and the levels in between step evenly in ratio, so each click zooms by the same factor.
export const MIN_ZOOM_SCALE = 0.15;
export const zoomScaleFor = ({ zoomLevel, xValues, yValues, xScale, yScale, width, height, k, margin = 1.2 }) => {
  let zMin = MIN_ZOOM_SCALE;
  if (xValues.length > 1 && k > 0) {
    const spanX = Math.abs(xScale(Math.max(...xValues)) - xScale(Math.min(...xValues)));
    const spanY = Math.abs(yScale(Math.max(...yValues)) - yScale(Math.min(...yValues)));
    // The scale at which the neighbourhood's span, plus the margin, fills the viewport.
    const fit = Math.min(width / Math.max(spanX * margin, 1e-9), height / Math.max(spanY * margin, 1e-9)) / k;
    if (fit < zMin) zMin = fit;
  }
  const level = Math.min(Math.max(zoomLevel, 1), 5);
  return zMin * Math.pow(1 / zMin, (level - 1) / 4);
};

// A deck's radius in map units: 0.1 normally; larger only when the view is zoomed out so far that a deck
// would be drawn smaller than MIN_DOT_PX across (zoom 1 on a widely spread neighbourhood).
export const BASE_RADIUS = 0.1;
export const MIN_DOT_PX = 5;
export const deckRadiusFor = ({ k, zoom }) => {
  const onScreen = k * zoom; // screen px per map unit
  if (!(onScreen > 0)) return BASE_RADIUS;
  return Math.max(BASE_RADIUS, MIN_DOT_PX / 2 / onScreen);
};
