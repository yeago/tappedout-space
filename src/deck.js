import { svg } from "./packages.js";

import { parseCluster } from "./parse-cluster.js";

const add = (a, b) => a + b;

const sum = (...values) => {
  return values.reduce(add, 0);
};

export const Deck = ({ deck, cx, cy, highlighted, zoomed, r, circumference }) => {
  const cluster = parseCluster(deck.cluster);
  const gradient = `grad_${deck.mana_colors.join('')}`;
  const rByVotes = (deck) => {
    if (deck.votes > 3) return 'medium';
    if (deck.votes > 10) return 'large';
    return 'small'
  }
  const gClass = `node-${rByVotes(deck)}`
  return svg`
    <g class="${gClass}">
      <circle
        cx="${cx}"
        cy="${cy}"
        r=${r}
        class="deck"
        data-slug="${deck.slug}"
        id="deck-${deck.slug}"
        data-highlighted=${highlighted}
        data-zoomed=${zoomed}
        fill=${`url(#${gradient})`}
      />
    </g>
  `;
};
