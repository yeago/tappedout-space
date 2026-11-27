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
