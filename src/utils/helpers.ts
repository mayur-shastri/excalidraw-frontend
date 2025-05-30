// Generate a unique ID
export const generateId = (): string => {
  return Math.random().toString(36).substring(2, 9);
};

// Calculate distance between two points
export const distance = (point1: { x: number; y: number }, point2: { x: number; y: number }): number => {
  return Math.sqrt(
    Math.pow(point2.x - point1.x, 2) + Math.pow(point2.y - point1.y, 2)
  );
};

// Check if a point is inside a rectangle
export const isPointInRect = (
  point: { x: number; y: number },
  rect: { x: number; y: number; width: number; height: number }
): boolean => {
  return (
    point.x >= rect.x &&
    point.x <= rect.x + rect.width &&
    point.y >= rect.y &&
    point.y <= rect.y + rect.height
  );
};

// Normalize a rectangle (ensure width and height are positive)
export const normalizeRect = (
  x: number,
  y: number,
  width: number,
  height: number
): { x: number; y: number; width: number; height: number } => {
  if (width < 0) {
    x += width;
    width = Math.abs(width);
  }
  
  if (height < 0) {
    y += height;
    height = Math.abs(height);
  }
  
  return { x, y, width, height };
};