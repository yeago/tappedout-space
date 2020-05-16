import { useEffect, useState, Spring, useRef } from "./packages.js";

export const useSpring = (toValue = 100) => {
  const [value, setValue] = useState(toValue);
  const spring = useMemo(() => {
    const s = new Spring({
      fromValue: toValue,
      toValue,
      stiffness: 1000,
      damping: 500,
      mass: 3
    });
    s.onStart(s => console.log("spring started"));
    s.onUpdate(s => setValue(s.currentValue));
    s.start();
    return s;
  }, []);
  const update = useCallback(
    toValue => {
      spring.updateConfig({ fromValue: spring.currentValue, toValue });
      spring.start();
      return spring;
    },
    [spring]
  );
  return [value, update, spring];
};

const initialConfig = {
  fromValue: 0,
  toValue: 1,
  //stiffness: 1000,
  //damping: 500,
  //mass: 3
  stiffness: 120,
  damping: 14,
  mass: 1
};

export const useSpring2 = config => {
  const springRef = useRef();
  springRef.current =
    springRef.current || new Spring({ ...initialConfig, ...config });
  return springRef.current;
};
