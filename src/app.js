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

const styles = css`
  color: white;
  font-family: sans-serif;
  height: 100%;
  overflow: hidden;
  width: 100%;
`;

//let minX = 0, maxX = 0, minY = 0, maxY = 0;
let { minX, maxX, minY, maxY } = localStorage.getItem("bounds")
  ? JSON.parse(localStorage.getItem("bounds"))
  : { minX: 0, maxX: 0, minY: 0, maxY: 0 };
const detectBounds = (nodes) => {
  for (const node of nodes) {
    if (node.x < minX) minX = node.x;
    if (node.x > maxX) maxX = node.x;
    if (node.y < minY) minY = node.y;
    if (node.y > maxY) maxY = node.y;
  }
  const bounds = { minX, maxX, minY, maxY };
  localStorage.setItem("bounds", JSON.stringify(bounds));
};

const EMPTY_ARRAY = [];

export const App = virtual(() => {
  const state = useSpace();
  const slug = state.lastLoadingSlug;
  const json = state.lastLoadedSlug && state.bySlug[state.lastLoadedSlug].json;
  const { width, height } = useViewport();
  const { value: focused, on: focus, reset: unfocus } = useComposeActiveState(
    "FOCUS",
    slug
  );
  const zoomLevel = useZoomLevels();

  useEffect(() => {
    focus(slug);
  }, [focus, slug]);

  const decks = json && json.nodes || EMPTY_ARRAY;

  detectBounds(decks);

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
        zoomLevel
      })}
      ${ZoomControls()}
      ${state.lastLoadedSlug
        ? Svg({
            width,
            height,
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
