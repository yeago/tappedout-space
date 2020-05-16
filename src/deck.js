import { svg } from './packages.js';

export const Deck = ({ deck, cx, cy, highlighted }) => {
  return svg`
    <circle
      cx="${cx}"
      cy="${cy}"
      class="deck"
      data-slug="${deck.slug}"
      id="deck-${deck.slug}"
      data-highlighted=${highlighted}
    />
  `;
};
