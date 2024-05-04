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
