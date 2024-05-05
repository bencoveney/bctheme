/**
  Returns a blend between min and max, based on a fraction t.
*/
export function lerp(min, max, t) {
  return (1 - t) * min + max * t;
}

/**
 * Returns a fraction t, based on a value between min and max.
 */
export function inverseLerp(min, max, value) {
  return (value - min) / (max - min);
}

/**
 * Takes a value within a given input range into a given output range.
 */
export function remap(inMin, inMax, outMin, outMax, value) {
  const t = inverseLerp(inMin, inMax, value);
  return lerp(outMin, outMax, t);
}

export function to255(t) {
  return Math.min(Math.floor(t * 256), 255);
}

export function roundTo(value, dp) {
  const mult = Math.pow(10, dp);
  return Math.round(value * mult) / mult;
}

export function smoothstep(edge0, edge1, x) {
  x = clamp((x - edge0) / (edge1 - edge0));
  return x * x * (3 - 2 * x);
}

export function smootherstep(edge0, edge1, x) {
  x = clamp((x - edge0) / (edge1 - edge0));
  return x * x * x * (x * (6 * x - 15) + 10);
}

export function clamp(x, lowerlimit = 0, upperlimit = 1) {
  if (x < lowerlimit) return lowerlimit;
  if (x > upperlimit) return upperlimit;
  return x;
}
