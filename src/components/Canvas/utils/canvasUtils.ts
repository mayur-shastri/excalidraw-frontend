import { Point } from '../../../types/index';

// Draw grid background
export const drawGrid = (
  ctx: CanvasRenderingContext2D, 
  width: number, 
  height: number, 
  scale: number, 
  panOffset: Point
) => {
  const gridSize = 20;
  ctx.strokeStyle = '#f0f0f0';
  ctx.lineWidth = 1;

  // Adjust grid offset based on pan
  const offsetX = (panOffset.x % gridSize) / scale;
  const offsetY = (panOffset.y % gridSize) / scale;

  for (let x = offsetX; x < width / scale; x += gridSize) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, height / scale);
    ctx.stroke();
  }

  for (let y = offsetY; y < height / scale; y += gridSize) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(width / scale, y);
    ctx.stroke();
  }
};

// Check if mouse is over a resize handle
export const checkResizeHandle = (
  point: Point,
  selectedElementIds: string[],
  elements: any[],
  scale: number
): string | null => {
  if (selectedElementIds.length === 0) return null;

  // Calculate combined bounding box
  let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
  
  elements.forEach(element => {
    if (selectedElementIds.includes(element.id)) {
      minX = Math.min(minX, element.x);
      minY = Math.min(minY, element.y);
      maxX = Math.max(maxX, element.x + element.width);
      maxY = Math.max(maxY, element.y + element.height);
    }
  });

  const width = maxX - minX;
  const height = maxY - minY;

  const handleSize = 8 / scale;
  const tolerance = handleSize * 2; // Increase hit area

  // Check each handle position
  if (isPointInRect(point, minX - handleSize/2, minY - handleSize/2, handleSize, tolerance)) return 'nw';
  if (isPointInRect(point, minX + width/2 - handleSize/2, minY - handleSize/2, handleSize, tolerance)) return 'n';
  if (isPointInRect(point, minX + width - handleSize/2, minY - handleSize/2, handleSize, tolerance)) return 'ne';
  if (isPointInRect(point, minX + width - handleSize/2, minY + height/2 - handleSize/2, handleSize, tolerance)) return 'e';
  if (isPointInRect(point, minX + width - handleSize/2, minY + height - handleSize/2, handleSize, tolerance)) return 'se';
  if (isPointInRect(point, minX + width/2 - handleSize/2, minY + height - handleSize/2, handleSize, tolerance)) return 's';
  if (isPointInRect(point, minX - handleSize/2, minY + height - handleSize/2, handleSize, tolerance)) return 'sw';
  if (isPointInRect(point, minX - handleSize/2, minY + height/2 - handleSize/2, handleSize, tolerance)) return 'w';

  return null;
};

// Helper function to check if point is in rectangle
const isPointInRect = (
  point: Point, 
  x: number, 
  y: number, 
  width: number, 
  height: number
): boolean => {
  return point.x >= x && point.x <= x + width && point.y >= y && point.y <= y + height;
};

// Get canvas coordinates from mouse event
export const getCoordinates = (
  event: React.MouseEvent<HTMLCanvasElement>,
  canvasRef: React.RefObject<HTMLCanvasElement>,
  scale: number,
  panOffset: Point
): Point => {
  const canvas = canvasRef.current;
  if (!canvas) return { x: 0, y: 0 };

  const rect = canvas.getBoundingClientRect();
  const x = (event.clientX - rect.left - panOffset.x) / scale;
  const y = (event.clientY - rect.top - panOffset.y) / scale;
  return { x, y };
};

// Draw resize handles around selected elements
export const drawResizeHandles = (
  ctx: CanvasRenderingContext2D,
  selectedElementIds: string[],
  elements: any[],
  scale: number
) => {
  const selectedElements = elements.filter(el => selectedElementIds.includes(el.id));
  if (selectedElements.length === 0) return;

  // Calculate combined bounding box
  let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
  
  selectedElements.forEach(element => {
    minX = Math.min(minX, element.x);
    minY = Math.min(minY, element.y);
    maxX = Math.max(maxX, element.x + element.width);
    maxY = Math.max(maxY, element.y + element.height);
  });

  const width = maxX - minX;
  const height = maxY - minY;

  // Draw the bounding box
  ctx.strokeStyle = '#4285f4';
  ctx.lineWidth = 1 / scale;
  ctx.setLineDash([5, 5]);
  ctx.strokeRect(minX, minY, width, height);
  ctx.setLineDash([]);

  // Draw resize handles
  const handleSize = 8 / scale;
  const halfHandle = handleSize / 2;

  // Positions for all 8 handles
  const handles = [
    { x: minX - halfHandle, y: minY - halfHandle, dir: 'nw' },
    { x: minX + width / 2 - halfHandle, y: minY - halfHandle, dir: 'n' },
    { x: minX + width - halfHandle, y: minY - halfHandle, dir: 'ne' },
    { x: minX + width - halfHandle, y: minY + height / 2 - halfHandle, dir: 'e' },
    { x: minX + width - halfHandle, y: minY + height - halfHandle, dir: 'se' },
    { x: minX + width / 2 - halfHandle, y: minY + height - halfHandle, dir: 's' },
    { x: minX - halfHandle, y: minY + height - halfHandle, dir: 'sw' },
    { x: minX - halfHandle, y: minY + height / 2 - halfHandle, dir: 'w' },
  ];

  ctx.fillStyle = '#ffffff';
  ctx.strokeStyle = '#4285f4';
  ctx.lineWidth = 1 / scale;

  handles.forEach(handle => {
    ctx.beginPath();
    ctx.rect(handle.x, handle.y, handleSize, handleSize);
    ctx.fill();
    ctx.stroke();
  });
};