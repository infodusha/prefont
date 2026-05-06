import data from "./prefont.json" with { type: "json" };
import {
  measureText,
  measureTextAllWeights,
  measureTextFromData,
} from "prefont";

const text = "1.234";
const fontSize = 16;
const common = { family: "Inter", browser: "chromium", text, fontSize };

console.log(
  "from data (400):",
  measureTextFromData(data, { ...common, weight: 400 }),
);
console.log("all weights:", measureTextAllWeights(data, common));
console.log("dynamic @16px:", measureText({ ...common, weight: 400, data }));
