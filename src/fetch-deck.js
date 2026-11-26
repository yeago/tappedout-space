export const defaultSlug = window.django.deckSlug;

export const fetchDeck = async (slug = defaultSlug) => {
  // Same-origin, so the visitor's login cookie goes along (on tappedout.net, staging or localhost).
  const url = `/api/decks/${slug}/space/`;
  const response = await fetch(url, {
    headers: {
      Accept: "application/json, text/plain, */*"
    }
  });
  // Errors come back as {"errors": {"space": "..."}} (503 while the recommender rests, 404
  // otherwise), or as an HTML page; never trust the body to be a graph.
  const json = await response.json().catch(() => null);
  if (!response.ok || !json || !Array.isArray(json.nodes)) {
    const message = json && json.errors && json.errors.space;
    throw new Error(message || "Couldn't load this deck's space. Please try again in a minute.");
  }
  // dedupe nodes. one deck per slug.
  const deduped = {
    ...json,
    nodes: Object.values(json.nodes.reduce((bySlug, node) => {
      const slug = node.slug;
      if (!bySlug[slug]) {
        bySlug[slug] = node;
      }
      return bySlug;
    }, {}))
  };
  return deduped;
};
