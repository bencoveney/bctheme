import { inverseLerp, lerp, smootherstep } from "./math-functions.js";

function createConfig(stopCount) {
  // Evenly space around a circle
  const stops = Array.from(Array(stopCount)).map((_, index) =>
    lerp(0, 360, index / stopCount)
  );

  return {
    stops,
  };
}

const vividConfig = createConfig(12);
const mutedConfig = createConfig(2);
const greyscaleConfig = createConfig(1);

/*
  {
    tintCount,
    tints: [
      {
        label: string
        luminanceRaw: number,
        luminanceAdjusted: number,
      }
    ]
  }
*/

const tintCount = 9;
const includeExtras = false;
export function buildTintsDefinition(tintSmoothing) {
  const definition = {
    tints: [],
  };

  const stops = [
    ...(includeExtras ? [50, 150, 850, 950] : []),
    // From 0 to 1000, excluding the endpoints
    ...Array.from(Array(tintCount + 2))
      .map((_, index) => lerp(0, 1000, index / (tintCount + 1)))
      .slice(1, tintCount + 1),
  ].toSorted((a, b) => a - b > 0);

  stops.forEach((raw) => {
    const linear = inverseLerp(0, 1000, raw);
    const smooth = smootherstep(0, 1, linear);
    const adjusted = lerp(linear, smooth, tintSmoothing / 100);
    definition.tints.push({
      label: `tint${raw}`,
      luminanceRaw: raw,
      luminanceAdjusted: lerp(0, 1000, adjusted),
      isExtra: raw % 100 !== 0,
    });
  });

  definition.tintCount = definition.tints.length;

  console.log(definition);

  return definition;
}

/*
  {
    colorCount,
    tintCount,
    colors: [
      {
        label: string
        hue: number,
        saturation: number,
        tints: [{
          ...tints.tint
          culori: {}
        }]
      }
    ]
  }
*/

export function buildPaletteDefinition(
  baseHue,
  saturationVivid,
  saturationMuted,
  tintDefinitions
) {
  const saturationGreyscale = 0;
  const definition = {
    ...tintDefinitions,
    colors: [],
  };

  function addToDefinition(config, label, saturation) {
    config.stops.forEach((stopHue, index) => {
      const stop = {
        label: config.stops.length > 1 ? `${label}${index + 1}` : label,
        hue: stopHue + baseHue,
        saturation: saturation,
        tints: [],
      };

      tintDefinitions.tints.forEach((tint) => {
        stop.tints.push({ ...tint });
      });

      definition.colors.push(stop);
    });
  }

  addToDefinition(vividConfig, "vivid", saturationVivid);
  addToDefinition(mutedConfig, "muted", saturationMuted);
  addToDefinition(greyscaleConfig, "grey", saturationGreyscale);

  definition.colors.forEach((color) => {
    color.tints.forEach((tint) => {
      tint.culori = {
        h: color.hue,
        s: color.saturation / 100,
        l: tint.luminanceAdjusted / 1000,
        mode: "okhsl",
      };
    });
  });

  definition.colorCount = definition.colors.length;

  return definition;
}
