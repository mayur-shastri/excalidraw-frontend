// TODOs :
// 6. Undo/Redo Feature -->DONE
// 5. Eraser --> DONE
// 7. Fix the fucking rhombus --> DONE
// 4. Arrow and Line resize doesn't work -->DONE
// 2. Textbox --> Done
// 3. Text in Elements --> Partially Done (Using backspace deletes the element)
// 1. Rotating Elements -->Partially Done (Group elements still rotate about their own axis, instead of a group center. Needs fixing
//                                         Resize handles are hard to locate after rotating)

import React, { useRef, useState, useEffect } from 'react';
import { ArrowElement, DrawElement, ElementType, LineElement, Point, TextElement } from '../types';
import { renderElement } from '../utils/renderElements';
import { generateId } from '../utils/helpers';
import { defaultStyle } from '../constants';

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
  onTextEdit,
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
  const ROTATION_THRESHOLD = 0.01;

  const redrawCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.save();
    ctx.translate(panOffset.x, panOffset.y);
    ctx.scale(scale, scale);

    drawGrid(ctx, canvas.width, canvas.height);

    elements.forEach(element => {
      if (element.isMarkedForDeletion) return;
      renderElement(ctx, element, (selectedElementIds.length > 1));
    });

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

    if (selectedElementIds.length > 0 && !isDrawing) {
      drawResizeHandles(ctx);
    }

    ctx.restore();
  };

  const drawResizeHandles = (ctx: CanvasRenderingContext2D) => {
    const selectedElements = elements.filter(el => selectedElementIds.includes(el.id));
    if (selectedElements.length === 0) return;

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
    const centerX = minX + width / 2;
    const centerY = minY + height / 2;

    if(selectedElementIds.length > 1){
      const pseudoSelectionElement: DrawElement = {
        id: 'selection-outline',
        type: 'selection-outline',
        x: minX,
        y: minY,
        width,
        height,
        angle: selectedElements[0]?.angle || 0,
        style: { ...defaultStyle },
        isSelected: true,
      };

      renderElement(ctx, pseudoSelectionElement, false);
    }
  };

  const handleDoubleClick = (event: React.MouseEvent<HTMLCanvasElement>) => {
    const point = getCoordinates(event);
    const clickedElement = findElementAtPosition(point);
    
    if (clickedElement) {
      setSelectedElementIds([clickedElement.id]);
      onTextEdit(clickedElement as TextElement);
    }
    // if (clickedElement && clickedElement.type === 'text') {
    //   setSelectedElementIds([clickedElement.id]);
    //   onTextEdit(clickedElement as TextElement);
    // }
  };

  const getRotatedCorners = (element: DrawElement): Point[] => {
    const { x, y, width, height, angle = 0 } = element;
    const centerX = x + width / 2;
    const centerY = y + height / 2;

    const corners = [
      { x, y },
      { x: x + width, y },
      { x: x + width, y: y + height },
      { x, y: y + height }
    ];

    return corners.map(p => {
      const translatedX = p.x - centerX;
      const translatedY = p.y - centerY;
      const rotatedX = translatedX * Math.cos(angle) - translatedY * Math.sin(angle);
      const rotatedY = translatedX * Math.sin(angle) + translatedY * Math.cos(angle);
      return {
        x: rotatedX + centerX,
        y: rotatedY + centerY
      };
    });
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

  const isPointInRect = (point: Point, x: number, y: number, width: number, height: number): boolean => {
    return point.x >= x && point.x <= x + width && point.y >= y && point.y <= y + height;
  };

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

        // Handle freedraw
        if (element.type === 'freedraw') {
          // Scale all points relative to the bounding box
          const points = (originalElement as any).points;
          let minX = Math.min(...points.map((p: Point) => p.x));
          let minY = Math.min(...points.map((p: Point) => p.y));
          let maxX = Math.max(...points.map((p: Point) => p.x));
          let maxY = Math.max(...points.map((p: Point) => p.y));
          let newMinX = minX, newMinY = minY, newMaxX = maxX, newMaxY = maxY;

          switch (direction) {
            case 'nw':
              newMinX += deltaX;
              newMinY += deltaY;
              break;
            case 'n':
              newMinY += deltaY;
              break;
            case 'ne':
              newMaxX += deltaX;
              newMinY += deltaY;
              break;
            case 'e':
              newMaxX += deltaX;
              break;
            case 'se':
              newMaxX += deltaX;
              newMaxY += deltaY;
              break;
            case 's':
              newMaxY += deltaY;
              break;
            case 'sw':
              newMinX += deltaX;
              newMaxY += deltaY;
              break;
            case 'w':
              newMinX += deltaX;
              break;
          }

          // Prevent inverted or too small
          if (newMaxX - newMinX < 5) newMaxX = newMinX + 5;
          if (newMaxY - newMinY < 5) newMaxY = newMinY + 5;

          const scaleX = (newMaxX - newMinX) / (maxX - minX || 1);
          const scaleY = (newMaxY - newMinY) / (maxY - minY || 1);

          newElement.points = points.map((p: Point) => ({
            x: newMinX + (p.x - minX) * scaleX,
            y: newMinY + (p.y - minY) * scaleY,
          }));
          newElement.x = newMinX;
          newElement.y = newMinY;
          newElement.width = newMaxX - newMinX;
          newElement.height = newMaxY - newMinY;
          return newElement;
        }

        // Handle arrow and line
        if (element.type === 'arrow' || element.type === 'line') {
          const origStart = (originalElement as any).startPoint;
          const origEnd = (originalElement as any).endPoint;
          let startPt = { ...origStart };
          let endPt = { ...origEnd };

          switch (direction) {
            case 'se':
              startPt.x += deltaX;
              startPt.y += deltaY;
              break;
            case 's':
              startPt.y += deltaY;
              break;
            case 'sw':
              endPt.x += deltaX;
              startPt.y += deltaY;
              break;
            case 'w':
              endPt.x += deltaX;
              break;
            case 'nw':
              endPt.x += deltaX;
              endPt.y += deltaY;
              break;
            case 'n':
              endPt.y += deltaY;
              break;
            case 'ne':
              startPt.x += deltaX;
              endPt.y += deltaY;
              break;
            case 'e':
              startPt.x += deltaX;
              break;
          }

          // Prevent too small
          if (Math.abs(endPt.x - startPt.x) < 5) endPt.x = startPt.x + Math.sign(endPt.x - startPt.x || 1) * 5;
          if (Math.abs(endPt.y - startPt.y) < 5) endPt.y = startPt.y + Math.sign(endPt.y - startPt.y || 1) * 5;

          newElement.startPoint = startPt;
          newElement.endPoint = endPt;
          newElement.x = Math.min(startPt.x, endPt.x);
          newElement.y = Math.min(startPt.y, endPt.y);
          newElement.width = Math.abs(endPt.x - startPt.x);
          newElement.height = Math.abs(endPt.y - startPt.y);
          return newElement;
        }

        // Default: shapes
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

  const translateElements = (deltaX: number, deltaY: number) => {
    setElements(prevElements => {
      return prevElements.map(element => {
        if (!selectedElementIds.includes(element.id)) return element;

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

  const getCoordinates = (event: React.MouseEvent<HTMLCanvasElement>): Point => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };

    const rect = canvas.getBoundingClientRect();
    return {
      x: (event.clientX - rect.left - panOffset.x) / scale,
      y: (event.clientY - rect.top - panOffset.y) / scale
    };
  };

  const createElement = (type: ElementType, start: Point): DrawElement | null => {
    const id = generateId();

    // All elements can have text, so always call onTextEdit if tool is 'text'
    if (type === 'text') {
      const textElement: DrawElement = {
        id,
        type: 'text',
        x: start.x,
        y: start.y,
        width: 200,
        height: 24,
        angle: 0,
        style: { ...defaultStyle },
        isSelected: true,
        text: ''
      };
      onTextEdit(textElement as TextElement);
      return textElement;
    }

    // For other types, create the element and call onTextEdit if tool is 'text'
    let element: DrawElement | null = null;
    switch (type) {
      case 'freedraw':
        element = {
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
          text: ''
        };
        break;
      case 'rectangle':
        element = {
          id,
          type: 'rectangle',
          x: start.x,
          y: start.y,
          width: 0,
          height: 0,
          angle: 0,
          style: { ...defaultStyle },
          isSelected: false,
          text: ''
        };
        break;
      case 'ellipse':
        element = {
          id,
          type: 'ellipse',
          x: start.x,
          y: start.y,
          width: 0,
          height: 0,
          angle: 0,
          style: { ...defaultStyle },
          isSelected: false,
          text: ''
        };
        break;
      case 'arrow':
        element = {
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
          text: ''
        };
        break;
      case 'line':
        element = {
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
          text: ''
        };
        break;
      case 'diamond':
        element = {
          id,
          type: 'diamond',
          x: start.x,
          y: start.y,
          width: 0,
          height: 0,
          angle: 0,
          style: { ...defaultStyle },
          isSelected: false,
          text: ''
        };
        break;
      case 'rhombus':
        element = {
          id,
          type: 'rhombus',
          x: start.x,
          y: start.y,
          width: 0,
          height: 0,
          angle: 0,
          style: { ...defaultStyle },
          isSelected: false,
          text: ''
        };
        break;
      default:
        return null;
    }

    // If the tool is 'text', trigger text editing for any shape
    if (tool === 'text' && element) {
      element.isSelected = true;
      onTextEdit(element as TextElement);
    }

    return element;
  };

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

  const rotateElements = (currentPoint: Point) => {
    if (selectedElementIds.length === 0 || !rotationStartPoint) return;

    const selectedElements = elements.filter(el => selectedElementIds.includes(el.id));
    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
    selectedElements.forEach(el => {
      const rotatedPoints = getRotatedCorners(el);
      rotatedPoints.forEach(p => {
        minX = Math.min(minX, p.x);
        minY = Math.min(minY, p.y);
        maxX = Math.max(maxX, p.x);
        maxY = Math.max(maxY, p.y);
      });
    });
    const centerX = minX + (maxX - minX) / 2;
    const centerY = minY + (maxY - minY) / 2;

    const prevAngle = Math.atan2(rotationStartPoint.y - centerY, rotationStartPoint.x - centerX);
    const currentAngle = Math.atan2(currentPoint.y - centerY, currentPoint.x - centerX);
    const angleDelta = currentAngle - prevAngle;

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
      setRotationStartPoint(currentPoint);
    }
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
    } else if (selectedElementIds.length > 0 &&
      findElementAtPosition(point)?.id &&
      selectedElementIds.includes(findElementAtPosition(point)!.id)) {
      canvas.style.cursor = 'move';
    } else {
      canvas.style.cursor = tool === 'selection' ? 'default' : 'crosshair';
    }
  };

  const handleMouseDown = (event: React.MouseEvent<HTMLCanvasElement>) => {
    const point = getCoordinates(event);
    setStartPoint(point);

    if (tool === 'eraser') {
      setIsDrawing(true);
      return;
    }

    const isMouseOnRotationHandle = checkRotateHandle(point);
    if (selectedElementIds.length > 0 && isMouseOnRotationHandle) {
      setIsRotating(true);
      setRotationStartPoint(point);
      return;
    }

    const resizeDir = checkResizeHandle(point);
    if (resizeDir && selectedElementIds.length > 0) {
      setIsResizing(true);
      setResizeDirection(resizeDir);
      setOriginalElements(elements.filter(el => selectedElementIds.includes(el.id)));
      return;
    }

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

  const handleMouseMove = (event: React.MouseEvent<HTMLCanvasElement>) => {
    const currentPoint = getCoordinates(event);
    const deltaX = currentPoint.x - startPoint.x;
    const deltaY = currentPoint.y - startPoint.y;

    if (isRotating) {
      rotateElements(currentPoint);
      redrawCanvas();
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

    if (tool === 'eraser' && isDrawing) {
      let elementsChanged = false;

      // Check all elements for intersection with eraser
      setElements(prevElements => {
        return prevElements.map(element => {
          // For other elements, check if current point is inside the element
          if (
            currentPoint.x >= element.x &&
            currentPoint.x <= element.x + element.width &&
            currentPoint.y >= element.y &&
            currentPoint.y <= element.y + element.height
          ) {
            elementsChanged = true;
            return { ...element, isMarkedForDeletion: true };
          }
          
          return element;
        });
      });

      if (elementsChanged) {
        redrawCanvas();
      }
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
    drawCurrentElement(currentElement);
  };

  const drawCurrentElement = (currentElement: DrawElement | null) => {
    if (!currentElement) return;
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

  const updateElement = (element: DrawElement, currentPoint: Point, startPoint: Point): DrawElement => {
    const updated = { ...element };

    switch (element.type) {
      case 'freedraw': {
        // Add the new point to the points array
        const points = [...(element.points || []), currentPoint];
        // Update bounding box
        const xs = points.map(p => p.x);
        const ys = points.map(p => p.y);
        updated.points = points;
        updated.x = Math.min(...xs);
        updated.y = Math.min(...ys);
        updated.width = Math.max(...xs) - updated.x;
        updated.height = Math.max(...ys) - updated.y;
        break;
      }

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

  const handleMouseUp = () => {
    if (tool === 'eraser' && isDrawing) {
      // Remove elements marked for deletion (including freedraw)
      setElements(prevElements => prevElements.filter(el => !el.isMarkedForDeletion));
      setIsDrawing(false);
      return;
    }
    if (isRotating) {
      setIsRotating(false);
      setRotationStartPoint(null);
    }
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
      onDoubleClick={handleDoubleClick}
    />
  );
};

export default Canvas;