export const defaultSlug = window.django.deckSlug;

export const fetchDeck = async (slug = defaultSlug) => {
  //console.log('fetchDeck called with', slug);
  const url = `https://tappedout.net/api/decks/${slug}/space?token=deleteme99`;
  const response = await fetch(url, {
    headers: {
      Accept: "application/json, text/plain, */*"
    }
  });
  const json = await response.json();
  return json;
};
