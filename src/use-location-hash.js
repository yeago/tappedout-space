import { useEffect, useState, useCallback, useMemo } from './packages.js';

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

export const useLocationHashQueryParams = () => {
  const hash = useLocationHash();
  const [head, hashParamString] = hash.split('?');
  return useMemo(() => {
    const queryParams = new URLSearchParams(hashParamString);
    const updateQueryParams = (newParams) => {
      const newQueryParams = new URLSearchParams(queryParams);
      Object.entries(newParams).forEach(([key, value]) => {
        if (value === null) {
          newQueryParams.delete(key);
        } else {
          newQueryParams.set(key, value);
        }
      });
      console.log('head', head);
      location.hash = head + '?' + newQueryParams;
    };
    return { queryParams, updateQueryParams };
  }, [hashParamString, head]);
};
