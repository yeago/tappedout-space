import { useEffect, useState, useCallback } from './packages.js';

export const useLocationHash = () => {
  const [hash, setHash] = useState(window.location.hash);
  const onChange = useCallback((e) => {
    setHash(window.location.hash);
  }, [setHash]);
  useEffect(() => {
    window.addEventListener("hashchange", onChange, false);
    return () => {
      window.removeEventListener("hashchange", onChange, false);
    };
  }, [onChange]);
  return hash;
};
