import { useCanvasContext } from '../contexts/CanvasContext/CanvasContext';
import { getConnectedArrowEndPoints, getRotatedCorners } from '../utils/geometry';
import { ArrowElement, DrawElement, LineElement, Point, ResizeDirection } from '../types';

export function useCursorUtils(canvasRef: React.RefObject<HTMLCanvasElement>) {
  const {
    elements,
    selectedElementIds,
    scale,
    tool,
    connections
  } = useCanvasContext();

  const handleSize = 8 / scale;
  const tolerance = handleSize * 1.5;

  const isPointNearLine = (p1: Point, p2: Point, point: Point, tolerance: number) => {
    // Check if the point is exactly on the line segment (not just near)
    // Calculate cross product to check collinearity
    const cross = (point.y - p1.y) * (p2.x - p1.x) - (point.x - p1.x) * (p2.y - p1.y);
    if (cross !== 0) return false;

    // Check if the point is within the segment bounds
    const minX = Math.min(p1.x, p2.x);
    const maxX = Math.max(p1.x, p2.x);
    const minY = Math.min(p1.y, p2.y);
    const maxY = Math.max(p1.y, p2.y);

    return (
      point.x >= minX &&
      point.x <= maxX &&
      point.y >= minY &&
      point.y <= maxY
    );
  };

  const findElementAtPosition = (point: Point): DrawElement | null => {
    for (let i = elements.length - 1; i >= 0; i--) {
      const element = elements[i];
      if (element.type === "arrow" || element.type === "line") {
        // Use startPoint and endPoint for hit test
        const { startPoint, endPoint } = element;
        if (
          isPointNearLine(startPoint, endPoint, point, tolerance * 1.2)
        ) {
          return element;
        }
      } else {
        if (
          point.x >= element.x &&
          point.x <= element.x + element.width &&
          point.y >= element.y &&
          point.y <= element.y + element.height
        ) {
          return element;
        }
      }
    }
    return null;
  };

  const handleLineOrFreeArrow = (el: ArrowElement | LineElement, point: Point) => {

    // Use angle to rotate the handle positions
    const angle = el.angle || 0;
    const cx = el.x + el.width / 2;
    const cy = el.y + el.height / 2;

    // Calculate rotated start and end points
    const rotatePoint = (pt: Point) => {
      const dx = pt.x - cx;
      const dy = pt.y - cy;
      return {
        x: cx + dx * Math.cos(angle) - dy * Math.sin(angle),
        y: cy + dx * Math.sin(angle) + dy * Math.cos(angle),
      };
    };

    const handles = [
      { pos: rotatePoint(el.startPoint), dir: "start" as ResizeDirection },
      { pos: rotatePoint(el.endPoint), dir: "end" as ResizeDirection }
    ];

    for (const { pos, dir } of handles) {
      const dx = point.x - pos.x;
      const dy = point.y - pos.y;
      if (dx * dx + dy * dy <= tolerance * tolerance) {
        return dir;
      }
    }
    return null;
  }

  const checkResizeHandle = (point: Point): ResizeDirection => {
    if (selectedElementIds.length !== 1) return null;

    const el = elements.find(e => e.id === selectedElementIds[0]);
    if (!el) return null;

    // Handle Line elements
    if (el.type === "line") {
      return handleLineOrFreeArrow(el, point);
    }

    if (el.type === 'arrow') {
      const { connectionId } = el;
      const conn = connections.find(c => c.id === connectionId);
      if (!conn) return null;
      const { startElementId, endElementId } = conn;
      if (!startElementId && !endElementId) {
        return handleLineOrFreeArrow(el, point);
      }
      const { startPoint, endPoint } = getConnectedArrowEndPoints(elements, el, startElementId, endElementId);
      if (startPoint) {
        // Check if the point is near the start point
        const dx = point.x - startPoint.x;
        const dy = point.y - startPoint.y;
        if (dx * dx + dy * dy <= tolerance * tolerance) {
          return "start";
        }
      }
      if (endPoint) {
        // Check if the point is near the end point
        const dx = point.x - endPoint.x;
        const dy = point.y - endPoint.y;
        if (dx * dx + dy * dy <= tolerance * tolerance) {
          return "end";
        }
      }
    }

    // Default for rectangle/ellipse/etc
    const { x, y, width, height, angle = 0 } = el;
    const cx = x + width / 2;
    const cy = y + height / 2;


    const directions: { dx: number; dy: number; dir: ResizeDirection }[] = [
      { dx: -width / 2, dy: -height / 2, dir: 'nw' },
      { dx: 0, dy: -height / 2, dir: 'n' },
      { dx: width / 2, dy: -height / 2, dir: 'ne' },
      { dx: width / 2, dy: 0, dir: 'e' },
      { dx: width / 2, dy: height / 2, dir: 'se' },
      { dx: 0, dy: height / 2, dir: 's' },
      { dx: -width / 2, dy: height / 2, dir: 'sw' },
      { dx: -width / 2, dy: 0, dir: 'w' },
    ];

    for (const { dx, dy, dir } of directions) {
      const rotatedX = dx * Math.cos(angle) - dy * Math.sin(angle);
      const rotatedY = dx * Math.sin(angle) + dy * Math.cos(angle);
      const handleX = cx + rotatedX;
      const handleY = cy + rotatedY;

      const dxToPoint = point.x - handleX;
      const dyToPoint = point.y - handleY;
      const distanceSq = dxToPoint * dxToPoint + dyToPoint * dyToPoint;

      if (distanceSq <= tolerance * tolerance) {
        return dir;
      }
    }

    return null;
  };

  const checkRotateHandle = (point: Point) => {
    if (selectedElementIds.length === 0) return false;

    const selectedElements = elements.filter(el => selectedElementIds.includes(el.id));
    if (selectedElements.length === 0) return false;

    // Special case for single arrow/line: rotation handle at midpoint
    if (selectedElements.length === 1 && (selectedElements[0].type === "arrow" || selectedElements[0].type === "line")) {
      const el = selectedElements[0];
      const angle = el.angle || 0;
      const mx = (el.startPoint.x + el.endPoint.x) / 2;
      const my = (el.startPoint.y + el.endPoint.y) / 2;
      const rotationHandleDistance = 0;

      // Offset above the midpoint, then rotate
      const dx = 0;
      const dy = -rotationHandleDistance;
      const rotatedHandle = {
        x: mx + dx * Math.cos(angle) - dy * Math.sin(angle),
        y: my + dx * Math.sin(angle) + dy * Math.cos(angle),
      };

      const radius = 12;
      const dxp = point.x - rotatedHandle.x;
      const dyp = point.y - rotatedHandle.y;
      return dxp * dxp + dyp * dyp <= radius * radius;
    }

    // Default for other elements or multi-select
    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;

    selectedElements.forEach(element => {
      const rotatedPoints = getRotatedCorners(element);
      rotatedPoints.forEach(p => {
        minX = Math.min(minX, p.x);
        minY = Math.min(minY, p.y);
        maxX = Math.max(maxX, p.x);
        maxY = Math.max(maxY, p.y);
      });
    });

    const centerX = minX + (maxX - minX) / 2;
    const rotationHandleDistance = 24;

    let rotationHandleX: number, rotationHandleY: number;

    if (selectedElements.length === 1) {
      const element = selectedElements[0];
      const angle = element.angle || 0;

      const cx = element.x + element.width / 2;
      const cy = element.y + element.height / 2;

      const handleX = cx;
      const handleY = element.y - rotationHandleDistance;

      const dx = handleX - cx;
      const dy = handleY - cy;

      rotationHandleX = dx * Math.cos(angle) - dy * Math.sin(angle) + cx;
      rotationHandleY = dx * Math.sin(angle) + dy * Math.cos(angle) + cy;
    } else {
      rotationHandleX = centerX;
      rotationHandleY = minY - rotationHandleDistance;
    }

    const radius = 12;
    const dx = point.x - rotationHandleX;
    const dy = point.y - rotationHandleY;
    return dx * dx + dy * dy <= radius * radius;
  };

  const updateCursor = (point: Point) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    if (tool === 'eraser') {
      canvas.style.cursor = `url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" fill="none" stroke="black" stroke-width="2"/></svg>') 12 12, auto`;
      return;
    }

    if (checkRotateHandle(point)) {
      canvas.style.cursor = "grab";
      return;
    }

    const resizeDir = checkResizeHandle(point);
    if (resizeDir) {
      // For arrow/line, use ew-resize for ends
      if (resizeDir === "start" || resizeDir === "end") {
        canvas.style.cursor = 'pointer';
      } else {
        const cursorMap = {
          'n': 'ns-resize', 's': 'ns-resize',
          'e': 'ew-resize', 'w': 'ew-resize',
          'nw': 'nwse-resize', 'se': 'nwse-resize',
          'ne': 'nesw-resize', 'sw': 'nesw-resize'
        };
        canvas.style.cursor = cursorMap[resizeDir];
      }
    } else if (
      selectedElementIds.length > 0 &&
      findElementAtPosition(point)?.id &&
      selectedElementIds.includes(findElementAtPosition(point)!.id)
    ) {
      canvas.style.cursor = 'move';
    } else {
      canvas.style.cursor = tool === 'selection' ? 'default' : 'crosshair';
    }
  };

  return { updateCursor, checkResizeHandle, checkRotateHandle, findElementAtPosition };
}