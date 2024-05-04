import * as culori from "https://cdn.skypack.dev/culori";

console.log(culori);

import {
  hslToRgb,
  rgbToYiq,
  hspToRgb,
  rgbToHsl,
  rgbToHsp,
  hexToRgb,
} from "./color-functions.js";
import {
  tailwindColors,
  materialDesignColors,
  bootstrapColors,
  lospecPalettes,
} from "./reference-colors.js";
import { roundTo } from "./math-functions.js";

function initSliders(onInput, onChange) {
  const hueField = document.forms[0].elements.hue;
  const saturationField = document.forms[0].elements.saturation;

  function wrapHandler(handler) {
    return function () {
      let hue = parseInt(hueField.value);
      let saturation = parseInt(saturationField.value);
      handler(hue, saturation);
    };
  }

  const onInputWrapped = wrapHandler(onInput);
  const onChangeWrapped = wrapHandler(onChange);

  hueField.addEventListener("input", onInputWrapped);
  saturationField.addEventListener("input", onInputWrapped);
  onInputWrapped();

  hueField.addEventListener("change", onChangeWrapped);
  saturationField.addEventListener("change", onChangeWrapped);
  onChangeWrapped();
}

window.addEventListener("load", () => {
  const hslBox = document.querySelector(".color-preview");
  const hslLabels = hslBox.querySelectorAll(".text-white, .text-black");

  const updateFastPreview = (hue, saturation) => {
    let lightness = 50;
    const color = `hsl(${hue}deg ${saturation}% ${lightness}%)`;
    const [r, g, b] = hslToRgb(hue / 360, saturation / 100, lightness / 100);
    const y = rgbToYiq(r, g, b);
    const message = `${color} rgb(${r} ${g} ${b}) ${Math.round(
      (y / 255) * 1000
    )}`;
    hslBox.style.background = color;
    hslLabels.forEach((element) => (element.textContent = message));
  };

  const colorStopsEl = document.querySelector(".color-stops");
  const colorTintsList = [];
  const stopCount = 12;
  const tintTargets = [50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950];
  const degPerStop = 360 / stopCount;

  for (let i = 0; i < stopCount; i++) {
    const stopEl = document.createElement("div");
    stopEl.classList.add("color-stop");
    colorStopsEl.appendChild(stopEl);
    const tints = [];
    for (let j = 0; j < tintTargets.length; j++) {
      const tintEl = document.createElement("div");
      tintEl.classList.add("color-tint");
      stopEl.appendChild(tintEl);
      tints.push(tintEl);
    }
    colorTintsList.push(tints);
  }

  const updateColorsPreview = (hue, saturation) => {
    let nextHue = hue;
    for (let i = 0; i < stopCount; i++) {
      const tintEls = colorTintsList[i];
      for (let j = 0; j < tintTargets.length; j++) {
        const tintEl = tintEls[j];
        const targetTint = tintTargets[j];
        const [r, g, b] = hspToRgb(
          nextHue / 360,
          saturation / 100,
          targetTint / 1000
        );
        const [h, s, p] = rgbToHsp(r, g, b);
        const clampedR = Math.round(r * 255);
        const clampedG = Math.round(g * 255);
        const clampedB = Math.round(b * 255);
        const rbg = `rgb(${clampedR} ${clampedG} ${clampedB})`;
        tintEl.style.background = rbg;
        // tintEl.textContent = `hsl(${nextHue}deg ${saturation}% ${lightness}%) ${scaledY}`;
        tintEl.innerHTML = `in(${roundTo(nextHue / 360, 2)} ${roundTo(
          saturation / 100,
          2
        )} ${roundTo(targetTint / 1000, 2)})<br/>out(${roundTo(h, 2)} ${roundTo(
          s,
          2
        )} ${roundTo(p, 2)})<br/>${rbg}`;
        if (targetTint > 500) {
          tintEl.classList.remove("text-white");
          tintEl.classList.add("text-black");
        } else {
          tintEl.classList.remove("text-black");
          tintEl.classList.add("text-white");
        }
      }
      nextHue = (nextHue + degPerStop) % 360;
    }
  };

  initSliders(updateFastPreview, updateColorsPreview);

  []
    .concat(
      Object.entries(tailwindColors).map(([name, hex]) => {
        const parts = name.split("-");
        const tint = parts.length > 1 ? parts[parts.length - 1] : "";
        const nameParts = parts.length > 1 ? parts.slice(0, -1) : parts;
        return { set: "Tailwind", name: nameParts.join(" "), tint, hex };
      })
    )
    .concat(
      Object.entries(materialDesignColors).map(([name, hex]) => {
        const parts = name.split("-");
        const tint = parts.length > 1 ? parts[parts.length - 1] : "";
        const nameParts = parts.length > 1 ? parts.slice(0, -1) : parts;
        return { set: "Material", name: nameParts.join(" "), tint, hex };
      })
    )
    .concat(
      Object.entries(bootstrapColors).map(([name, hex]) => {
        const parts = name.split("-");
        const tint = parts.length > 1 ? parts[parts.length - 1] : "";
        const nameParts = parts.length > 1 ? parts.slice(0, -1) : parts;
        return { set: "Bootstrap", name: nameParts.join(" "), tint, hex };
      })
    )
    .concat(
      Object.entries(lospecPalettes).flatMap(([palette, colors]) => {
        return colors.map((hex, index) => {
          return {
            set: palette,
            name: `Color ${index}`,
            tint: "",
            hex,
          };
        });
      })
    )
    // .filter(({ tint }) => tint == 900)
    .map(({ set, name, tint, hex }) =>
      stampReferenceTableRow(set, name, tint, hex.toLowerCase())
    );
});

const referenceTableRows = document.querySelector(".reference-table-rows");
function stampReferenceTableCell(row, style, content) {
  const cell = document.createElement("td");
  Object.entries(style).forEach(([key, value]) => {
    cell.style[key] = value;
  });
  if (typeof content === "string" || typeof content === "number") {
    cell.innerText = content;
  }
  row.appendChild(cell);
}
function stampReferenceTableRow(set, name, tint, hex) {
  const row = document.createElement("tr");
  referenceTableRows.appendChild(row);

  stampReferenceTableCell(row, { backgroundColor: hex });
  stampReferenceTableCell(row, {}, set);
  stampReferenceTableCell(row, {}, name);
  stampReferenceTableCell(row, { textAlign: "right" }, tint);
  stampReferenceTableCell(row, { fontFamily: "monospace" }, hex);

  const { r, g, b } = hexToRgb(hex);
  const [h, s, l] = rgbToHsl(r, g, b);

  stampReferenceTableCell(row, {}, roundTo(h, 2));
  stampReferenceTableCell(row, {}, roundTo(s, 2));
  stampReferenceTableCell(row, {}, roundTo(l, 2));

  const [hAlt, sAlt, p] = rgbToHsp(r, g, b);

  stampReferenceTableCell(row, {}, roundTo(hAlt, 2));
  stampReferenceTableCell(row, {}, roundTo(sAlt, 2));
  stampReferenceTableCell(row, {}, roundTo(p / 255, 2));
}
