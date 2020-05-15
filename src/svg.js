import { html, css } from "./packages.js";

export const Svg = ({ width, height }) => {
  const viewBox = `0 0 ${width} ${height}`;
  return html`
    <svg
      viewBox="${viewBox}"
      xmlns="http://www.w3.org/2000/svg"
      class="${css`
        background-color: #444;
      `}"
    ></svg>
  `;
};
