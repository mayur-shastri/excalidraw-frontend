import { useState } from 'react';
import { Point } from '../../../types';
import { checkResizeHandle, getCoordinates } from '../utils/canvasUtils';
import { updateElementCoordinates } from '../utils/elementUtils';

export const useResize = (
  canvasRef: React.RefObject<HTMLCanvasElement>,
  props: any,
  redrawCanvas: () => void
) => {
  const [isResizing, setIsResizing] = useState(false);
  const [resizeDirection, setResizeDirection] = useState<string | null>(null);
  const [originalElements, setOriginalElements] = useState<any[]>([]);
  const [startPoint, setStartPoint] = useState<Point>({ x: 0, y: 0 });

  const getCoords = (event: React.MouseEvent<HTMLCanvasElement>): Point => {
    return getCoordinates(event, canvasRef, props.scale, props.panOffset);
  };

  const resizeElements = (direction: string | null, start: Point, current: Point) => {
    if (!direction || props.selectedElementIds.length === 0) return;

    const deltaX = current.x - start.x;
    const deltaY = current.y - start.y;

    props.setElements((prevElements: any[]) => {
      return prevElements.map(element => {
        if (!props.selectedElementIds.includes(element.id)) return element;

        // Find the original state of the element
        const originalElement = originalElements.find(el => el.id === element.id);
        if (!originalElement) return element;

        const newElement = { ...element };
        const originalX = originalElement.x;
        const originalY = originalElement.y;
        const originalWidth = originalElement.width;
        const originalHeight = originalElement.height;

        switch (direction) {
          case 'nw':
            newElement.x = originalX + deltaX;
            newElement.y = originalY + deltaY;
            newElement.width = originalWidth - deltaX;
            newElement.height = originalHeight - deltaY;
            break;
          case 'n':
            newElement.y = originalY + deltaY;
            newElement.height = originalHeight - deltaY;
            break;
          case 'ne':
            newElement.y = originalY + deltaY;
            newElement.width = originalWidth + deltaX;
            newElement.height = originalHeight - deltaY;
            break;
          case 'e':
            newElement.width = originalWidth + deltaX;
            break;
          case 'se':
            newElement.width = originalWidth + deltaX;
            newElement.height = originalHeight + deltaY;
            break;
          case 's':
            newElement.height = originalHeight + deltaY;
            break;
          case 'sw':
            newElement.x = originalX + deltaX;
            newElement.width = originalWidth - deltaX;
            newElement.height = originalHeight + deltaY;
            break;
          case 'w':
            newElement.x = originalX + deltaX;
            newElement.width = originalWidth - deltaX;
            break;
        }

        // Ensure minimum dimensions
        if (newElement.width < 5) newElement.width = 5;
        if (newElement.height < 5) newElement.height = 5;

        return newElement;
      });
    });
  };

  const handleResizeMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const point = getCoords(e);
    const resizeDir = checkResizeHandle(point, props.selectedElementIds, props.elements, props.scale);
    
    if (resizeDir && props.selectedElementIds.length > 0) {
      setIsResizing(true);
      setResizeDirection(resizeDir);
      setOriginalElements(props.elements.filter((el: any) => props.selectedElementIds.includes(el.id)));
      setStartPoint(point);
      return true;
    }
    return false;
  };

  const handleResizeMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isResizing) return false;
    
    const currentPoint = getCoords(e);
    resizeElements(resizeDirection, startPoint, currentPoint);
    redrawCanvas();
    return true;
  };

  const handleResizeMouseUp = () => {
    if (isResizing) {
      setIsResizing(false);
      setResizeDirection(null);
      setOriginalElements([]);
    }
  };

  return { 
    handleResizeMouseDown, 
    handleResizeMouseMove, 
    handleResizeMouseUp 
  };
};