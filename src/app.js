import {
  html,
  svg,
  useReducer,
  virtual,
  useCallback,
  useEffect,
  useMemo,
  css,
} from "./packages.js";
import { useViewport } from "./use-viewport.js";
import { Svg } from "./svg.js";
import { Hud } from "./hud.js";
import { useComposeActiveState } from "./use-compose-active-state.js";
import { useLocationHash } from "./use-location-hash.js";
import { useSpace } from "./use-space.js";
import { useZoomLevels } from "./use-zoom-levels.js";
import { ZoomControls } from "./zoom-controls.js";
import { Status } from "./status.js";

const styles = css`
  position: relative;
  color: white;
  font-family: sans-serif;
  height: 100%;
  overflow: hidden;
  width: 100%;
`;

const EMPTY_ARRAY = [];

export const App = virtual(() => {
  const state = useSpace();
  const slug = state.lastLoadingSlug;
  const json = state.lastLoadedSlug && state.bySlug[state.lastLoadedSlug].json;
  const { width, height, insetLeft } = useViewport();
  const { value: focused, on: focus, reset: unfocus } = useComposeActiveState(
    "FOCUS",
    slug
  );
  const zoomLevel = useZoomLevels();

  useEffect(() => {
    focus(slug);
  }, [focus, slug]);

  const decks = json && json.nodes || EMPTY_ARRAY;

  const decksWithClusters = useMemo(() => {
    return decks.filter((deck) => deck.cluster);
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
      ${Hud({
        width,
        height,
        bySlug,
        focused,
        loading: state.loading,
        error: state.error,
        zoomLevel
      })}
      ${ZoomControls()}
      ${Status({
        loading: state.loading,
        error: state.error,
        retry: state.retry,
        hasMap: Boolean(state.lastLoadedSlug)
      })}
      ${state.lastLoadedSlug
        ? Svg({
            width,
            height,
            insetLeft,
            data: dataWithClusters,
            focused,
            focus,
            unfocus,
            bySlug,
            zoomLevel
          })
        : ""}
    </div>
  `;
});
