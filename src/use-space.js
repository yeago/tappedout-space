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
  error: null,
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
  const isPresent = action.slug in state.bySlug && !state.bySlug[action.slug].error;
  const bySlug = isPresent ? state.bySlug : {
    ...state.bySlug,
    [action.slug]: { loading: true, json: null, slug: action.slug },
  };
  return {
    ...state,
    loading: bySlug[action.slug].loading,
    lastLoadingSlug: action.slug,
    error: null,
    bySlug
  };
};

const failedReducer = (state, action) => {
  const isCurrent = state.lastLoadingSlug === action.slug;
  return {
    ...state,
    loading: isCurrent ? false : state.loading,
    error: isCurrent ? action.message : state.error,
    bySlug: {
      ...state.bySlug,
      [action.slug]: { loading: false, json: null, slug: action.slug, error: action.message }
    }
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
    case `failed`: {
      return failedReducer(state, action);
    }
  }
  return state;
};

export const useSpace = () => {
  const hash = useLocationHash();
  const [state, dispatch] = useReducer(reducer, initialState);
  // The hash also carries view settings (e.g. "#my-deck?zoom=3"), and every zoom step
  // rewrites it. Only a different deck needs a fetch, so depend on the slug alone.
  const slug = hash ? hash.replace("#", "").split("?")[0] : "";
  useEffect(async () => {
    if (!slug) {
      window.location.hash = defaultSlug;
      return;
    }
    dispatch({ type: "load", slug });
    try {
      const json = await fetchDeck(slug);
      dispatch({ type: "loaded", json, slug });
    } catch (e) {
      dispatch({ type: "failed", message: e.message, slug });
    }
  }, [slug]);
  return state;
};
