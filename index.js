import { remap } from "./math-functions.js";
import { culori, setTextClass } from "./external.js";
import {
  buildPaletteDefinition,
  buildTintsDefinition,
  defaultColorNames,
} from "./config.js";

window.addEventListener("load", () => {
  initPreview();
  initColorNames();
  initToggles();
  initPalette(document.querySelector(".palette"));
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
  // context.lineTo(0, height);
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

  const colorNames = document.forms[2].elements["color-names"].value
    .trim()
    .split("\n")
    .map((name) => name.trim());

  const paletteDefinition = buildPaletteDefinition(
    hue,
    saturationVivid,
    saturationMuted,
    buildTintsDefinition(tintSmoothing),
    colorNames
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
    stopLabelEl.innerText = stop.name;
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
    const paletteStopLabels = element.querySelectorAll(".palette-label-stop");
    for (let stopIndex = 0; stopIndex < palette.colorCount; stopIndex++) {
      const stop = palette.colors[stopIndex];
      const stopLabelEl = paletteStopLabels.item(stopIndex);
      stopLabelEl.innerText = stop.name;
    }

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

  document.forms[2].elements["color-names"].addEventListener("change", () => {
    palette = buildPalette();
    updatePalette();
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
  const darkModeCheckbox = document.forms[1].elements["dark-mode"];
  function updateDarkMode() {
    if (darkModeCheckbox.checked) {
      document.body.classList.add("dark-mode");
    } else {
      document.body.classList.remove("dark-mode");
    }
  }
  updateDarkMode();
  darkModeCheckbox.addEventListener("change", updateDarkMode);
}

function initColorNames() {
  const colorNames = document.forms[2].elements["color-names"];
  colorNames.value = defaultColorNames.join("\n");
}
