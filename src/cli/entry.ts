import { measureCharWidths } from "../client/measure-char-widths.js";

declare global {
  interface Window {
    __prefont: {
      measureCharWidths: typeof measureCharWidths;
    };
  }
}

window.__prefont = { measureCharWidths };
