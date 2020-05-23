export const defaultSlug = `16-05-20-black-zombie`;

export const fetchDeck = async (slug = defaultSlug) => {
  const url = `https://tappedout.net/api/decks/${defaultSlug}/space?token=deleteme99`;
  const response = await fetch(url, {
    headers: {
      Accept: "application/json, text/plain, */*"
    }
  });
  const json = await response.json();
  return json;
};
