import * as culoriImported from "https://cdn.skypack.dev/culori";
export const culori = culoriImported;

const okhslConverter = culoriImported.converter("okhsl");
export function setTextClass(element, color) {
  // Jank - clamp saturation to prevent NAN for black.
  const clampSat = { ...okhslConverter(color), s: 0 };
  const differenceWhite = culoriImported.wcagContrast(clampSat, "white");
  const differenceBlack = culoriImported.wcagContrast(clampSat, "black");
  // Jank - bias towards white at the midpoint.
  if (differenceWhite + 1 > differenceBlack) {
    element.classList.add("text-white");
    element.classList.remove("text-black");
  } else {
    element.classList.add("text-black");
    element.classList.remove("text-white");
  }
}
