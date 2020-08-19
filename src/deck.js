import { svg } from "./packages.js";

import { parseCluster } from "./parse-cluster.js";

const add = (a, b) => a + b;

const sum = (...values) => {
  return values.reduce(add, 0);
};

const votesSize = (votes) => {
  if (votes > 3) return 'medium';
  if (votes > 10) return 'large';
  return 'small'
}

export const Deck = ({ deck, cx, cy, highlighted, focused, r, circumference }) => {
  const cluster = parseCluster(deck.cluster);
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
        data-focused=${focused}
        data-votes-size=${votesSize(deck.votes)}
        fill=${`url(#${gradient})`}
      />
    </g>
  `;
};
