import { svg } from "./packages.js";

import { parseCluster } from "./parse-cluster.js";

const add = (a, b) => a + b;

const sum = (...values) => {
  return values.reduce(add, 0);
};

export const Deck = ({ deck, cx, cy, highlighted, r, circumference }) => {
  const cluster = parseCluster(deck.cluster);
  const slice = ({ percentage, color, rotate }) => {
    if (percentage === 0) return "";
    return Slice({
      deck,
      cx,
      cy,
      highlighted,
      r,
      circumference,
      percentage,
      color,
      rotate
    });
  };
  const slices = [
    { percentage: cluster.B, color: "black" },
    { percentage: cluster.U, color: "blue" },
    { percentage: cluster.W, color: "white" },
    { percentage: cluster.G, color: "green" },
    { percentage: cluster.R, color: "red" }
  ];
  const gradient = `grad_${deck.mana_colors.join('')}`;
  return svg`
    <g>
      <circle
        cx="${cx}"
        cy="${cy}"
        class="deck"
        data-slug="${deck.slug}"
        id="deck-${deck.slug}"
        data-highlighted=${highlighted}
        fill=${`url(#${gradient})`}
      />
    </g>
  `;
};
