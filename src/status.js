import { html, css } from "./packages.js";

// Centred loading and error states for the stage. The first load takes a few seconds (mlrec
// lays out the neighbourhood), so a blank black stage needs a cue.
const overlay = css`
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  pointer-events: none;
  z-index: 2;
`;

// While a deck's neighbourhood loads, freeze the page: a slow reply otherwise looks like nothing
// is happening, and people click again and stack up requests. The overlay covers everything,
// sits above the zoom controls, and swallows clicks and wheel zooms until the data arrives.
const blocking = css`
  position: fixed;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  cursor: progress;
  background: rgba(5, 6, 12, .35);
  &.over-map {
    background: rgba(5, 6, 12, .6);
  }
`;

const swallow = (e) => {
  e.preventDefault();
  e.stopPropagation();
};

const loadingCss = css`
  display: grid;
  justify-items: center;
  gap: 14px;
  color: #c9cde8;
  font-size: 14px;
  letter-spacing: .04em;

  .planet {
    position: relative;
    width: 72px;
    height: 72px;
  }
  .core {
    position: absolute;
    inset: 22px;
    border-radius: 50%;
    background: radial-gradient(circle at 35% 35%, #b6adff, #5b4bd6 60%, #2a2370);
    box-shadow: 0 0 24px rgba(150, 140, 255, .55);
    animation: ds-pulse 2.4s ease-in-out infinite;
  }
  .orbit {
    position: absolute;
    inset: 0;
    border-radius: 50%;
    border: 1px solid rgba(200, 205, 255, .35);
    transform: rotateX(68deg) rotateZ(-20deg);
  }
  .moon {
    position: absolute;
    inset: 0;
    animation: ds-orbit 1.8s linear infinite;
  }
  .moon::after {
    content: "";
    position: absolute;
    top: 30px;
    left: -3px;
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background: #e8e9f2;
    box-shadow: 0 0 8px #e8e9f2;
  }
  @keyframes ds-orbit {
    from { transform: rotate(0deg) translateX(0); }
    to { transform: rotate(360deg); }
  }
  @keyframes ds-pulse {
    0%, 100% { transform: scale(1); }
    50% { transform: scale(1.08); }
  }
  @media (prefers-reduced-motion: reduce) {
    .core, .moon { animation: none; }
  }
`;

const errorCss = css`
  pointer-events: auto;
  max-width: min(420px, calc(100vw - 32px));
  padding: 18px 20px;
  border-radius: 12px;
  background: rgba(12, 14, 30, .9);
  border: 1px solid #3a3f78;
  color: #e8e9f2;
  text-align: center;
  font-size: 15px;
  line-height: 1.45;

  .title {
    font-weight: 600;
    font-size: 17px;
    margin-bottom: 6px;
  }
  .message {
    color: #b7bbdb;
    margin-bottom: 14px;
  }
  button {
    font: inherit;
    font-weight: 600;
    padding: 8px 18px;
    border-radius: 999px;
    border: 0;
    background: #8f83ff;
    color: #0c0e1e;
    cursor: pointer;
  }
  button:focus-visible {
    outline: 2px solid #e8e9f2;
    outline-offset: 2px;
  }
`;

export const Status = ({ loading, error, retry, hasMap }) => {
  if (error) {
    return html`
      <div class="${overlay}">
        <div class="${errorCss}" role="alert">
          <div class="title">Deck Space didn't load</div>
          <div class="message">${error}</div>
          <button type="button" @click=${retry}>Try again</button>
        </div>
      </div>
    `;
  }
  if (loading) {
    return html`
      <div class="${blocking} ${hasMap ? "over-map" : ""}" role="status" aria-live="polite" aria-busy="true"
        @click=${swallow} @dblclick=${swallow} @wheel=${swallow} @mousedown=${swallow} @touchstart=${swallow}>
        <div class="${loadingCss}">
          <div class="planet" aria-hidden="true">
            <div class="orbit"></div>
            <div class="core"></div>
            <div class="moon"></div>
          </div>
          <div>${hasMap ? "Moving to that deck…" : "Charting this deck's neighbourhood…"}</div>
        </div>
      </div>
    `;
  }
  return "";
};
