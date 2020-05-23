console.time('load');
import { App } from "./src/app.js";
import { render } from "./src/packages.js";
import { fetchDeck } from "./src/fetch-deck.js";
console.log('fetchDeck', fetchDeck);
import { data } from "./data.js"; // 250 cards
//import { data } from "./data-2.js"; // 500 cards
console.timeEnd('load');
console.log('data', data);
console.log(data.nodes.map(d => d.mana_colors));
console.time('render');
render(
  App({ data }),
  document.getElementById("root")
);
console.timeEnd('render');

//fetchDeck();

//setTimeout(() => { window.location.reload(); }, 10500);
