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

const composeActiveReducer = type => {
  return (state, action) => {
    switch (action.type) {
      case `ON-${type}`: {
        return action.value;
      }
      case `OFF-${type}`: {
        return state === action.value ? null : state;
      }
      case `RESET`: {
        return null;
      }
      default: {
        return state;
      }
    }
  };
};

const useComposeActions = (dispatch, type) => {
  return useMemo(
    () => ({
      on: value => {
        dispatch({ type: `ON-${type}`, value });
      },
      off: value => {
        dispatch({ type: `OFF-${type}`, value });
      },
      reset: () => dispatch({ type: 'RESET' })
    }),
    [dispatch, type]
  );
};

const useComposeActiveState = type => {
  const reducer = useMemo(() => {
    return composeActiveReducer(type);
  }, [type]);
  const [value, dispatch] = useReducer(reducer, null);
  const actions = useComposeActions(dispatch, type);
  return { value, ...actions };
};

export const Svg = ({ data, width, height }) => {
  const viewBox = `0 0 ${width} ${height}`;
  const decks = data.nodes;
  const {
    value: highlighted,
    on: highlight,
    off: unhighlight
  } = useComposeActiveState("HIGHLIGHT");
  const { value: zoomed, on: zoom, reset: unzoom } = useComposeActiveState(
    "ZOOM"
  );
  const { xValues, yValues, xScale, yScale, bySlug } = useMemo(() => {
    const xValues = decks.map(({ x }) => x);
    const yValues = decks.map(({ y }) => y);
    const xScale = scaleLinear()
      .domain([Math.min(...xValues), Math.max(...xValues)])
      .range([0, width]);
    const yScale = scaleLinear()
      .domain([Math.min(...yValues), Math.max(...yValues)])
      .range([height, 0]);
    const bySlug = decks.reduce((bySlug, deck) => {
      bySlug[deck.slug] = deck;
      return bySlug;
    }, {});
    return { xValues, yValues, xScale, yScale, bySlug };
  }, [decks, width, height]);
  const reorderedDecks = useMemo(() => {
    if (highlighted) {
      const hDeck = bySlug[highlighted];
      const reordered = decks.slice();
      reordered.splice(decks.indexOf(hDeck), 1);
      reordered.push(hDeck);
      return reordered;
    } else {
      return decks;
    }
  }, [decks, highlighted, bySlug]);
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
      if (slug) zoom(slug);
      else unzoom();
    },
    [zoom, unzoom]
  );
  const r = 10;
  //const [translateX, setSpringX] = useSpring2(0);
  //const [translateY, setSpringY] = useSpring2(0);
  //const [k, setSpringK] = useSpring2(1);
  const { syncedValues, update: updateZoomSpring } = useZoomSpring(0,0,1);
  //const transform = useMemo(() => {
    //if (!zoomed) return `translate(0, 0) scale(1)`;
    //const size = r * 15;
    //const zoomedDeck = bySlug[zoomed];
    //const centerX = xScale(zoomedDeck.x);
    //const centerY = yScale(zoomedDeck.y);
    //const start = [centerX, centerY, size];
    //const k = Math.min(width, height) / start[2]; // scale
    //const translate = [
      //width / 2 - start[0] * k,
      //height / 2 - start[1] * k
    //];
    //// as a transform attribute
    //const transformStart = `translate(${translate}) scale(${k})`;
    //return transformStart;
    //// as a transform style
    ////const transformStart = `translate(${translate.map(v => `${v}px`)}) scale(${k})`;
    ////return transformStart;
  //}, [bySlug, zoomed, width, height]);
  useEffect(() => {
    if (!zoomed) {
      //setSpringX(0);
      //setSpringY(0);
      //setSpringK(1);
      updateZoomSpring(0, 0, 1);
    } else {
      const size = r * 15;
      const zoomedDeck = bySlug[zoomed];
      const centerX = xScale(zoomedDeck.x);
      const centerY = yScale(zoomedDeck.y);
      const start = [centerX, centerY, size];
      const k = Math.min(width, height) / start[2]; // scale
      const translate = [
        width / 2 - start[0] * k,
        height / 2 - start[1] * k
      ];
      //setSpringX(translate[0]);
      //setSpringY(translate[1]);
      //setSpringK(k);
      updateZoomSpring(...translate, k);
    }
  }, [bySlug, zoomed, width, height]);
  const [translateX, translateY, k] = syncedValues;
  const transform = `translate(${translateX}, ${translateY}) scale(${k})`;
  return html`
    <svg
      viewBox="${viewBox}"
      xmlns="http://www.w3.org/2000/svg"
      class="${css`
        .deck {
          fill: hsl(100, 70%, 80%);
          opacity: 0.7;
          r: ${r}px;
          &[data-highlighted="true"] {
            fill: white;
          }
        }
        .view {
          will-change: transform;
          xtransition: transform 0.7s ease-in-out;
        }
      `}"
      @mouseover=${mouseover}
      @mouseout=${mouseout}
      @click=${click}
    >
      <g id="view" transform="${transform}" class="view">
        ${repeat(
          reorderedDecks,
          deck => deck.slug,
          deck => {
            return Deck({
              deck,
              cx: xScale(deck.x),
              cy: yScale(deck.y),
              highlighted: deck.slug === highlighted
            });
          }
        )}
      </g>
    </svg>
  `;
};
