import { references } from "./reference-colors.js";
import { roundTo } from "./math-functions.js";
import { culori } from "./external.js";

const okhslConverter = culori.converter("okhsl");
const okhsvConverter = culori.converter("okhsv");
const oklchConverter = culori.converter("oklch");

window.addEventListener("load", () => {
  initPreview();
  initPalette();
  // initColorStops();
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
    mode: "okhsl",
  };
  const hex = culori.formatHex(color);
  hslBox.style.background = hex;
  hslBox.innerText = hex;
  setTextClass(hslBox, color);
}

const stopCount = 12;
const tintTargets = [50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950];
const degPerStop = 360 / stopCount;
const stopTargets = Array.from(Array(stopCount)).map(
  (_, index) => degPerStop * index
);

const palette = document.querySelector(".palette");
function initPalette() {
  for (let tintIndex = 0; tintIndex < tintTargets.length; tintIndex++) {
    const tint = tintTargets[tintIndex];

    const labelEl = document.createElement("div");
    labelEl.classList.add("palette-label");
    labelEl.innerText = tint;
    palette.appendChild(labelEl);

    for (let stopIndex = 0; stopIndex < stopCount; stopIndex++) {
      const itemEl = document.createElement("div");
      itemEl.classList.add("palette-item");
      palette.appendChild(itemEl);
    }
  }

  bindSliders("change", updatePalette);
}

function updatePalette(hue, saturation) {
  const paletteItems = document.querySelectorAll(".palette-item");
  for (let tintIndex = 0; tintIndex < tintTargets.length; tintIndex++) {
    const tint = tintTargets[tintIndex];

    for (let stopIndex = 0; stopIndex < stopCount; stopIndex++) {
      const stop = stopTargets[stopIndex];

      const paletteItem = paletteItems.item(tintIndex * stopCount + stopIndex);

      const color = {
        h: hue + stop,
        s: saturation / 100,
        l: tint / 1000,
        mode: "okhsl",
      };
      const hex = culori.formatHex(color);
      paletteItem.style.background = hex;
      paletteItem.innerHTML = hex;
      setTextClass(paletteItem, color);
    }
  }
}

function setTextClass(element, color) {
  // Jank - clamp saturation to prevent NAN for black.
  const clampSat = { ...okhslConverter(color), s: 0 };
  const differenceWhite = culori.wcagContrast(clampSat, "white");
  const differenceBlack = culori.wcagContrast(clampSat, "black");
  // Jank - bias towards white at the midpoint.
  if (differenceWhite + 1 > differenceBlack) {
    element.classList.add("text-white");
    element.classList.remove("text-black");
  } else {
    element.classList.add("text-black");
    element.classList.remove("text-white");
  }
}

function initReferenceTable() {
  references.map(stampReferenceTableRow);
  stampFilterButton("all");
  stampFilterButton("100");
  stampFilterButton("500");
  stampFilterButton("900");
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
  return cell;
}

function stampReferenceTableRow(color) {
  const { set, name, tint, hex, parsed } = color;

  const row = document.createElement("tr");
  if (tint) {
    row.classList.add(`reference-tint-${tint}`);
  }
  referenceTableRows.appendChild(row);

  const preview = stampReferenceTableCell(
    row,
    { backgroundColor: hex, fontFamily: "monospace" },
    hex
  );
  setTextClass(preview, parsed);

  stampReferenceTableCell(row, {}, set);
  stampReferenceTableCell(row, {}, name);
  stampReferenceTableCell(row, { textAlign: "right" }, tint);

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

const referenceFilters = document.querySelector(".reference-filters");
function stampFilterButton(filter) {
  const button = document.createElement("button");
  button.innerText = `Filter to ${filter}`;
  referenceFilters.appendChild(button);

  button.addEventListener("click", () => {
    Array.from(referenceTableRows.classList.values())
      .filter((className) => className.startsWith("filter"))
      .forEach((className) => referenceTableRows.classList.remove(className));
    referenceTableRows.classList.add(`filter-${filter}`);
  });
}
