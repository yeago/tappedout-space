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
import { Gradients } from "./gradients.js";

const useZoomSpring = (ik) => {
  const k = useSpring2({ fromValue: ik, toValue: ik, stiffness: 150, damping: 50, mass: 3 });
  const update = useCallback((_k) => {
    k.updateConfig({ toValue: _k });
    k.start();
  }, [k]);
  const springs = useMemo(() => [k], [k]);
  const [currentKValue] = useSprings(springs);
  return { update, k: currentKValue };
};

const usePanSpring = (ix, iy) => {
  const x = useSpring2({ fromValue: ix, toValue: ix, stiffness: 100, damping: 50, mass: 10 });
  const y = useSpring2({ fromValue: iy, toValue: iy, stiffness: 100, damping: 50, mass: 10 });
  const update = useCallback((_x, _y, _k) => {
    x.updateConfig({ toValue: _x });
    y.updateConfig({ toValue: _y });
    x.start();
    y.start();
  }, [x, y]);
  const springs = useMemo(() => { return [x, y]; }, [x, y]);
  const syncedValues = useSprings(springs);
  return { update, syncedValues };
};


export const Svg = ({ bySlug, data, width, height, focused, focus, unfocus, zoomLevel }) => {
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
    if (highlighted || focused) {
      const hDeck = bySlug[highlighted];
      const zDeck = bySlug[focused];
      const reordered = decks.slice();
      if (highlighted) {
        reordered.splice(reordered.indexOf(hDeck), 1);
        reordered.push(hDeck);
      }
      if (focused) {
        reordered.splice(reordered.indexOf(zDeck), 1);
        reordered.push(zDeck);
      }
      return reordered;
    } else {
      return decks;
    }
  }, [decks, highlighted, focused, bySlug]);
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
      e.preventDefault();
      const slug = e.target.dataset.slug;
      const params = window.location.hash.split('?')[1];
      if (slug) window.location.hash = slug + (params ? '?' + params : '');
      //if (slug) focus(slug);
    },
    [focus, unfocus]
  );
  // r = 1 is equal to 1px while completely focused out, when the coordinate space is entirely in view.
  const r = 0.1; // radius
  const diameter = r * 2;

  const nextPan = ((focusedDeck) => {
    // returning [0, 0, 1] will fit the entire coordinate space into the svg area, viewing everything. Decks will look tiny.
    if (!focusedDeck) return [0, 0, 1];
    // the larger the factor, the more zoomed out.
    // size = 1 * diameter means that one deck circle will fit the viewport at the smallest dimension.
    // size = 10 * diameter means that ten deck circles can fit the viewport at the smallest dimension.
    const size = 1// diameter * zScale(zoomLevel)

    const centerX = xScale(focusedDeck.x);
    const centerY = yScale(focusedDeck.y);

    const k = Math.min(width, height) / size; // scale
    const translate = [
      width / 2 - centerX * k,
      height / 2 - centerY * k
    ];
    return [...translate, k];
  })(focused && bySlug[focused]);

  const { syncedValues, update: updatePanSpring } = usePanSpring(
    ...nextPan
  );
  const zScale = scaleLinear().domain([1, 5]).range([0.15, 1]);
  const nextZoom = zScale(zoomLevel)
  const { k, update: updateZoomSpring } = useZoomSpring(nextZoom);

  useEffect(() => {
    updatePanSpring(...nextPan);
  }, [...nextPan]);

  useEffect(() => {
    updateZoomSpring(nextZoom);
  }, [nextZoom]);

  const panK = nextPan[2];
  const [translateX, translateY] = syncedValues;
  const transform = `translate(${translateX}, ${translateY}) scale(${panK})`;
  const transformScale = `scale(${k})`;
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

          &[data-focused="true"], &:active {
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
      <defs>${Gradients(decks)}</defs>
      <g id="view-scale" transform="${transformScale}" transform-origin="center" class="view">
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
              focused: deck.slug === focused,
              circumference
            });
          }
        )}
      </g>
      </g>
    </svg>
  `;
};
