import { svg } from "./packages.js";

export const Circle = ({ cx, cy, r, className }) => {
  return svg`<circle
    cx="${cx}"
    cy="${cy}"
    r="${r}"
    class="${className}"
  />`;
};
