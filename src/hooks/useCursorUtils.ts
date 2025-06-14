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
    const selectedElements = elements.filter(el => selectedElementIds.includes(el.id));
    if (selectedElements.length === 0) return null;

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

    const width = maxX - minX;
    const height = maxY - minY;
    const handleSize = 8 / scale;
    const tolerance = handleSize * 2;

    if (isPointInRect(point, minX - handleSize / 2, minY - handleSize / 2, handleSize, tolerance)) return 'nw';
    if (isPointInRect(point, minX + width / 2 - handleSize / 2, minY - handleSize / 2, handleSize, tolerance)) return 'n';
    if (isPointInRect(point, minX + width - handleSize / 2, minY - handleSize / 2, handleSize, tolerance)) return 'ne';
    if (isPointInRect(point, minX + width - handleSize / 2, minY + height / 2 - handleSize / 2, handleSize, tolerance)) return 'e';
    if (isPointInRect(point, minX + width - handleSize / 2, minY + height - handleSize / 2, handleSize, tolerance)) return 'se';
    if (isPointInRect(point, minX + width / 2 - handleSize / 2, minY + height - handleSize / 2, handleSize, tolerance)) return 's';
    if (isPointInRect(point, minX - handleSize / 2, minY + height - handleSize / 2, handleSize, tolerance)) return 'sw';
    if (isPointInRect(point, minX - handleSize / 2, minY + height / 2 - handleSize / 2, handleSize, tolerance)) return 'w';

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
    const centerY = minY + (maxY - minY) / 2;

    const angle = selectedElements[0]?.angle || 0;
    const rotationHandleDistance = 24;
    const topCenterX = centerX;
    const topCenterY = minY - rotationHandleDistance;
    const delX = topCenterX - centerX;
    const delY = topCenterY - centerY;
    const rotatedX = delX * Math.cos(angle) - delY * Math.sin(angle) + centerX;
    const rotatedY = delX * Math.sin(angle) + delY * Math.cos(angle) + centerY;
    const rotationHandleX = rotatedX;
    const rotationHandleY = rotatedY;

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
      canvas.style.cursor = "url('/rotate-icon.png') 16 16, auto";
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