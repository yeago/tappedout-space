import { svg, scaleLinear } from "./packages.js";

// Faint stars for the whole format: a fixed sample of every deck in it (the API's "backdrop",
// cached on the server), so zooming out shows the galaxy instead of an empty map. They sit at
// their real positions under the clickable neighbours, ignore the pointer, and fade in as you
// zoom out.
const COLOURS = { W: "#f3e6b4", U: "#3d8fe0", B: "#9a7fb5", R: "#e2503f", G: "#37a96b", C: "#9aa0ad" };
// The zoom spring's k runs from 0.15 (all the way out) to 1 (all the way in).
export const backdropOpacity = scaleLinear().domain([0.15, 1]).range([0.75, 0.12]).clamp(true);

// The circles change only with the data or the viewport; memoise them so the zoom animation
// only updates the group's opacity, not ~2,000 elements a frame.
export const backdropStars = (points, xScale, yScale, r) =>
  (points || []).map((p) => svg`<circle cx="${xScale(p.x)}" cy="${yScale(p.y)}" r="${r}" fill="${COLOURS[(p.c || "C")[0]] || COLOURS.C}"/>`);
