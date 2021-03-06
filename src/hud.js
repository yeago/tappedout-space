import { html, css } from "./packages.js";

export const Hud = ({ width, height, bySlug, focused, loading, zoomLevel }) => {
  const deck = bySlug[focused];
  return html`
    <div
      class="hud ${css`
        position: absolute;
        padding: 10px;

        a.link {
          color: lightblue;
        }
      `}"
    >
      ${deck ? html`
      Name: <a class="link" target="_blank" href="${deck.url}">${deck.name}</a>
      <br />
      <img src="${deck.mana_chart_thumbnail}" />
      ` : '' }
      ${loading ? html`<br /><br />Loading...<br />` : '' }
    </div>
  `;
};
