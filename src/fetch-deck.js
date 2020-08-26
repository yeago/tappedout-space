export const defaultSlug = window.django.deckSlug;

export const fetchDeck = async (slug = defaultSlug) => {
  const params = window.location.hostname === 'localhost' ? '?token=deleteme99' : '';
  const url = `https://tappedout.net/api/decks/${slug}/space/${params}`;
  const response = await fetch(url, {
    headers: {
      Accept: "application/json, text/plain, */*"
    }
  });
  const json = await response.json();
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
