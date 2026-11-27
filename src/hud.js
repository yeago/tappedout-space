import { html, css } from "./packages.js";

export const Hud = ({ width, height, bySlug, focused, loading, error, zoomLevel }) => {
  const deck = bySlug[focused];
  if (!deck) return "";
  return html`
    <div
      class="hud ${css`
        position: absolute;
        top: 12px;
        left: 12px;
        z-index: 1;
        display: grid;
        grid-template-columns: auto 1fr;
        gap: 4px 12px;
        align-items: center;
        max-width: min(320px, calc(100vw - 90px));
        padding: 10px 12px;
        border-radius: 10px;
        background: rgba(12, 14, 30, .84);
        border: 1px solid #3a3f78;
        color: #e8e9f2;
        font: 13px/1.35 "Helvetica Neue", Helvetica, Arial, sans-serif;

        img {
          grid-row: span 2;
          width: 44px;
          height: 44px;
        }
        .name {
          font-weight: 700;
          font-size: 15px;
          color: #e8e9f2;
          text-decoration: none;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }
        .name:hover {
          text-decoration: underline;
        }
        .hint {
          color: #b7bbdb;
          font-size: 12px;
        }
      `}"
    >
      <img src="${deck.mana_chart_thumbnail}" alt="" />
      <a class="name" target="_blank" href="${deck.url}">${deck.name}</a>
      <span class="hint">Click a nearby deck to fly to it</span>
    </div>
  `;
};
