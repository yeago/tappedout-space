import {
  useReducer,
  useCallback,
  useEffect,
} from "./packages.js";


const viewportReducer = (state, { type, width, height }) => {
  if (type === "UPDATE") return { ...state, width, height };
  return state;
};

const measure = () => {
  return { width: window.innerWidth, height: window.innerHeight };
};

const initialState = measure();

export const useViewport = (initialWidth, initialHeight) => {
  const [state, dispatch] = useReducer(viewportReducer, initialState);
  const update = useCallback(() => {
    dispatch({
      type: "UPDATE",
      ...measure()
    });
  }, [dispatch]);
  useEffect(() => {
    window.addEventListener("resize", update);
    return () => {
      window.removeEventListener("resize", update);
    };
  });
  return state;
};
