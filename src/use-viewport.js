import {
  useReducer,
  useCallback,
  useEffect,
} from "./packages.js";

// The page can reserve a strip on the left of the window (e.g. tappedout.net's 300x600 ad under the info
// card) so the map centres in the rest: set window.deckSpaceInsetLeft = <px> and dispatch a
// "deckspace:inset" event on window (and again with 0 when the strip goes away). width is the map's
// area (window width minus the inset); insetLeft is where that area starts.
const INSET_EVENT = "deckspace:inset";

const viewportReducer = (state, { type, width, height, insetLeft }) => {
  if (type === "UPDATE") return { ...state, width, height, insetLeft };
  return state;
};

const insetLeft = () => {
  const inset = Number(window.deckSpaceInsetLeft) || 0;
  // Never leave the map less than half the window.
  return Math.max(0, Math.min(Math.round(inset), Math.floor(window.innerWidth / 2)));
};

const measure = () => {
  const inset = insetLeft();
  return { width: window.innerWidth - inset, height: window.innerHeight, insetLeft: inset };
};

export const useViewport = (initialWidth, initialHeight) => {
  const [state, dispatch] = useReducer(viewportReducer, measure());
  const update = useCallback(() => {
    dispatch({
      type: "UPDATE",
      ...measure()
    });
  }, [dispatch]);
  useEffect(() => {
    window.addEventListener("resize", update);
    window.addEventListener(INSET_EVENT, update);
    return () => {
      window.removeEventListener("resize", update);
      window.removeEventListener(INSET_EVENT, update);
    };
  }, [update]);
  return state;
};
