import { html, css } from "./packages.js";
import { clamp, getZoomLevel } from "./use-zoom-levels.js";
import { useLocationHashQueryParams } from "./use-location-hash.js";

const ZoomButton = ({ direction, className }) => {
  const icon = direction === 1 ? '+' : '-';
  const { queryParams, updateQueryParams } = useLocationHashQueryParams();
  const zoom = getZoomLevel(queryParams);
  const targetZoom = clamp(zoom + direction, 1, 5);
  const handleClick = e => {
    e.preventDefault();
    updateQueryParams({ zoom: targetZoom });
  };
  return html`
    <a class="${className} ${css`
      background: #ccc;
      color: black;
      cursor: pointer;
      display: flex;
      align-items: center;
      font-size: 30px;
      font-weight: bold;
      justify-content: center;
      height: var(--zoom-control-height);
      line-height: var(--zoom-control-height);
      width: var(--zoom-control-width);
      text-decoration: none;
      user-select: none;
      &:hover {
        border: 3px solid white;
      }
      &:active {
        border: 5px solid white;
      }

      &.top {
        border-radius: 15px 15px 0 0;
      }

      &.bottom {
        border-radius: 0 0 15px 15px;
      }
    `}"
      @click=${handleClick}
    >
      ${icon}
    </a>
  `;
};

export const ZoomControls = () => {
  return html`
    <div class="zoom-controls ${css`
      --zoom-control-width: 40px;
      --zoom-control-height: var(--zoom-control-width);
      --zoom-outer-padding: 2px;
      background: rgba(0, 0, 0, 0.1);
      border-radius: 17px;
      box-shadow: 1px 1px 10px rgba(0, 0, 0, 0.3);
      display: flex;
      position: fixed;
      flex-direction: column;
      align-items: center;
      justify-content: space-between;
      height: calc((var(--zoom-control-height) * 2) + var(--zoom-outer-padding) * 2 + 2px);
      width: calc(var(--zoom-control-width) + var(--zoom-outer-padding) * 2);
      bottom: 30px;
      padding: var(--zoom-outer-padding);
      right: 20px;
    `}">
      ${ZoomButton({ direction: 1, className: "top" })}
      ${ZoomButton({ direction: -1, className: "bottom" })}
    </div>
  `;
};

