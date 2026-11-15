/** Returns a 6-digit hex colour without "#", or "" if the input isn't one. */
export const normalizeColor = (color?: string): string => {
  if (!color) return "";
  const hex = color.startsWith("#") ? color.slice(1) : color;
  if (/^[0-9a-f]{3}$/i.test(hex)) {
    return hex
      .split("")
      .map((c) => c + c)
      .join("");
  }
  return /^[0-9a-f]{6}$/i.test(hex) ? hex : "";
};
