import { references } from "./reference-colors.js";
import { roundTo } from "./math-functions.js";
import { culori } from "./external.js";

const okhslConverter = culori.converter("okhsl");
const okhsvConverter = culori.converter("okhsv");
const oklchConverter = culori.converter("oklch");

window.addEventListener("load", () => {
  initPreview();
  initColorStops();
  initReferenceTable();
});

function bindSliders(event, handler) {
  const hueField = document.forms[0].elements.hue;
  const saturationField = document.forms[0].elements.saturation;

  const wrapped = function () {
    let hue = parseInt(hueField.value);
    let saturation = parseInt(saturationField.value);
    handler(hue, saturation);
  };

  hueField.addEventListener(event, wrapped);
  saturationField.addEventListener(event, wrapped);
  wrapped();
}

function initPreview() {
  bindSliders("input", updateColorPreview);
}

const hslBox = document.querySelector(".color-preview");
function updateColorPreview(hue, saturation) {
  const color = {
    h: hue,
    s: saturation / 100,
    l: 0.5,
    mode: "hsl",
  };
  const hex = culori.formatHex(color);
  hslBox.style.background = hex;
  hslBox.innerText = hex;
  setTextClass(hslBox, color);
}

const colorStopsEl = document.querySelector(".color-stops");
const colorTintsList = [];
const stopCount = 12;
const tintTargets = [50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950];
const degPerStop = 360 / stopCount;
function initColorStops() {
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
  bindSliders("change", updateColorStops);
}

function setTextClass(element, color) {
  const differenceWhite = culori.wcagContrast(color, "white");
  const differenceBlack = culori.wcagContrast(color, "black");
  if (differenceWhite > differenceBlack) {
    element.classList.add("text-white");
    element.classList.remove("text-black");
  } else {
    element.classList.add("text-black");
    element.classList.remove("text-white");
  }
}

function updateColorStops(hue, saturation) {
  let nextHue = hue;
  for (let i = 0; i < stopCount; i++) {
    const tintEls = colorTintsList[i];
    for (let j = 0; j < tintTargets.length; j++) {
      const tintEl = tintEls[j];
      const targetTint = tintTargets[j];
      const color = {
        h: nextHue,
        s: saturation / 100,
        l: targetTint / 1000,
        mode: "okhsl",
      };
      const hex = culori.formatHex(color);
      tintEl.style.background = hex;
      tintEl.innerHTML = hex;
      setTextClass(tintEl, color);
    }
    nextHue = (nextHue + degPerStop) % 360;
  }
}

function initReferenceTable() {
  references.filter(({ tint }) => tint == 500).map(stampReferenceTableRow);
}

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
