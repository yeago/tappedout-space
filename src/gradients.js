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

const LinearGradient = stops => {

  return svg`
    <radialGradient id="grad_${stops}">
      ${stops.split("").map((stop, i) => {
        const offset = calculateOffset(i, stops.length);
        return svg`<stop class="stop-${stop}" offset="${offset}%" />`;
      })}
    </radialGradient>
  `;
};

export const LinearGradients = reorderedDecks => {
  const gradients = useMemo(() => {
    return new Set(reorderedDecks.map(deck => deck.mana_colors.join("")));
  }, [reorderedDecks]);
  return svg`${[...gradients].map(stops => {
    return LinearGradient(stops);
  })}`;
};
