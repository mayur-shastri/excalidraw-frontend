import { DrawElement, Point } from "../types";

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

// Helper function to find closest point on a line segment with rounded corners
function getClosestPointOnRoundedEdge(
  point: Point,
  start: Point,
  end: Point,
  radius: number
): Point {
  // Vector from start to end
  const dx = end.x - start.x;
  const dy = end.y - start.y;
  const length = Math.sqrt(dx * dx + dy * dy);

  // If line has no length, return start point
  if (length === 0) return start;

  // Unit vector
  const unitX = dx / length;
  const unitY = dy / length;

  // Project point onto the line
  let t = ((point.x - start.x) * unitX + (point.y - start.y) * unitY) / length;
  t = Math.max(0, Math.min(1, t)); // Clamp to segment

  // Handle rounded corners
  if (t < radius / length) {
    // Near start corner - treat as circle
    return getClosestPointOnCircle(point, start, radius);
  } else if (t > 1 - radius / length) {
    // Near end corner - treat as circle
    return getClosestPointOnCircle(point, end, radius);
  }

  // On straight segment
  return {
    x: start.x + t * dx,
    y: start.y + t * dy
  };
}

// Helper function to find closest point on a circle
function getClosestPointOnCircle(point: Point, center: Point, radius: number): Point {
  const dx = point.x - center.x;
  const dy = point.y - center.y;
  const distance = Math.sqrt(dx * dx + dy * dy);

  if (distance === 0) {
    // Point is at center - return any point on circle
    return { x: center.x + radius, y: center.y };
  }

  // Scale to radius
  return {
    x: center.x + (dx / distance) * radius,
    y: center.y + (dy / distance) * radius
  };
}

// Helper function to calculate proportional radius based on element dimensions
const getProportionalRadius = (width: number, height: number, radius: number): number => {
  // Ensure the radius isn't larger than half the smallest dimension
  const maxRadius = Math.min(width, height) / 2;
  return Math.min(radius, maxRadius);
};

export const calculateClosestBoundaryPoint = (
  element: DrawElement,
  point: Point,
  tolerance: number = 3 // pixels
): Point | null => {
  // First check if point is outside the element's bounding box
  if (
    point.x < element.x - tolerance ||
    point.x > element.x + element.width + tolerance ||
    point.y < element.y - tolerance ||
    point.y > element.y + element.height + tolerance
  ) {
    return null;
  }

  const { x, y, width, height, style } = element;
  const radius = getProportionalRadius(width, height, style?.cornerRadius ?? 12);
  const centerX = x + width / 2;
  const centerY = y + height / 2;

  switch (element.type) {
    case 'rectangle': {
      // Check if point is near any of the four edges
      const nearLeft = Math.abs(point.x - element.x) <= tolerance;
      const nearRight = Math.abs(point.x - (element.x + element.width)) <= tolerance;
      const nearTop = Math.abs(point.y - element.y) <= tolerance;
      const nearBottom = Math.abs(point.y - (element.y + element.height)) <= tolerance;

      if (!(nearLeft || nearRight || nearTop || nearBottom)) {
        return null; // Not on boundary
      }

      // Calculate exact boundary point
      if (nearLeft || nearRight) {
        return {
          x: nearLeft ? element.x : element.x + element.width,
          y: point.y
        };
      } else {
        return {
          x: point.x,
          y: nearTop ? element.y : element.y + element.height
        };
      }
    }

    case 'ellipse': {
      const a = element.width / 2;
      const b = element.height / 2;

      // Normalized coordinates (relative to center)
      const nx = (point.x - centerX) / a;
      const ny = (point.y - centerY) / b;

      // Distance from edge (1 = exactly on edge)
      const edgeDistance = Math.sqrt(nx * nx + ny * ny);
      const boundaryThreshold = tolerance / Math.min(a, b);

      if (Math.abs(edgeDistance - 1) > boundaryThreshold) {
        return null; // Not on boundary
      }

      // Project point to exact boundary
      const angle = Math.atan2(ny, nx);
      return {
        x: centerX + a * Math.cos(angle),
        y: centerY + b * Math.sin(angle)
      };
    }

    case 'diamond': {
      // Diamond points (same as render function)
      const top = { x: centerX, y: y };
      const right = { x: x + width, y: centerY };
      const bottom = { x: centerX, y: y + height };
      const left = { x: x, y: centerY };

      // Calculate distance to each edge (with rounded corners considered)
      const edges = [
        { start: top, end: right, curve: radius },    // Top-right edge
        { start: right, end: bottom, curve: radius }, // Right-bottom edge
        { start: bottom, end: left, curve: radius },  // Bottom-left edge
        { start: left, end: top, curve: radius }      // Left-top edge
      ];

      let minDistance = Infinity;
      let closestPoint: Point | null = null;

      for (const edge of edges) {
        const edgePoint = getClosestPointOnRoundedEdge(
          point,
          edge.start,
          edge.end,
          edge.curve
        );
        const distance = Math.sqrt(
          Math.pow(point.x - edgePoint.x, 2) + Math.pow(point.y - edgePoint.y, 2)
        );

        if (distance < minDistance && distance <= tolerance) {
          minDistance = distance;
          closestPoint = edgePoint;
        }
      }

      return closestPoint;
    }

    case 'rhombus': {
      const skew = width * 0.25;
      // Rhombus points (same as render function)
      const topLeft = { x: x + skew, y: y };
      const topRight = { x: x + width, y: y };
      const bottomRight = { x: x + width - skew, y: y + height };
      const bottomLeft = { x: x, y: y + height };

      // Define edges with their curve points
      const edges = [
        { start: topLeft, end: topRight, curveStart: radius, curveEnd: radius }, // Top edge
        { start: topRight, end: bottomRight, curveStart: radius, curveEnd: radius }, // Right edge
        { start: bottomRight, end: bottomLeft, curveStart: radius, curveEnd: radius }, // Bottom edge
        { start: bottomLeft, end: topLeft, curveStart: radius, curveEnd: radius } // Left edge
      ];

      let minDistance = Infinity;
      let closestPoint: Point | null = null;

      for (const edge of edges) {
        const edgePoint = getClosestPointOnRoundedEdge(
          point,
          edge.start,
          edge.end,
          Math.max(edge.curveStart, edge.curveEnd)
        );
        const distance = Math.sqrt(
          Math.pow(point.x - edgePoint.x, 2) + Math.pow(point.y - edgePoint.y, 2)
        );

        if (distance < minDistance && distance <= tolerance) {
          minDistance = distance;
          closestPoint = edgePoint;
        }
      }

      return closestPoint;
    }
    default:
      return null;
  }
};