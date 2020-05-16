import { useReducer, useEffect, useState, useCallback } from "./packages.js";

const getCurrentValue = s => s.currentValue;

let frameCount = 0;

export const useSprings = springs => {
  const [syncedValues, dispatch] = useReducer(function reducer(state, action) {
    if (action.type === "SYNC") {
      const isDifferent = action.values.some((value, i) => {
        return value !== state[i];
      });
      if (isDifferent) {
        return action.values;
      }
    }
    return state;
  }, springs.map(getCurrentValue));

  const sync = useCallback(
    values => {
      return dispatch({ type: "SYNC", values });
    },
    [dispatch]
  );

  const [isOn, setIsOn] = useState(false);
  useEffect(() => {
    const anyAreAnimating = () => springs.some(s => s.isAnimating);
    for (let s of springs) {
      s.onUpdate(_s => {
        setIsOn(anyAreAnimating());
      });
      s.onStop(_s => {
        if (!anyAreAnimating()) setIsOn(false);
      });
    }
  }, [springs]);
  useEffect(() => {
    const anyAreAnimating = () => springs.some(s => s.isAnimating);
    const syncNextFrame = () => {
      requestAnimationFrame(() => {
        frameCount += 1;
        const values = springs.map(getCurrentValue);
        sync(values);
        if (anyAreAnimating()) syncNextFrame();
      });
    };
    if (isOn) syncNextFrame();
  }, [sync, springs, isOn]);
  return syncedValues;
};

// on animation frame
//   for each spring
//     stage value
//   emit values
