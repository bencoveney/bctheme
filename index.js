import { hslToRgb, hspToRgb, rgbToHsp } from "./color-functions.js";
import { references } from "./reference-colors.js";
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
    const message = `${color} rgb(${r} ${g} ${b})`;
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

  references.filter(({ tint }) => tint == 500).map(stampReferenceTableRow);
});

const referenceTableRows = document.querySelector(".reference-table-rows");
function stampReferenceTableCell(row, style, content) {
  const cell = document.createElement("td");
  Object.entries(style).forEach(([key, value]) => {
    cell.style[key] = value;
  });
  if (typeof content === "string") {
    cell.innerText = content;
  } else if (typeof content === "number") {
    cell.innerText = roundTo(content, 2);
  } else if (typeof content === "undefined") {
    cell.innerText = "-";
  }
  row.appendChild(cell);
}

import { culori } from "./external.js";
const okhslConverter = culori.converter("okhsl");
const okhsvConverter = culori.converter("okhsv");
const oklchConverter = culori.converter("oklch");
function stampReferenceTableRow(color) {
  const { set, name, tint, hex, parsed } = color;

  const row = document.createElement("tr");
  referenceTableRows.appendChild(row);

  stampReferenceTableCell(row, { backgroundColor: hex }, "");
  stampReferenceTableCell(row, {}, set);
  stampReferenceTableCell(row, {}, name);
  stampReferenceTableCell(row, { textAlign: "right" }, tint);
  stampReferenceTableCell(row, { fontFamily: "monospace" }, hex);

  const okhsl = okhslConverter(parsed);

  stampReferenceTableCell(row, {}, okhsl.h);
  stampReferenceTableCell(row, {}, okhsl.s);
  stampReferenceTableCell(row, {}, okhsl.l);

  const okhsv = okhsvConverter(parsed);

  stampReferenceTableCell(row, {}, okhsv.s);
  stampReferenceTableCell(row, {}, okhsv.v);

  const oklch = oklchConverter(parsed);

  stampReferenceTableCell(row, {}, oklch.l);
  stampReferenceTableCell(row, {}, oklch.c);
}
