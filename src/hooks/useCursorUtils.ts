import { useCanvasContext } from '../contexts/CanvasContext/CanvasContext';
import { getRotatedCorners } from '../utils/geometry';
import { isPointInRect } from '../utils/geometry';
import { DrawElement, Point, ResizeDirection } from '../types';

export function useCursorUtils(canvasRef: React.RefObject<HTMLCanvasElement>) {
  const {
    elements,
    selectedElementIds,
    scale,
    tool
  } = useCanvasContext();

  const findElementAtPosition = (point: Point): DrawElement | null => {
    for (let i = elements.length - 1; i >= 0; i--) {
      const element = elements[i];
      if (
        point.x >= element.x &&
        point.x <= element.x + element.width &&
        point.y >= element.y &&
        point.y <= element.y + element.height
      ) {
        return element;
      }
    }
    return null;
  };

  const checkResizeHandle = (point: Point): ResizeDirection => {
    if (selectedElementIds.length !== 1) return null;

    const el = elements.find(e => e.id === selectedElementIds[0]);
    if (!el) return null;

    const { x, y, width, height, angle = 0 } = el;
    const cx = x + width / 2;
    const cy = y + height / 2;

    const handleSize = 8 / scale;
    const tolerance = handleSize * 1.5; // or tweak for UX

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
      // Rotate offset dx, dy around center
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

      // Element center
      const cx = element.x + element.width / 2;
      const cy = element.y + element.height / 2;

      // Unrotated handle position (above top-center of the element)
      const handleX = cx;
      const handleY = element.y - rotationHandleDistance;

      // Rotate handle position around the element center
      const dx = handleX - cx;
      const dy = handleY - cy;

      rotationHandleX = dx * Math.cos(angle) - dy * Math.sin(angle) + cx;
      rotationHandleY = dx * Math.sin(angle) + dy * Math.cos(angle) + cy;
    } else {
      // Multiple elements: selection box does NOT rotate, so handle is at top center of axis-aligned box
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
      const cursorMap = {
        'n': 'ns-resize', 's': 'ns-resize',
        'e': 'ew-resize', 'w': 'ew-resize',
        'nw': 'nwse-resize', 'se': 'nwse-resize',
        'ne': 'nesw-resize', 'sw': 'nesw-resize'
      };
      canvas.style.cursor = cursorMap[resizeDir];
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