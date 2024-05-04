import { to255 } from "./math-functions.js";

/**
 * https://en.wikipedia.org/wiki/HSL_color_space.
 * Assumes h, s, and l are contained in the set [0, 1] and
 * returns r, g, and b in the set [0, 255].
 */
export function hslToRgb(h, s, l) {
  let r, g, b;
  if (s === 0) {
    r = g = b = l;
  } else {
    const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    const p = 2 * l - q;
    r = hueToRgb(p, q, h + 1 / 3);
    g = hueToRgb(p, q, h);
    b = hueToRgb(p, q, h - 1 / 3);
  }
  return [to255(r), to255(g), to255(b)];
}

function hueToRgb(p, q, t) {
  if (t < 0) t += 1;
  if (t > 1) t -= 1;
  if (t < 1 / 6) return p + (q - p) * 6 * t;
  if (t < 1 / 2) return q;
  if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
  return p;
}

const Pr = 0.299;
const Pg = 0.587;
const Pb = 0.114;

// const Pr = 0.241;
// const Pg = 0.691;
// const Pb = 0.068;

export function rgbToHsp(r, g, b) {
  // Calculate the perceived brightness.
  const perceivedBrightness = Math.sqrt(r * r * Pr + g * g * Pg + b * b * Pb);
  if (r == g && r == b) {
    return [0, 0, perceivedBrightness];
  }
  if (r >= g && r >= b) {
    // r is largest
    if (b >= g) {
      const hue = 6 / 6 - ((1 / 6) * (b - g)) / (r - g);
      const saturation = 1 - g / r;
      return [hue, saturation, perceivedBrightness];
    }
    const hue = 0 / 6 + ((1 / 6) * (g - b)) / (r - b);
    const saturation = 1 - b / r;
    return [hue, saturation, perceivedBrightness];
  }
  if (g >= r && g >= b) {
    // g is largest
    if (r >= b) {
      const hue = 2 / 6 - ((1 / 6) * (r - b)) / (g - b);
      const saturation = 1 - b / g;
      return [hue, saturation, perceivedBrightness];
    }
    const hue = 2 / 6 + ((1 / 6) * (b - r)) / (g - r);
    const saturation = 1 - r / g;
    return [hue, saturation, perceivedBrightness];
  }
  // b is largest
  if (g >= r) {
    const hue = 4 / 6 - ((1 / 6) * (g - r)) / (b - r);
    const saturation = 1 - r / b;
    return [hue, saturation, perceivedBrightness];
  }
  const hue = 4 / 6 + ((1 / 6) * (r - g)) / (b - g);
  const saturation = 1 - g / b;
  return [hue, saturation, perceivedBrightness];
}

export function hspToRgb(h, s, p) {
  const minOverMax = 1 - s;
  if (minOverMax > 0) {
    if (h < 1 / 6) {
      // r > g > b
      h = 6 * (h - 0 / 6);
      const part = 1 + h * (1 / minOverMax - 1);
      const b =
        p / Math.sqrt(Pr / minOverMax / minOverMax + Pg * part * part + Pb);
      const r = b / minOverMax;
      const g = b + h * (r - b);
      return [r, g, b];
    }
    if (h < 2 / 6) {
      // g > r > b
      h = 6 * (-h + 2 / 6);
      const part = 1 + h * (1 / minOverMax - 1);
      const b =
        p / Math.sqrt(Pg / minOverMax / minOverMax + Pr * part * part + Pb);
      const g = b / minOverMax;
      const r = b + h * (g - b);
      return [r, g, b];
    }
    if (h < 3 / 6) {
      // g > b > r
      h = 6 * (h - 2 / 6);
      const part = 1 + h * (1 / minOverMax - 1);
      const r =
        p / Math.sqrt(Pg / minOverMax / minOverMax + Pb * part * part + Pr);
      const g = r / minOverMax;
      const b = r + h * (g - r);
      return [r, g, b];
    }
    if (h < 4 / 6) {
      // b > g > r
      h = 6 * (-h + 4 / 6);
      const part = 1 + h * (1 / minOverMax - 1);
      const r =
        p / Math.sqrt(Pb / minOverMax / minOverMax + Pg * part * part + Pr);
      const b = r / minOverMax;
      const g = r + h * (b - r);
      return [r, g, b];
    }
    if (h < 5 / 6) {
      // b > r > g
      h = 6 * (h - 4 / 6);
      const part = 1 + h * (1 / minOverMax - 1);
      const g =
        p / Math.sqrt(Pb / minOverMax / minOverMax + Pr * part * part + Pg);
      const b = g / minOverMax;
      const r = g + h * (b - g);
      return [r, g, b];
    }
    // r > b > g
    h = 6 * (-h + 6 / 6);
    const part = 1 + h * (1 / minOverMax - 1);
    const g =
      p / Math.sqrt(Pr / minOverMax / minOverMax + Pb * part * part + Pg);
    const r = g / minOverMax;
    const b = g + h * (r - g);
    return [r, g, b];
  }
  if (h < 1 / 6) {
    // r > g > b
    h = 6 * (h - 0 / 6);
    const r = Math.sqrt((p * p) / (Pr + Pg * h * h));
    const g = r * h;
    const b = 0;
    return [r, g, b];
  }
  if (h < 2 / 6) {
    // g > r > b
    h = 6 * (-h + 2 / 6);
    const g = Math.sqrt((p * p) / (Pg + Pr * h * h));
    const r = g * h;
    const b = 0;
    return [r, g, b];
  }
  if (h < 3 / 6) {
    // g > b > r
    h = 6 * (h - 2 / 6);
    const g = Math.sqrt((p * p) / (Pg + Pb * h * h));
    const b = g * h;
    const r = 0;
    return [r, g, b];
  }
  if (h < 4 / 6) {
    // b > g > r
    h = 6 * (-h + 4 / 6);
    const b = Math.sqrt((p * p) / (Pb + Pg * h * h));
    const g = b * h;
    const r = 0;
    return [r, g, b];
  }
  if (h < 5 / 6) {
    // b > r > g
    h = 6 * (h - 4 / 6);
    const b = Math.sqrt((p * p) / (Pb + Pr * h * h));
    const r = b * h;
    const g = 0;
    return [r, g, b];
  }
  // r > b > g
  h = 6 * (-h + 6 / 6);
  const r = Math.sqrt((p * p) / (Pr + Pb * h * h));
  const b = r * h;
  const g = 0;
  return [r, g, b];
}
