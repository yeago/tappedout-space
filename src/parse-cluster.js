export const parseCluster = cluster => {
  const [W, U, B, R, G] = cluster
    .split("-")
    .map(n => n === "0" ? 0 : Number(n) / 100);
  const test = value => {
    if (typeof value === 'string') {
      throw new Error(`Not a number: ${value}`);
    }
  };
  test(W);
  test(U);
  test(B);
  test(R);
  test(G);
  return { B, G, R, U, W };
};
