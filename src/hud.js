import { html, css } from "./packages.js";

export const Hud = ({ width, height }) => {
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
    </div>
  `;
};
