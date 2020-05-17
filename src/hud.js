import { html, css } from "./packages.js";
import { parseCluster } from "./parse-cluster.js";

export const Hud = ({ width, height, bySlug, zoomed }) => {
  const deck = bySlug[zoomed];
  return html`
    <div
      class=${css`
        cursor: pointer;
        position: absolute;
        pointer-events: none;
        left: 0;
        top: 0;
        height: var(--viewport-height);
        width: var(--viewport-width);
      `}
    >
      --viewport-width: ${width};
      <br />
      --viewport-height: ${height};
      <br />
      ${deck ? html`
      Name: ${deck.name}
      <br />
      URL: ${deck.url}
      <br />
      Mana Colors: ${deck.mana_colors}
      <br />
      Cluster: ${Object.entries(parseCluster(deck.cluster))}
      <br />
      <img src="${deck.mana_chart_thumbnail}" />
      ` : '' }
    </div>
  `;
};
