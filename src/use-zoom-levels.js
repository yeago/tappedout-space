import { useEffect } from "./packages.js";
import { useLocationHashQueryParams } from "./use-location-hash.js";
import { defaultSlug, fetchDeck } from "./fetch-deck.js";

// zoom: [0, 1, 2, 3, 4, 5]

const MAX = 5;
const MIN = 1;
const DEFAULT_ZOOM_LEVEL = 5;
const initialState = 0;


const clamp = (value, min, max) => {
  const lowerLimitApplied = Math.max(value, min);
  const upperLimitApplied = Math.min(lowerLimitApplied, max);
  return upperLimitApplied;
};

const getZoomLevel = queryParams => {
  const zoomLevelQueryParam = queryParams.get('zoom');
  if (zoomLevelQueryParam) {
    const parsed = Number(zoomLevelQueryParam);
    return clamp(parsed, MIN, MAX);
  }
  return DEFAULT_ZOOM_LEVEL;
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
      const delta = Math.sign(e.deltaY);
      // console.log(delta);// delta is either -1 or 1
      handleDelta(delta);
    };
    window.addEventListener("wheel", handleWheel);
    return () => {
      window.removeEventListener("wheel", handleWheel);
    };

  }, [handleDelta]);
  return zoomLevel;
};
