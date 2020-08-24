import { html, svg, css, useMemo } from "./packages.js";

const offsets = [
  [100],
  [0, 100],
  [0, 50, 100],
  [0, 33, 66, 100],
  [0, 25, 50, 75, 100],
];

const calculateOffset = (i, total) => {
  return offsets[total - 1][i];
};

const hsls = {
  B: [0, 0, 0],
  R: [0, 100, 50],
  G: [114, 100, 50],
  U: [230, 100, 50],
  W: [0, 0, 100],
};

const MonoColorLinearGradient = (stops) => {
  const [stop] = stops;
  const [h, s, l] = hsls[stop];
  const lightened = Math.min(100, l + 20);
  const darkened = Math.max(0, l - 20);
  return svg`
    <linearGradient id="grad_${stops}" x1="0" x2="0" y1="1" y2="0">
      <stop stop-color="hsl(${h}, ${s}%, ${darkened}%)" offset="0%" />
      <stop class="stop-${stop}" offset="50%" />
      <stop stop-color="hsl(${h}, ${s}%, ${lightened}%)" offset="100%" />
    </linearGradient>
  `;
};

const LinearGradient = (stops) => {
  if (stops.length === 1) {
    return MonoColorLinearGradient(stops);
  }
  return svg`
    <linearGradient id="grad_${stops}" x1="0" x2="0" y1="1" y2="0">
      ${stops.split("").map((stop, i) => {
        const offset = calculateOffset(i, stops.length);
        return svg`<stop class="stop-${stop}" offset="${offset}%" />`;
      })}
    </linearGradient>
  `;
};

const sortStops = (stops) => {
  stops = stops.split("");
  if (stops.includes("B")) {
    const index = stops.indexOf("B");
    stops.splice(index, 1);
    stops = [...stops, "B"];
  }
  if (stops.includes("W")) {
    const index = stops.indexOf("W");
    stops.splice(index, 1);
    stops = ["W", ...stops];
  }
  let sorted = stops.join("");
  return sorted;
};

const BlackRadialGradient = () => {
  return svg`
    <radialGradient id="grad_B" fx="80%" fy="20%" r="70%">
      <stop stop-color="gray" offset="10%" />
      <stop class="stop-B" offset="50%" />
      <stop stop-color="#222" offset="80%" />
      <stop class="stop-B" offset="100%" />
    </radialGradient>
  `;
};

const RadialGradient = (stops) => {
  if (stops === "B") {
    return BlackRadialGradient();
  }
  return svg`
    <radialGradient id="grad_${stops}" fx="80%" fy="20%" r="70%">
      ${sortStops(stops)
        .split("")
        .map((stop, i) => {
          const offset = calculateOffset(i, stops.length);
          return svg`<stop class="stop-${stop}" offset="${offset}%" />`;
        })}
    </radialGradient>
  `;
};

export const Gradients = (reorderedDecks, type) => {
  const gradients = useMemo(() => {
    return new Set(reorderedDecks.map((deck) => deck.mana_colors.join("")));
  }, [reorderedDecks]);
  return svg`
    ${[...gradients].map((stops) => {
      return LinearGradient(stops);
    })}
  `;
};
