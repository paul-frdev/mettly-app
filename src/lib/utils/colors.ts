/**
 * Generates a consistent color based on a string input (like client ID or name)
 * @param str - The input string to generate a color for
 * @returns A hex color code
 */
export function stringToColor(str: string): string {
  // Simple hash function
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }

  // Generate pastel colors by using higher lightness values
  // Using HSL color model for better color variation
  const h = Math.abs(hash % 360);
  // Keep saturation and lightness in a pleasant range for pastel colors
  const s = 70 + (Math.abs(hash) % 20); // 70-90% saturation
  const l = 70 + (Math.abs(hash) % 15); // 70-85% lightness

  // Convert HSL to hex
  return hslToHex(h, s, l);
}

/**
 * Converts HSL color to hex
 */
function hslToHex(h: number, s: number, l: number): string {
  l /= 100;
  const a = (s * Math.min(l, 1 - l)) / 100;
  const f = (n: number) => {
    const k = (n + h / 30) % 12;
    const color = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
    return Math.round(255 * color)
      .toString(16)
      .padStart(2, '0');
  };
  return `#${f(0)}${f(8)}${f(4)}`;
}

/**
 * Gets a contrasting text color (black or white) based on background color
 * @param bgColor - Background color in hex format (#RRGGBB)
 * @returns '#000000' for light backgrounds, '#ffffff' for dark backgrounds
 */
export function getContrastTextColor(bgColor: string): string {
  // Convert hex to RGB
  const r = parseInt(bgColor.slice(1, 3), 16);
  const g = parseInt(bgColor.slice(3, 5), 16);
  const b = parseInt(bgColor.slice(5, 7), 16);
  
  // Calculate luminance (perceived brightness)
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  
  // Return black for light colors, white for dark colors
  return luminance > 0.5 ? '#000000' : '#ffffff';
}
