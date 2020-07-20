import { html, css } from "./packages.js";
import { parseCluster } from "./parse-cluster.js";

export const Hud = ({ width, height, bySlug, zoomed, loading }) => {
  const deck = bySlug[zoomed];
  return html`
    <div
      class=${css`
        cursor: pointer;
        position: absolute;
        padding: 10px;
      `}
    >
      ${deck ? html`
      Name: <a target="_blank" href="${deck.slug}">${deck.name}</a>
      <br />
      <img src="${deck.mana_chart_thumbnail}" />
      ` : '' }
      ${loading ? html`<br /><br />Loading...<br />` : '' }
    </div>
  `;
};
