import { useEffect, useState, useReducer } from "./packages.js";
import { useLocationHash } from "./use-location-hash.js";
import { defaultSlug, fetchDeck } from "./fetch-deck.js";

const initialState = {
  bySlug: {
    // { json, slug, loading }
  },
  lastLoadingSlug: location.hash.replace('#', ''),
  lastLoadedSlug: null,
  loading: false,
};

const loadingReducer = (state, action) => {
  const isFinishedLoading = state.lastLoadingSlug === action.slug;
  const loading = isFinishedLoading ? false : state.loading;
  const bySlugWithLatestDeck = {
    [action.slug]: { loading: false, json: action.json, slug: action.slug }
  };
  const bySlug = isFinishedLoading ? bySlugWithLatestDeck : { ...state.bySlug, ...bySlugWithLatestDeck };
  return {
    ...state,
    loading,
    lastLoadedSlug: action.slug,
    bySlug
  };
};

const loadReducer = (state, action) => {
  const isPresent = action.slug in state.bySlug;
  const bySlug = isPresent ? state.bySlug : {
    ...state.bySlug,
    [action.slug]: { loading: true, json: null, slug: action.slug },
  };
  return {
    ...state,
    loading: bySlug[action.slug].loading,
    lastLoadingSlug: action.slug,
    bySlug
  };
};

const reducer = (state, action) => {
  switch (action.type) {
    case `load`: {
      return loadReducer(state, action);
    }
    case `loaded`: {
      return loadingReducer(state, action);
    }
  }
  return state;
};

export const useSpace = () => {
  const hash = useLocationHash();
  const [state, dispatch] = useReducer(reducer, initialState);
  useEffect(async () => {
    if (!hash) window.location.hash = defaultSlug;
    if (hash) {
      const slug = hash.replace("#", "").split("?")[0];
      dispatch({ type: "load", slug });
      const json = await fetchDeck(slug);
      dispatch({ type: "loaded", json, slug });
    }
  }, [hash]);
  return state;
};
