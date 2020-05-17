import { svg } from './packages.js';

import { parseCluster } from './parse-cluster.js';

export const Deck = ({ deck, cx, cy, highlighted }) => {
  const cluster = parseCluster(deck.cluster);
  return svg`
    <g>
      <circle
        cx="${cx}"
        cy="${cy}"
        class="deck"
        data-slug="${deck.slug}"
        id="deck-${deck.slug}"
        data-highlighted=${highlighted}
      />
    </g>
  `;
};
