import {
  html,
  svg,
  useReducer,
  virtual,
  useCallback,
  useEffect,
  css
} from "./packages.js";
import { useViewport } from './use-viewport.js';
import { Svg } from './svg.js';
import { Hud } from './hud.js';

export const App = virtual(() => {
  const { width, height } = useViewport();
  return html`
    <div
      class="${css`
        --viewport-width: ${width};
        --viewport-height: ${height};
        color: white;
        font-family: sans-serif;
      `}"
    >
      ${Hud({ width, height })}
      ${Svg({ width, height })}
    </div>
  `;
});
