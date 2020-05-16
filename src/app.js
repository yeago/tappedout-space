import {
  html,
  svg,
  useReducer,
  virtual,
  useCallback,
  useEffect,
  useMemo,
  css
} from "./packages.js";
import { useViewport } from "./use-viewport.js";
import { Svg } from "./svg.js";
import { Hud } from "./hud.js";
import { useComposeActiveState } from "./use-compose-active-state.js";

const styles = css`
  color: white;
  font-family: sans-serif;
  height: 100%;
  overflow: hidden;
  width: 100%;
`;

export const App = virtual(({ data }) => {
  const { width, height } = useViewport();
  const { value: zoomed, on: zoom, reset: unzoom } = useComposeActiveState(
    "ZOOM"
  );

  const decks = data.nodes;
  const bySlug = useMemo(
    () =>
      decks.reduce((bySlug, deck) => {
        bySlug[deck.slug] = deck;
        return bySlug;
      }, {}),
    [decks]
  );
  return html`
    <div
      style="
        --viewport-width: ${width};
        --viewport-height: ${height};
      "
      class="${styles}"
    >
      ${Hud({ width, height, data, bySlug, zoomed })}
      ${Svg({ width, height, data, zoomed, zoom, unzoom, bySlug })}
    </div>
  `;
});
