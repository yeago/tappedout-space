import { svg } from "./packages.js";

import { parseCluster } from "./parse-cluster.js";

const add = (a, b) => a + b;

const sum = (...values) => {
  return values.reduce(add, 0);
};

const Slice = ({
  percentage,
  color,
  cx,
  cy,
  deck,
  circumference,
  highlighted,
  rotate
}) => {
  return svg`
    <circle
      cx="${cx}"
      cy="${cy}"
      class="slice"
      data-slug="${deck.slug}"
      id="deck-${deck.slug}-${color}"
      data-highlighted=${highlighted}
      style="
        stroke: ${color};
        stroke-dasharray: ${percentage * circumference} var(--circumference);
      "
      transform="rotate(${rotate},${cx},${cy})"
    />
  `;
};

export const Pie = ({ deck, cx, cy, highlighted, r, circumference }) => {
  const cluster = parseCluster(deck.cluster);
  const slice = ({ percentage, color, rotate }) => {
    if (percentage === 0) return "";
    return Slice({
      deck,
      cx,
      cy,
      highlighted,
      r,
      circumference,
      percentage,
      color,
      rotate
    });
  };
  const slices = [
    { percentage: cluster.B, color: "black" },
    { percentage: cluster.U, color: "blue" },
    { percentage: cluster.W, color: "white" },
    { percentage: cluster.G, color: "green" },
    { percentage: cluster.R, color: "red" }
  ];
  return svg`
    <g>
      <circle
        cx="${cx}"
        cy="${cy}"
        class="deck"
        data-slug="${deck.slug}"
        id="deck-${deck.slug}"
        data-highlighted=${highlighted}
        style="
          xstroke: black;
          xstroke-dasharray: ${cluster.B * circumference} var(--circumference);
        "
      />
      ${slices.map((props, index) => {
        const totalPercentages = sum(
          ...slices.slice(0, index + 1).map(p => p.percentage)
        );
        return slice({ ...props, rotate: totalPercentages * 360 });
      })}
    </g>
  `;
};
