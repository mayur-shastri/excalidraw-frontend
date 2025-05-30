import { DrawElement, Point, ElementType, ArrowElement, LineElement } from '../../../types/index.ts';
import { generateId } from '../../../utils/helpers.ts';
import { defaultStyle } from '../../../constants/index.ts';

export const createElement = (type: ElementType, start: Point): DrawElement | null => {
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

export const findElementAtPosition = (point: Point, elements: DrawElement[]): DrawElement | null => {
  // Iterate in reverse to check elements from front to back
  for (let i = elements.length - 1; i >= 0; i--) {
    const element = elements[i];
    const { x, y, width, height } = element;
    
    // Simple bounding box check
    if (
      point.x >= x && 
      point.x <= x + width && 
      point.y >= y && 
      point.y <= y + height
    ) {
      return element;
    }
  }
  return null;
};

export const findElementsInSelectionBox = (
  selectionBox: {
    startX: number;
    startY: number;
    width: number;
    height: number;
    isActive: boolean;
  } | null,
  elements: DrawElement[]
): string[] => {
  if (!selectionBox || !selectionBox.isActive) return [];
  
  const selectedElements = elements.filter(element => {
    const elementRight = element.x + element.width;
    const elementBottom = element.y + element.height;
    const boxRight = selectionBox.startX + selectionBox.width;
    const boxBottom = selectionBox.startY + selectionBox.height;
    
    return (
      element.x < boxRight &&
      elementRight > selectionBox.startX &&
      element.y < boxBottom &&
      elementBottom > selectionBox.startY
    );
  });
  
  return selectedElements.map(element => element.id);
};

export const updateElementCoordinates = (
  element: DrawElement,
  currentPoint: Point,
  startPoint: Point
): DrawElement => {
  const updatedElement = { ...element };

  switch (element.type) {
    case 'freedraw': {
      updatedElement.points = [...(updatedElement as any).points, currentPoint];
      // Update bounding box
      const points = (updatedElement as any).points;
      let minX = points[0].x;
      let minY = points[0].y;
      let maxX = points[0].x;
      let maxY = points[0].y;
      
      points.forEach((point: Point) => {
        minX = Math.min(minX, point.x);
        minY = Math.min(minY, point.y);
        maxX = Math.max(maxX, point.x);
        maxY = Math.max(maxY, point.y);
      });
      
      updatedElement.x = minX;
      updatedElement.y = minY;
      updatedElement.width = maxX - minX;
      updatedElement.height = maxY - minY;
      break;
    }
    case 'rectangle':
    case 'ellipse':
    case 'diamond':
    case 'rhombus': {
      updatedElement.width = currentPoint.x - startPoint.x;
      updatedElement.height = currentPoint.y - startPoint.y;
      // Handle negative dimensions
      if (updatedElement.width < 0) {
        updatedElement.x = currentPoint.x;
        updatedElement.width = Math.abs(updatedElement.width);
      }
      if (updatedElement.height < 0) {
        updatedElement.y = currentPoint.y;
        updatedElement.height = Math.abs(updatedElement.height);
      }
      break;
    }
    case 'arrow':
    case 'line': {
      (updatedElement as ArrowElement | LineElement).endPoint = currentPoint;
      // Update bounding box
      const startX = (updatedElement as ArrowElement | LineElement).startPoint.x;
      const startY = (updatedElement as ArrowElement | LineElement).startPoint.y;
      const endX = (updatedElement as ArrowElement | LineElement).endPoint.x;
      const endY = (updatedElement as ArrowElement | LineElement).endPoint.y;
      
      updatedElement.x = Math.min(startX, endX);
      updatedElement.y = Math.min(startY, endY);
      updatedElement.width = Math.abs(endX - startX);
      updatedElement.height = Math.abs(endY - startY);
      break;
    }
  }

  return updatedElement;
};