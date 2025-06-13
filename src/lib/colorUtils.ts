// Generate a consistent color from a string (client ID)
export function stringToColor(str: string): string {
  // Simple hash function to convert string to a number
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }

  // Generate a pastel color using the hash
  const hue = hash % 360;
  return `hsl(${hue}, 80%, 75%)`; // Light pastel colors
}

// Cache for client colors
const clientColors = new Map<string, string>();

// Get a consistent color for a client
// If the client is not in the cache, generate a new color
// If the client is in the cache, return the cached color
export function getClientColor(clientId: string): string {
  if (!clientId) return '#3b82f6'; // Default color
  
  if (clientColors.has(clientId)) {
    return clientColors.get(clientId)!;
  }
  
  const color = stringToColor(clientId);
  clientColors.set(clientId, color);
  return color;
}
