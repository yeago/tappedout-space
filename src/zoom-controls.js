import { html, css, useMemo, useEffect } from "./packages.js";
import { clamp, getZoomLevel } from "./use-zoom-levels.js";
import { useLocationHashQueryParams } from "./use-location-hash.js";
import { useSpring2 } from "./use-spring.js";
import { useSprings } from "./use-springs.js";

const ZoomButton = ({ direction, className }) => {
  const icon = direction === 1 ? "+" : "-";
  const { queryParams, updateQueryParams } = useLocationHashQueryParams();
  const zoom = getZoomLevel(queryParams);
  const targetZoom = clamp(zoom + direction, 1, 5);
  const handleClick = (e) => {
    e.preventDefault();
    updateQueryParams({ zoom: targetZoom });
  };
  return html`
    <a
      class="${className} ${css`
        background-color: var(--zoom-control-surface-color);
        box-shadow: var(--zoom-box-shadow);
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

const ZoomLevelsGuage = ({ height, zoom }) => {
  const cursorSpring = useSpring2({ fromValue: zoom, toValue: zoom, stiffness: 200 });
  const springs = useMemo(() => [cursorSpring], [cursorSpring]);
  const [zoomSpring] = useSprings(springs);
  const ticks = 5;
  const segments = ticks + 1;
  useEffect(() => {
    cursorSpring.updateConfig({ toValue: zoom });
    cursorSpring.start();
  }, [zoom, cursorSpring]);

  const cursorY = `${(segments - zoomSpring) / (segments) * height}px`;
  return html`<div class="zoom-guage ${css`
      height: var(--zoom-guage-height);
      width: 100%;
      display: flex;
      flex-direction: column;
      position: relative;
      align-items: center;
      justify-content: space-evenly;

      .zoom-guage-tick {
        background: #666;
        border-radius: 3px;
        height: 3px;
        width: 80%;
      }

      .zoom-guage-cursor {
        background-color: var(--zoom-control-surface-color);
        box-shadow: var(--zoom-box-shadow);
        position: absolute;
        top: 0;
        left: 0;
        border-radius: 5px;
        height: 6px;
        margin-top: -3px;
        width: 100%;
      }
    `}"
  >
    ${new Array(ticks).fill(0).map((_, i) => {
      return html`<div class="zoom-guage-tick" data-tick-index=${i}></div>`
    })}
    <div class="zoom-guage-cursor" style="transform: translateY(${cursorY})"></div>
  </div>`;
};

export const ZoomControls = () => {
  const { queryParams, updateQueryParams } = useLocationHashQueryParams();
  const zoom = getZoomLevel(queryParams);
  const guageHeight = 100;// px
  return html`
    <div
      class="zoom-controls ${css`
        --zoom-control-surface-color: #ccc;
        --zoom-control-width: 40px;
        --zoom-control-height: var(--zoom-control-width);
        --zoom-control-box-shadow: 1px 1px 3px rgba(0, 0, 0, 0.8);
        --zoom-outer-padding: 2px;
        --zoom-guage-height: ${guageHeight}px;
        background: rgba(0, 0, 0, 0.2);
        border-radius: 17px;
        zoom-box-shadow: 1px 1px 10px rgba(0, 0, 0, 0.3);
        display: flex;
        position: fixed;
        flex-direction: column;
        align-items: center;
        justify-content: space-between;
        height: calc(
          (var(--zoom-control-height) * 2) + var(--zoom-outer-padding) * 2 + 2px +
            var(--zoom-guage-height)
        );
        width: calc(var(--zoom-control-width) + var(--zoom-outer-padding) * 2);
        bottom: 30px;
        padding: var(--zoom-outer-padding);
        right: 20px;
      `}"
    >
      ${ZoomButton({
        direction: 1,
        className: "top",
        queryParams,
        updateQueryParams,
        zoom,
      })}
      ${ZoomLevelsGuage({ queryParams, updateQueryParams, zoom, height: guageHeight })}
      ${ZoomButton({
        direction: -1,
        className: "bottom",
        queryParams,
        updateQueryParams,
        zoom,
      })}
    </div>
  `;
};
