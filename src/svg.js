import {
  html,
  svg,
  css,
  scaleLinear,
  repeat,
  useMemo,
  useCallback,
  useReducer
} from "./packages.js";
import { Deck } from "./deck.js";

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
  const transform = useMemo(() => {
    if (!zoomed) return `translate(0, 0) scale(1)`;
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
    // as a transform attribute
    //const transformStart = `translate(${translate}) scale(${k})`;
    // as a transform style
    const transformStart = `translate(${translate.map(v => `${v}px`)}) scale(${k})`;
    return transformStart;
  }, [bySlug, zoomed, width, height]);
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
          transition: transform 0.7s ease-in-out;
        }
      `}"
      @mouseover=${mouseover}
      @mouseout=${mouseout}
      @click=${click}
    >
      <g id="view" style="transform: ${transform}" class="view">
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
