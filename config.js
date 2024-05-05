import { lerp } from "./math-functions.js";

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

const tintCount = 9;
const tintConfig = [
  50,
  // From 0 to 1000, excluding the endpoints
  ...Array.from(Array(tintCount + 2))
    .map((_, index) => lerp(0, 1000, index / (tintCount + 1)))
    .slice(1, tintCount + 1),
  950,
];

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
          label: string,
          luminance: number,
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
  tintSmoothing
) {
  const saturationGreyscale = 0;

  console.log(tintSmoothing);

  const definition = {
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

      tintConfig.forEach((tintLuminance) => {
        stop.tints.push({
          label: `tint${tintLuminance}`,
          luminance: tintLuminance,
        });
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
        l: tint.luminance / 1000,
        mode: "okhsl",
      };
    });
  });

  definition.colorCount = definition.colors.length;
  definition.tintCount = definition.colors[0].tints.length;

  return definition;
}
