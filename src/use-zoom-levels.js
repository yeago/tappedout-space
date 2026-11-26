import { useEffect } from "./packages.js";
import { useLocationHashQueryParams } from "./use-location-hash.js";
import { defaultSlug, fetchDeck } from "./fetch-deck.js";

// zoom: [0, 1, 2, 3, 4, 5]

const MAX = 5;
const MIN = 1;
const DEFAULT_ZOOM_LEVEL = 5;
const initialState = 0;


export const clamp = (value, min, max) => {
  const lowerLimitApplied = Math.max(value, min);
  const upperLimitApplied = Math.min(lowerLimitApplied, max);
  return upperLimitApplied;
};

export const getZoomLevel = queryParams => {
  const zoomLevelQueryParam = queryParams.get('zoom');
  if (zoomLevelQueryParam) {
    const parsed = Number(zoomLevelQueryParam);
    return clamp(parsed, MIN, MAX);
  }
  return DEFAULT_ZOOM_LEVEL;
};

// A trackpad swipe fires dozens of wheel events; a mouse notch fires one. Step the zoom
// when a new gesture starts (a pause between events), and at most every STEP_MS during
// a long one, so a single swipe doesn't run straight to the min or max zoom.
const GESTURE_GAP_MS = 200;
const STEP_MS = 400;
let lastWheelAt = 0;
let lastStepAt = 0;
const shouldStep = (now) => {
  const newGesture = now - lastWheelAt > GESTURE_GAP_MS;
  lastWheelAt = now;
  if (newGesture || now - lastStepAt > STEP_MS) {
    lastStepAt = now;
    return true;
  }
  return false;
};

export const useZoomLevels = () => {
  const { queryParams, updateQueryParams } = useLocationHashQueryParams();
  //const [state, dispatch] = useReducer(reducer, initialState);
  const zoomLevel = getZoomLevel(queryParams);

  const handleDelta = (delta) => {
    const nextZoom = clamp(zoomLevel + delta, MIN, MAX);
    if (getZoomLevel(queryParams) !== nextZoom) {
      updateQueryParams({ zoom: nextZoom });
    }
  };

  useEffect(() => {
    const handleWheel = e => {
      const delta = Math.sign(e.deltaY);  // -1 or 1; 0 for a sideways scroll
      if (delta && shouldStep(Date.now())) handleDelta(delta);
    };
    window.addEventListener("wheel", handleWheel);
    return () => {
      window.removeEventListener("wheel", handleWheel);
    };

  }, [handleDelta]);
  return zoomLevel;
};
