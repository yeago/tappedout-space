console.log("index");
import { App } from "./src/app.js";
import { render } from "./src/packages.js";

(async () => {
  const { data } = await import("./data.js");
  render(
    App({}),
    document.getElementById("root")
  );
})();

//setTimeout(() => { window.location.reload(); }, 10500);
