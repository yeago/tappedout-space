import { useEffect, useState } from './packages.js';
import { useLocationHash } from "./use-location-hash.js";
import { defaultSlug, fetchDeck } from "./fetch-deck.js";

const initialState = {
  nodes: []
};

export const useDeck = (slug) => {
  const hash = useLocationHash();
  const [data, setData] = useState(initialState);
  useEffect(async () => {
    if (!hash) window.location.hash = defaultSlug;
    if (hash) {
      console.log('hash', hash);
      const slug = hash.replace('#', '');
      console.log('slug', slug);
      const json = await fetchDeck(slug);
      setData(json);
    }
  }, [hash]);
  return data;
};
