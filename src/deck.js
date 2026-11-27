import { svg } from "./packages.js";

const votesSize = (votes) => {
  if (votes > 10) return 'large';
  if (votes > 3) return 'medium';
  return 'small'
}

export const Deck = ({ deck, cx, cy, highlighted, focused, r, circumference }) => {
  const gradient = `grad_${deck.mana_colors.join('')}`;
  return svg`
    <g>
      ${focused ? svg`<circle class="focus-halo" cx="${cx}" cy="${cy}" r="${r * 4}" fill=${`url(${window.location.pathname}#focus_halo)`} />` : ""}
      <circle
        cx="${cx}"
        cy="${cy}"
        class="deck"
        data-slug="${deck.slug}"
        id="deck-${deck.slug}"
        data-highlighted=${highlighted}
        data-focused=${focused}
        data-votes-size=${votesSize(deck.votes)}
        fill=${`url(${window.location.pathname}#${gradient})`}
      />
      ${focused ? svg`<circle class="focus-ring" cx="${cx}" cy="${cy}" r="${r * 1.7}" />` : ""}
    </g>
  `;
};
