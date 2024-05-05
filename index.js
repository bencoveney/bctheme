import { references } from "./reference-colors.js";
import { roundTo, remap } from "./math-functions.js";
import { culori } from "./external.js";
import { buildPaletteDefinition, buildTintsDefinition } from "./config.js";

const okhslConverter = culori.converter("okhsl");
const okhsvConverter = culori.converter("okhsv");
const oklchConverter = culori.converter("oklch");

window.addEventListener("load", () => {
  initPreview();
  initPalette(document.querySelector(".palette"));
  initToggles();
  initReferenceTable();
});

function bindSliders(event, handler, saturationField) {
  const hueField = document.forms[0].elements.hue;

  const wrapped = function () {
    let hue = parseInt(hueField.value);
    let saturation = parseInt(saturationField.value);
    handler(hue, saturation);
  };

  hueField.addEventListener(event, wrapped);
  saturationField.addEventListener(event, wrapped);
  wrapped();
}

const vividInput = document.forms[0].elements["saturation-vivid"];
const mutedInput = document.forms[0].elements["saturation-muted"];
const tintInput = document.forms[0].elements["tint-smoothing"];
function initPreview() {
  Object.values(document.forms[0].elements).forEach((input) => {
    const preview = document.querySelector(`.${input.name}-preview`);
    function setValue() {
      preview.innerText = `${input.value}${input.dataset.unit}`;
    }
    input.addEventListener("input", setValue);
    setValue();
  });
  bindSliders("input", updateVividPreview, vividInput);
  bindSliders("input", updateMutedPreview, mutedInput);
  bindSliders("input", updateTintPreview, tintInput);
}

const vividPreview = document.querySelector(".color-preview-vivid");
function updateVividPreview(hue, saturation) {
  const color = {
    h: hue,
    s: saturation / 100,
    l: 0.5,
    mode: "okhsl",
  };
  const hex = culori.formatHex(color);
  vividPreview.style.background = hex;
  vividPreview.innerText = hex;
  setTextClass(vividPreview, color);
}

const mutedPreview = document.querySelector(".color-preview-muted");
function updateMutedPreview(hue, saturation) {
  const color = {
    h: hue,
    s: saturation / 100,
    l: 0.5,
    mode: "okhsl",
  };
  const hex = culori.formatHex(color);
  mutedPreview.style.background = hex;
  mutedPreview.innerText = hex;
  setTextClass(mutedPreview, color);
}

let gradient;
function getGradient(width, height) {
  if (gradient) {
    return gradient;
  }

  gradient = new OffscreenCanvas(width, height);
  const context = gradient.getContext("2d");

  for (let i = 0; i < height; i++) {
    const l = remap(0, height, 1, 0, i);
    const color = {
      h: 0,
      s: 0,
      l: l,
      mode: "okhsl",
    };
    const hex = culori.formatHex(color);
    context.beginPath();
    context.rect(0, i, width, 1);
    context.fillStyle = hex;
    context.fill();
    context.closePath();
  }

  return gradient;
}

const tintPreview = document.querySelector(".tint-preview");
function updateTintPreview(_, smoothing) {
  const context = tintPreview.getContext("2d");
  const rawWidth = tintPreview.clientWidth;
  const rawHeight = tintPreview.clientHeight;

  const scale = window.devicePixelRatio;
  const width = Math.floor(rawWidth * scale);
  const height = Math.floor(rawHeight * scale);

  tintPreview.width = width;
  tintPreview.height = height;

  const tints = buildTintsDefinition(smoothing);

  context.drawImage(getGradient(width, height), 0, 0, width, height);
  context.strokeStyle = "red";
  context.lineWidth = scale;
  context.beginPath();
  context.moveTo(width, 0);
  for (let i = 0; i < tints.tintCount; i++) {
    const tint = tints.tints[i];
    const x = remap(0, 1000, width, 0, tint.luminanceRaw);
    const y = remap(0, 1000, 0, height, tint.luminanceAdjusted);
    context.moveTo(x, y);
    context.lineTo(x, height);
    // context.lineTo(x, y);
  }
  context.lineTo(0, height);
  context.stroke();
}

function buildPalette() {
  const hue = parseInt(document.forms[0].elements.hue.value);
  const saturationVivid = parseInt(
    document.forms[0].elements["saturation-vivid"].value
  );
  const saturationMuted = parseInt(
    document.forms[0].elements["saturation-muted"].value
  );
  const tintSmoothing = parseInt(
    document.forms[0].elements["tint-smoothing"].value
  );

  const paletteDefinition = buildPaletteDefinition(
    hue,
    saturationVivid,
    saturationMuted,
    buildTintsDefinition(tintSmoothing)
  );

  return paletteDefinition;
}

function initPalette(element) {
  let palette = buildPalette();
  element.style.gridTemplateColumns = `min-content repeat(${palette.colors.length}, 1fr)`;

  const emptyEl = document.createElement("div");
  emptyEl.classList.add("palette-label");
  element.appendChild(emptyEl);

  for (let stopIndex = 0; stopIndex < palette.colorCount; stopIndex++) {
    const stop = palette.colors[stopIndex];
    const stopLabelEl = document.createElement("div");
    stopLabelEl.classList.add("palette-label", "palette-label-stop");
    stopLabelEl.innerText = stop.label;
    element.appendChild(stopLabelEl);
  }

  const anyStop = palette.colors[0];
  for (let tintIndex = 0; tintIndex < palette.tintCount; tintIndex++) {
    const tint = anyStop.tints[tintIndex];

    const tintLabelEl = document.createElement("div");
    tintLabelEl.classList.add("palette-label", "palette-label-tint");
    tintLabelEl.innerText = tint.label;
    element.appendChild(tintLabelEl);

    for (let stopIndex = 0; stopIndex < palette.colorCount; stopIndex++) {
      const itemEl = document.createElement("div");
      itemEl.classList.add("palette-item");
      element.appendChild(itemEl);
    }
  }

  function updatePalette() {
    const paletteItems = element.querySelectorAll(".palette-item");
    for (let tintIndex = 0; tintIndex < palette.tintCount; tintIndex++) {
      for (let stopIndex = 0; stopIndex < palette.colorCount; stopIndex++) {
        const stop = palette.colors[stopIndex];
        const tint = stop.tints[tintIndex];

        const paletteItem = paletteItems.item(
          tintIndex * palette.colorCount + stopIndex
        );

        const hex = culori.formatHex(tint.culori);
        paletteItem.style.background = hex;
        paletteItem.innerHTML = hex;
        setTextClass(paletteItem, tint.culori);
      }
    }
  }

  updatePalette();

  Object.values(document.forms[0].elements).forEach((input) => {
    input.addEventListener("change", () => {
      palette = buildPalette();
      updatePalette();
    });
  });
}

function initToggles() {
  const palette = document.querySelector(".palette");
  const hideLabelsCheckbox = document.forms[1].elements["hide-labels"];
  function updateLabelsHex() {
    if (hideLabelsCheckbox.checked) {
      palette.classList.add("hide-labels");
    } else {
      palette.classList.remove("hide-labels");
    }
  }
  updateLabelsHex();
  hideLabelsCheckbox.addEventListener("change", updateLabelsHex);
  const hideHexCheckbox = document.forms[1].elements["hide-hex"];
  function updateHideHex() {
    if (hideHexCheckbox.checked) {
      palette.classList.add("hide-hex");
    } else {
      palette.classList.remove("hide-hex");
    }
  }
  updateHideHex();
  hideHexCheckbox.addEventListener("change", updateHideHex);
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
