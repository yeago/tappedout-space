import {
  html,
  svg,
  css,
  scaleLinear,
  repeat,
  useMemo,
  useCallback,
  useReducer,
  useState,
  useEffect,
  Spring
} from "./packages.js";
import { Deck } from "./deck.js";
import { useSpring, useSpring2 } from "./use-spring.js";
import { useSprings } from "./use-springs.js";
import { useComposeActiveState } from "./use-compose-active-state.js";
import { LinearGradients } from "./gradients.js";

const useZoomSpring = (ix, iy, ik) => {
  const x = useSpring2({ fromValue: ix, toValue: ix, stiffness: 120 * 2, damping: 14 * 2, mass: 1 * 2 });
  const y = useSpring2({ fromValue: iy, toValue: iy, stiffness: 120 * 2, damping: 14 * 2, mass: 1 * 2 });
  const k = useSpring2({ fromValue: ik, toValue: ik, stiffness: 120 * 2, damping: 14 * 3, mass: 1 * 2 });
  const update = useCallback((_x, _y, _k) => {
    x.updateConfig({ toValue: _x });
    y.updateConfig({ toValue: _y });
    k.updateConfig({ toValue: _k });
    x.start();
    y.start();
    k.start();
  }, [x, y, k]);
  const springs = useMemo(() => { return [x, y, k]; }, [x, y, k]);
  const syncedValues = useSprings(springs);
  return { update, syncedValues };
};


export const Svg = ({ bySlug, data, width, height, zoomed, zoom, unzoom }) => {
  const viewBox = `0 0 ${width} ${height}`;
  const decks = data.nodes;
  const {
    value: highlighted,
    on: highlight,
    off: unhighlight
  } = useComposeActiveState("HIGHLIGHT");
  const { xValues, yValues, xScale, yScale } = useMemo(() => {
    const xValues = decks.map(({ x }) => x);
    const yValues = decks.map(({ y }) => y);
    const xScale = scaleLinear()
      .domain([data.limit_coordinates.min_coordinates.x,
               data.limit_coordinates.max_coordinates.x])
      //.domain([0, 13.524832725524902])
      .range([0, width]);
    const yScale = scaleLinear()
      .domain([data.limit_coordinates.min_coordinates.y,
               data.limit_coordinates.max_coordinates.y])
      //.domain([-0.23971568048000336, 4.435561180114746])
      .range([height, 0]);
    return { xValues, yValues, xScale, yScale };
  }, [decks, width, height]);
  const reorderedDecks = useMemo(() => {
    if (highlighted || zoomed) {
      const hDeck = bySlug[highlighted];
      const zDeck = bySlug[zoomed];
      const reordered = decks.slice();
      if (highlighted) {
        reordered.splice(reordered.indexOf(hDeck), 1);
        reordered.push(hDeck);
      }
      if (zoomed) {
        reordered.splice(reordered.indexOf(zDeck), 1);
        reordered.push(zDeck);
      }
      return reordered;
    } else {
      return decks;
    }
  }, [decks, highlighted, zoomed, bySlug]);
  const mouseover = useCallback(
    e => {
      const slug = e.target.dataset.slug;
      if (slug) highlight(slug);
    },
    [highlight]
  );
  const mouseout = useCallback(
    e => {
      const slug = e.target.dataset.slug;
      if (slug) unhighlight(slug);
    },
    [unhighlight]
  );
  const click = useCallback(
    e => {
      const slug = e.target.dataset.slug;
      if (slug) window.location.hash = slug;
      //if (slug) zoom(slug);
    },
    [zoom, unzoom]
  );
  // r = 1 is equal to 1px while completely zoomed out, when the coordinate space is entirely in view.
  const r = 0.1; // radius
  const diameter = r * 2;

  const nextZoom = ((r, zoomedDeck) => {
    // returning [0, 0, 1] will fit the entire coordinate space into the svg area, viewing everything. Decks will look tiny.
    if (!zoomedDeck) return [0, 0, 1];
    // the larger the factor, the more zoomed out.
    // size = 1 * diameter means that one deck circle will fit the viewport at the smallest dimension.
    // size = 10 * diameter means that ten deck circles can fit the viewport at the smallest dimension.
    const size = diameter * 10
    const centerX = xScale(zoomedDeck.x);
    const centerY = yScale(zoomedDeck.y);
    const k = Math.min(width, height) / size; // scale
    const translate = [
      width / 2 - centerX * k,
      height / 2 - centerY * k
    ];
    return [...translate, k];
  })(r, zoomed && bySlug[zoomed]);

  const { syncedValues, update: updateZoomSpring } = useZoomSpring(
    ...nextZoom
  );
  useEffect(() => {
    updateZoomSpring(...nextZoom);
  }, [...nextZoom]);

  const [translateX, translateY, k] = syncedValues;
  const transform = `translate(${translateX}, ${translateY}) scale(${k})`;
  const circumference = 2 * Math.PI * r;
  return html`
    <svg
      viewBox="${viewBox}"
      xmlns="http://www.w3.org/2000/svg"
      class="${css`
        --circumference: ${circumference};
        --r: ${r}px;

        .slice {
          --stroke-width: ${r / 4};
          stroke-width: var(--stroke-width);
          r: var(--r);
          fill: transparent;
        }

        .deck {
          --stroke-width: ${r / 4};
          cursor: pointer;
          xfill: transparent;
          xstroke: #ccc;
          --r-scale: 1;
          r: calc(var(--r) * var(--r-scale));
          transition-duration: 0.15s;
          transition-property: stroke-width;
          transition-timing-function: ease-in-out;
          stroke-width: 0;

          &[data-highlighted="true"] {
            stroke: white;
            stroke-width: calc(var(--r) / 7);
          }

          &[data-zoomed="true"], &:active {
            stroke: white;
            stroke-width: calc(var(--r) / 5);
          }

          &[data-votes-size="small"] {
            --r-scale: 0.6;
          }

          &[data-votes-size="medium"] {
            --r-scale: 0.8;
          }

          &[data-votes-size="large"] {
            --r-scale: 1;
          }
        }
        .view {
          will-change: transform;
          xtransition: transform 0.7s ease-in-out;
        }

        .stop-B {
          stop-color: black;
        }
        .stop-U {
          stop-color: blue;
        }
        .stop-R {
          stop-color: red;
        }
        .stop-G {
          stop-color: green;
        }
        .stop-W {
          stop-color: white;
        }
      `}"
      @mouseover=${mouseover}
      @mouseout=${mouseout}
      @click=${click}
    >
      <defs>${LinearGradients(reorderedDecks)}</defs>
      <g id="view" transform="${transform}" class="view">
        ${repeat(
          reorderedDecks,
          deck => deck.slug,
          deck => {
            return Deck({
              deck,
              cx: xScale(deck.x),
              cy: yScale(deck.y),
              r,
              highlighted: deck.slug === highlighted,
              zoomed: deck.slug === zoomed,
              circumference
            });
          }
        )}
      </g>
    </svg>
  `;
};
