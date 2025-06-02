import React, { useRef, useState, useEffect } from 'react';
import { ArrowElement, DrawElement, ElementType, LineElement, Point, TextElement } from '../types';
import { renderElement } from '../utils/renderElements';
import { generateId } from '../utils/helpers';
import { defaultStyle } from '../constants';

// TODOs :
// 1. Rotating Elements
// 2. Textbox
// 3. Text in Elements
// 4. Arrow and Line resize doesn't work
// 5. Eraser
// 6. Undo/Redo Feature
// 7. Fix the fucking rhombus --> DONE
// 8. Add images to the diagram


interface CanvasProps {
  elements: DrawElement[];
  setElements: React.Dispatch<React.SetStateAction<DrawElement[]>>;
  tool: ElementType;
  selectedElementIds: string[];
  setSelectedElementIds: React.Dispatch<React.SetStateAction<string[]>>;
  scale: number;
  panOffset: Point;
  onElementComplete: () => void;
  onTextEdit: (element: TextElement) => void;
  selectionBox: {
    startX: number;
    startY: number;
    width: number;
    height: number;
    isActive: boolean;
  } | null;
  setSelectionBox: React.Dispatch<React.SetStateAction<{
    startX: number;
    startY: number;
    width: number;
    height: number;
    isActive: boolean;
  } | null>>;
}

type ResizeDirection = 'n' | 'ne' | 'e' | 'se' | 's' | 'sw' | 'w' | 'nw' | null;

interface TranslatingStartState extends Point {
  startPoint?: Point;
  endPoint?: Point;
  points?: Point[];
}

const Canvas: React.FC<CanvasProps> = ({
  elements,
  setElements,
  tool,
  selectedElementIds,
  setSelectedElementIds,
  scale,
  panOffset,
  selectionBox,
  setSelectionBox,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [isTranslating, setIsTranslating] = useState(false);
  const [startPoint, setStartPoint] = useState<Point>({ x: 0, y: 0 });
  const [currentElement, setCurrentElement] = useState<DrawElement | null>(null);
  const [resizeDirection, setResizeDirection] = useState<ResizeDirection>(null);
  const [originalElements, setOriginalElements] = useState<DrawElement[]>([]);
  const [translationStartPositions, setTranslationStartPositions] = useState<Record<string, TranslatingStartState>>({});
  const [isRotating, setIsRotating] = useState(false);
  const [rotationStartPoint, setRotationStartPoint] = useState<Point | null>(null);
  const ROTATION_THRESHOLD = 0.01; // radians (~0.57 degrees)
  // Redraw the canvas
  const redrawCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.save();
    ctx.translate(panOffset.x, panOffset.y);
    ctx.scale(scale, scale);

    // Draw grid
    drawGrid(ctx, canvas.width, canvas.height);

    // Draw all elements
    elements.forEach(element => {
      renderElement(ctx, element, (selectedElementIds.length > 1));
    });

    // Draw selection box
    if (selectionBox?.isActive) {
      ctx.strokeStyle = '#4285f4';
      ctx.lineWidth = 1;
      ctx.setLineDash([5, 5]);
      ctx.strokeRect(
        selectionBox.startX,
        selectionBox.startY,
        selectionBox.width,
        selectionBox.height
      );
      ctx.setLineDash([]);
    }

    // Draw resize handles
    if (selectedElementIds.length > 0 && !isDrawing) {
      drawResizeHandles(ctx);
    }

    ctx.restore();
  };

  // Draw resize handles
  const drawResizeHandles = (ctx: CanvasRenderingContext2D) => {
    const selectedElements = elements.filter(el => selectedElementIds.includes(el.id));
    if (selectedElements.length === 0) return;

    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;

    selectedElements.forEach(element => {
      minX = Math.min(minX, element.x);
      minY = Math.min(minY, element.y);
      maxX = Math.max(maxX, element.x + element.width);
      maxY = Math.max(maxY, element.y + element.height);
    });

    const width = maxX - minX;
    const height = maxY - minY;

    // Define a pseudo selection element for rendering selection outline
    // Note : Never push elements of type SelectionElement to the elements array
    const pseudoSelectionElement: DrawElement = {
      id: 'selection-outline',
      type: 'selection-outline',
      x: minX,
      y: minY,
      width,
      height,
      angle: 0,
      style: { ...defaultStyle },
      isSelected: true,
    };

    renderElement(ctx, pseudoSelectionElement, false);
  };

  // Check for resize handle
  const checkResizeHandle = (point: Point): ResizeDirection => {
    const selectedElements = elements.filter(el => selectedElementIds.includes(el.id));
    if (selectedElements.length === 0) return null;

    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;

    selectedElements.forEach(element => {
      minX = Math.min(minX, element.x);
      minY = Math.min(minY, element.y);
      maxX = Math.max(maxX, element.x + element.width);
      maxY = Math.max(maxY, element.y + element.height);
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

  // Point in rectangle check
  const isPointInRect = (point: Point, x: number, y: number, width: number, height: number): boolean => {
    return point.x >= x && point.x <= x + width && point.y >= y && point.y <= y + height;
  };

  // Resize elements
  const resizeElements = (direction: ResizeDirection, start: Point, current: Point) => {
    if (!direction || selectedElementIds.length === 0) return;

    const deltaX = current.x - start.x;
    const deltaY = current.y - start.y;

    setElements(prevElements => {
      return prevElements.map(element => {
        if (!selectedElementIds.includes(element.id)) return element;

        const originalElement = originalElements.find(el => el.id === element.id);
        if (!originalElement) return element;

        const newElement = { ...element };
        const { x: origX, y: origY, width: origW, height: origH } = originalElement;

        switch (direction) {
          case 'nw':
            newElement.x = origX + deltaX;
            newElement.y = origY + deltaY;
            newElement.width = origW - deltaX;
            newElement.height = origH - deltaY;
            break;
          case 'n':
            newElement.y = origY + deltaY;
            newElement.height = origH - deltaY;
            break;
          case 'ne':
            newElement.y = origY + deltaY;
            newElement.width = origW + deltaX;
            newElement.height = origH - deltaY;
            break;
          case 'e':
            newElement.width = origW + deltaX;
            break;
          case 'se':
            newElement.width = origW + deltaX;
            newElement.height = origH + deltaY;
            break;
          case 's':
            newElement.height = origH + deltaY;
            break;
          case 'sw':
            newElement.x = origX + deltaX;
            newElement.width = origW - deltaX;
            newElement.height = origH + deltaY;
            break;
          case 'w':
            newElement.x = origX + deltaX;
            newElement.width = origW - deltaX;
            break;
        }

        if (newElement.width < 5) newElement.width = 5;
        if (newElement.height < 5) newElement.height = 5;

        return newElement;
      });
    });
  };

  // Translate elements
  const translateElements = (deltaX: number, deltaY: number) => {
    setElements(prevElements => {
      return prevElements.map(element => {
        if (!selectedElementIds.includes(element.id)) return element;

        // Use the original position at drag start
        const original = translationStartPositions[element.id] || { x: element.x, y: element.y };

        return {
          ...element,
          x: original.x + deltaX,
          y: original.y + deltaY,
          ...(element.type === 'arrow' || element.type === 'line' ? {
            startPoint: {
              x: original.startPoint!.x + deltaX,
              y: original.startPoint!.y + deltaY
            },
            endPoint: {
              x: original.endPoint!.x + deltaX,
              y: original.endPoint!.y + deltaY
            }
          } : {}),
          ...(element.type === 'freedraw' ? {
            points: element.points.map((p, idx) => {
              // If we have original points, use them
              const origPoints = (translationStartPositions[element.id] as any)?.points;
              if (origPoints && origPoints[idx]) {
                return {
                  x: origPoints[idx].x + deltaX,
                  y: origPoints[idx].y + deltaY
                };
              }
              return {
                x: p.x + deltaX,
                y: p.y + deltaY
              };
            })
          } : {})
        };
      });
    });

    if (selectionBox) {
      setSelectionBox(prev => prev ? {
        ...prev,
        startX: prev.startX + deltaX,
        startY: prev.startY + deltaY
      } : null);
    }
  };

  // Get canvas coordinates
  const getCoordinates = (event: React.MouseEvent<HTMLCanvasElement>): Point => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };

    const rect = canvas.getBoundingClientRect();
    return {
      x: (event.clientX - rect.left - panOffset.x) / scale,
      y: (event.clientY - rect.top - panOffset.y) / scale
    };
  };

  // Create new element
  const createElement = (type: ElementType, start: Point): DrawElement | null => {
    const id = generateId();

    switch (type) {
      case 'freedraw':
        return {
          id,
          type: 'freedraw',
          points: [start],
          x: start.x,
          y: start.y,
          width: 0,
          height: 0,
          angle: 0,
          style: { ...defaultStyle },
          isSelected: false,
        };
      case 'rectangle':
        return {
          id,
          type: 'rectangle',
          x: start.x,
          y: start.y,
          width: 0,
          height: 0,
          angle: 0,
          style: { ...defaultStyle },
          isSelected: false,
        };
      case 'ellipse':
        return {
          id,
          type: 'ellipse',
          x: start.x,
          y: start.y,
          width: 0,
          height: 0,
          angle: 0,
          style: { ...defaultStyle },
          isSelected: false,
        };
      case 'arrow':
        return {
          id,
          type: 'arrow',
          startPoint: start,
          endPoint: start,
          x: start.x,
          y: start.y,
          width: 0,
          height: 0,
          angle: 0,
          style: { ...defaultStyle },
          isSelected: false,
        };
      case 'line':
        return {
          id,
          type: 'line',
          startPoint: start,
          endPoint: start,
          x: start.x,
          y: start.y,
          width: 0,
          height: 0,
          angle: 0,
          style: { ...defaultStyle },
          isSelected: false,
        };
      case 'diamond':
        return {
          id,
          type: 'diamond',
          x: start.x,
          y: start.y,
          width: 0,
          height: 0,
          angle: 0,
          style: { ...defaultStyle },
          isSelected: false,
        };
      case 'rhombus':
        return {
          id,
          type: 'rhombus',
          x: start.x,
          y: start.y,
          width: 0,
          height: 0,
          angle: 0,
          style: { ...defaultStyle },
          isSelected: false,
        };
      case 'text':
        return {
          id,
          type: 'text',
          x: start.x,
          y: start.y,
          width: 100,
          height: 24,
          angle: 0,
          style: { ...defaultStyle },
          isSelected: false,
          text: 'Double click to edit',
        };
      default:
        return null;
    }
  };

  // Find element at position
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

  // Find elements in selection box
  const findElementsInSelectionBox = () => {
    if (!selectionBox) return [];

    return elements
      .filter(element => (
        element.x < selectionBox.startX + selectionBox.width &&
        element.x + element.width > selectionBox.startX &&
        element.y < selectionBox.startY + selectionBox.height &&
        element.y + element.height > selectionBox.startY
      ))
      .map(element => element.id);
  };

  // Draw grid
  const drawGrid = (ctx: CanvasRenderingContext2D, width: number, height: number) => {
    const gridSize = 20;
    ctx.strokeStyle = '#f0f0f0';
    ctx.lineWidth = 1;

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

  const checkRotateHandle = (point: Point) => {
    if (selectedElementIds.length === 0)
      return false;
    const selectedElements = selectedElementIds.map(id => elements.find(el => el.id === id));

    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;

    selectedElements.forEach((el) => {
      if (!el) return;
      minX = Math.min(minX, el.x);
      minY = Math.min(minY, el.y);
      maxX = Math.max(maxX, el.x + el.width);
      maxY = Math.max(maxY, el.y + el.height);
    });

    const width = maxX - minX;

    // Check if point is near the top-center of the selection box (e.g., within a small radius)
    const handleX = minX + width / 2;
    const handleY = minY - 24; // usually above the box
    const radius = 12; // px tolerance

    const dx = point.x - handleX;
    const dy = point.y - handleY;
    return dx * dx + dy * dy <= radius * radius;
  };

  const rotateElements = (currentPoint: Point) => {
    if (selectedElementIds.length === 0 || !rotationStartPoint) return;

    // Find the center of the bounding box for selected elements
    const selectedElements = elements.filter(el => selectedElementIds.includes(el.id));
    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
    selectedElements.forEach(el => {
      minX = Math.min(minX, el.x);
      minY = Math.min(minY, el.y);
      maxX = Math.max(maxX, el.x + el.width);
      maxY = Math.max(maxY, el.y + el.height);
    });
    const centerX = minX + (maxX - minX) / 2;
    const centerY = minY + (maxY - minY) / 2;

    // Compute angle delta incrementally
    const prevAngle = Math.atan2(rotationStartPoint.y - centerY, rotationStartPoint.x - centerX);
    const currentAngle = Math.atan2(currentPoint.y - centerY, currentPoint.x - centerX);
    const angleDelta = currentAngle - prevAngle;

    // Only apply if the change is significant
    if (Math.abs(angleDelta) > ROTATION_THRESHOLD) {
      setElements(prevElements =>
        prevElements.map(el => {
          if (!selectedElementIds.includes(el.id)) return el;
          return {
            ...el,
            angle: ((el.angle || 0) + angleDelta) % (2 * Math.PI),
          };
        })
      );

      // Update reference point for smoother continuous dragging
      setRotationStartPoint(currentPoint);
    }
  };


  // Update cursor
  const updateCursor = (point: Point) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // check for rotation
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
    } else if (selectedElementIds.length > 0 &&
      findElementAtPosition(point)?.id &&
      selectedElementIds.includes(findElementAtPosition(point)!.id)) {
      canvas.style.cursor = 'move';
    } else {
      canvas.style.cursor = tool === 'selection' ? 'default' : 'crosshair';
    }

  };

  // Handle mouse down
  const handleMouseDown = (event: React.MouseEvent<HTMLCanvasElement>) => {
    const point = getCoordinates(event);
    setStartPoint(point);

    // Check for rotation
    if (selectedElementIds.length > 0) {
      setIsRotating(checkRotateHandle(point));
      setRotationStartPoint(point);
    }

    // Check for resize first
    const resizeDir = checkResizeHandle(point);
    if (resizeDir && selectedElementIds.length > 0) {
      setIsResizing(true);
      setResizeDirection(resizeDir);
      setOriginalElements(elements.filter(el => selectedElementIds.includes(el.id)));
      return;
    }

    // Check for translation
    const clickedElement = findElementAtPosition(point);
    if (selectedElementIds.length > 0 && clickedElement && selectedElementIds.includes(clickedElement.id)) {
      setIsTranslating(true);

      if (clickedElement) {
        if (event.shiftKey) {
          setSelectedElementIds(prev =>
            prev.includes(clickedElement.id)
              ? prev.filter(id => id !== clickedElement.id)
              : [...prev, clickedElement.id]
          );
        }
      }

      // Store original positions for all selected elements
      const positions: Record<string, TranslatingStartState> = {};
      elements.forEach(el => {
        if (selectedElementIds.includes(el.id)) {
          positions[el.id] = { x: el.x, y: el.y };
          if (el.type === 'arrow' || el.type === 'line') {
            positions[el.id] = { ...positions[el.id], startPoint: el.startPoint, endPoint: el.endPoint };
          }
          else if (el.type === 'freedraw') {
            positions[el.id] = { ...positions[el.id], points: el.points };
          }
        }
      });
      setTranslationStartPositions(positions);
      return;
    }

    setIsDrawing(true);

    if (tool === 'selection') {
      if (clickedElement) {
        if (event.shiftKey) {
          setSelectedElementIds(prev =>
            prev.includes(clickedElement.id)
              ? prev.filter(id => id !== clickedElement.id)
              : [...prev, clickedElement.id]
          );
        } else if (!selectedElementIds.includes(clickedElement.id)) {
          setSelectedElementIds([clickedElement.id]);
        }
      } else {
        setSelectionBox({
          startX: point.x,
          startY: point.y,
          width: 0,
          height: 0,
          isActive: true,
        });
        if (!event.shiftKey) setSelectedElementIds([]);
      }
    } else {
      setSelectedElementIds([]);
      const newElement = createElement(tool, point);
      if (newElement) setCurrentElement(newElement);
    }
  };

  // Handle mouse move
  const handleMouseMove = (event: React.MouseEvent<HTMLCanvasElement>) => {
    const currentPoint = getCoordinates(event);
    const deltaX = currentPoint.x - startPoint.x;
    const deltaY = currentPoint.y - startPoint.y;

    if (isRotating) {
      rotateElements(currentPoint);
      redrawCanvas();
      // May have to draw resize handles, not sure
      const canvas = canvasRef.current;
      if (canvas) {
        const ctx = canvas.getContext('2d');
        drawResizeHandles(ctx!);
      }
      return;
    }

    if (isResizing && resizeDirection) {
      resizeElements(resizeDirection, startPoint, currentPoint);
      redrawCanvas();
      return;
    }

    if (isTranslating) {
      translateElements(deltaX, deltaY);
      redrawCanvas();
      return;
    }

    if (!isDrawing) {
      updateCursor(currentPoint);
      return;
    }

    if (tool === 'selection' && selectionBox?.isActive) {
      setSelectionBox(prev => prev ? {
        ...prev,
        width: currentPoint.x - prev.startX,
        height: currentPoint.y - prev.startY
      } : null);
    } else if (currentElement) {
      const updatedElement = updateElement(currentElement, currentPoint, startPoint);
      setCurrentElement(updatedElement);
    }

    redrawCanvas();
    // Draw current element or selection box
    drawCurrentElement(currentElement);
  };

  const drawCurrentElement = (currentElement: DrawElement | null) => {
    if (!currentElement)
      return null;
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.save();
    ctx.translate(panOffset.x, panOffset.y);
    ctx.scale(scale, scale);

    renderElement(ctx, currentElement, (selectedElementIds.length > 1));

    ctx.restore();
  };

  // Update element during creation
  const updateElement = (element: DrawElement, currentPoint: Point, startPoint: Point): DrawElement => {
    const updated = { ...element };

    switch (element.type) {
      case 'freedraw':
        updated.points = [...(updated as any).points, currentPoint];
        const points = (updated as any).points;
        let minX = points[0].x, minY = points[0].y, maxX = points[0].x, maxY = points[0].y;
        points.forEach((p: Point) => {
          minX = Math.min(minX, p.x);
          minY = Math.min(minY, p.y);
          maxX = Math.max(maxX, p.x);
          maxY = Math.max(maxY, p.y);
        });
        updated.x = minX;
        updated.y = minY;
        updated.width = maxX - minX;
        updated.height = maxY - minY;
        break;

      case 'rectangle':
      case 'ellipse':
      case 'diamond':
      case 'rhombus':
        updated.width = currentPoint.x - startPoint.x;
        updated.height = currentPoint.y - startPoint.y;
        if (updated.width < 0) {
          updated.x = currentPoint.x;
          updated.width = Math.abs(updated.width);
        }
        if (updated.height < 0) {
          updated.y = currentPoint.y;
          updated.height = Math.abs(updated.height);
        }
        break;

      case 'arrow':
      case 'line':
        (updated as ArrowElement | LineElement).endPoint = currentPoint;
        const startX = (updated as ArrowElement | LineElement).startPoint.x;
        const startY = (updated as ArrowElement | LineElement).startPoint.y;
        updated.x = Math.min(startX, currentPoint.x);
        updated.y = Math.min(startY, currentPoint.y);
        updated.width = Math.abs(currentPoint.x - startX);
        updated.height = Math.abs(currentPoint.y - startY);
        break;
    }

    return updated;
  };

  // Handle mouse up
  const handleMouseUp = () => {
    if (isResizing) {
      setIsResizing(false);
      setResizeDirection(null);
      setOriginalElements([]);
    } else if (isTranslating) {
      setIsTranslating(false);
      setTranslationStartPositions({});
    } else if (isDrawing) {
      if (tool === 'selection' && selectionBox?.isActive) {
        const selectedElements = findElementsInSelectionBox();
        setSelectedElementIds(prev => [...new Set([...prev, ...selectedElements])]);
        setSelectionBox(null);
      } else if (currentElement && tool !== 'selection') {
        setElements(prev => [...prev, currentElement]);
      }
    }

    if (isDrawing || isTranslating) {
      setIsDrawing(false);
      setCurrentElement(null);
    }
  };

  // Effects
  useEffect(() => {
    const resizeCanvas = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
      redrawCanvas();
    };

    window.addEventListener('resize', resizeCanvas);
    resizeCanvas();
    return () => window.removeEventListener('resize', resizeCanvas);
  }, []);

  useEffect(() => {
    redrawCanvas();
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      drawResizeHandles(ctx!);
    }
  }, [elements, scale, panOffset, selectionBox]);

  useEffect(() => {
    setElements(prev =>
      prev.map(el => ({
        ...el,
        isSelected: selectedElementIds.includes(el.id)
      }))
    );
  }, [selectedElementIds]);

  return (
    <canvas
      ref={canvasRef}
      className="w-full h-full touch-none"
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
    />
  );
};

export default Canvas;