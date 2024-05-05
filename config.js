import { lerp } from "./math-functions.js";

function createConfig(stopCount, tintCount) {
  // Evenly space around a circle
  const stops = Array.from(Array(stopCount)).map((_, index) =>
    lerp(0, 360, index / stopCount)
  );

  // From 0 to 1000, excluding the endpoints
  const tints = [
    50,
    ...Array.from(Array(tintCount + 2))
      .map((_, index) => lerp(0, 1000, index / (tintCount + 1)))
      .slice(1, tintCount + 1),
    950,
  ];

  return {
    stops,
    tints,
  };
}

export const vibrantConfig = createConfig(12, 9);
export const mutedConfig = createConfig(2, 9);
export const greyscaleConfig = createConfig(1, 9);

/*
  {
    colorCount,
    tintCount,
    colors: [
      {
        hue: number,
        saturation: number,
        tints: [{
          luminance: number
          culori: {}
        }]
      }
    ]
  }
*/

export function buildPaletteDefinition(
  baseHue,
  saturationVibrant,
  saturationMuted
) {
  const saturationGreyscale = 0;

  const definition = {
    colors: [],
  };

  function addToDefinition(config, saturation) {
    config.stops.forEach((stopHue) => {
      const stop = {
        hue: stopHue + baseHue,
        saturation: saturation,
        tints: [],
      };

      config.tints.forEach((tintLuminance) => {
        stop.tints.push({
          luminance: tintLuminance,
        });
      });

      definition.colors.push(stop);
    });
  }

  addToDefinition(vibrantConfig, saturationVibrant);
  addToDefinition(mutedConfig, saturationMuted);
  addToDefinition(greyscaleConfig, saturationGreyscale);

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
