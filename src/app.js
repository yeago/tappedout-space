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
import { useLocationHash } from "./use-location-hash.js";
import { useDeck } from "./use-deck.js";

const styles = css`
  color: white;
  font-family: sans-serif;
  height: 100%;
  overflow: hidden;
  width: 100%;
`;

export const App = virtual(() => {
  const state = useDeck();
  const slug = state.lastLoadingSlug;
  const json = state.lastLoadedSlug
      && state.bySlug[state.lastLoadedSlug].json
  console.log('slug', slug);
  const { width, height } = useViewport();
  const { value: zoomed, on: zoom, reset: unzoom } = useComposeActiveState(
    "ZOOM", slug
  );

  useEffect(() => {
    zoom(slug);
  }, [zoom, slug]);

  const decks = json?.nodes ?? [];
  const decksWithClusters = useMemo(() => {
    return decks.filter(deck => deck.cluster);
  }, [decks]);
  const bySlug = useMemo(
    () =>
      decksWithClusters.reduce((bySlug, deck) => {
        bySlug[deck.slug] = deck;
        return bySlug;
      }, {}),
    [decksWithClusters]
  );
  const dataWithClusters = { ...json, nodes: decksWithClusters };
  return html`
    <div
      style="
        --viewport-width: ${width};
        --viewport-height: ${height};
      "
      class="${styles}"
    >
      ${Hud({ width, height, data: dataWithClusters, bySlug, zoomed })}
      ${state.lastLoadedSlug ? Svg({ width, height, data: dataWithClusters, zoomed, zoom, unzoom, bySlug }) : '' }
    </div>
  `;
});
