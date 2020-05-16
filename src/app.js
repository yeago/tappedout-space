import {
  html,
  svg,
  useReducer,
  virtual,
  useCallback,
  useEffect,
  css,
} from "./packages.js";
import { useViewport } from "./use-viewport.js";
import { Svg } from "./svg.js";
import { Hud } from "./hud.js";

const styles = css`
  color: white;
  font-family: sans-serif;
  height: 100%;
  overflow: hidden;
  width: 100%;
`;

export const App = virtual(({ data }) => {
  const { width, height } = useViewport();
  return html`
    <div
      style="
        --viewport-width: ${width};
        --viewport-height: ${height};
      "
      class="${styles}"
    >
      ${Hud({ width, height, data })} ${Svg({ width, height, data })}
    </div>
  `;
});
