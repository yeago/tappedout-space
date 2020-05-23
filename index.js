import { App } from "./src/app.js";
import { render } from "./src/packages.js";
//import { fetchDeck } from "./src/fetch-deck.js";
//import { data } from "./data.js"; // 250 cards
//import { data } from "./data-2.js"; // 500 cards
//console.log('data', data);
//console.log(data.nodes.map(d => d.mana_colors));
render(
  App(),
  document.getElementById("root")
);

//fetchDeck();

//setTimeout(() => { window.location.reload(); }, 10500);
