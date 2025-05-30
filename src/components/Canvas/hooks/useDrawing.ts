import { useState } from 'react';
import { DrawElement, Point } from '../../../types';
import { createElement, updateElementCoordinates } from '../utils/elementUtils';
import { getCoordinates } from '../utils/canvasUtils';
import { renderElement } from '../../../utils/renderElements';

export const useDrawing = (
  canvasRef: React.RefObject<HTMLCanvasElement>,
  props: any,
  redrawCanvas: () => void
) => {
  const [currentElement, setCurrentElement] = useState<DrawElement | null>(null);
  const [startPoint, setStartPoint] = useState<Point>({ x: 0, y: 0 });

  const handleDrawingMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const point = getCoordinates(e, canvasRef, props.scale, props.panOffset);
    setStartPoint(point);
    
    // Clear existing selections when starting to draw
    props.setSelectedElementIds([]);
    
    // Create new element based on current tool
    const newElement = createElement(props.tool, point);
    if (newElement) {
      setCurrentElement(newElement);
    }
  };

  const drawCurrentElement = (currentElement : DrawElement | null) => {
        if(!currentElement)
            return null;
        const canvas = canvasRef.current;
        if (!canvas) return;
        
        const ctx = canvas.getContext('2d');
        if (!ctx) return;
        
        ctx.save();
        ctx.translate(props.panOffset.x, props.panOffset.y);
        ctx.scale(props.scale, props.scale);
    
        renderElement(ctx, currentElement);
        
        ctx.restore();
      };
  

  const handleDrawingMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!currentElement) return;
    
    const currentPoint = getCoordinates(e, canvasRef, props.scale, props.panOffset);
    
    // Update the element based on mouse movement
    const updatedElement = updateElementCoordinates(
      currentElement,
      currentPoint,
      startPoint
    );
    
    setCurrentElement(updatedElement);
    redrawCanvas();

    drawCurrentElement(currentElement);

  };

  const handleDrawingMouseUp = () => {
    if (currentElement) {
      // Add the completed element to the elements array
      props.setElements((prev: DrawElement[]) => [...prev, currentElement]);
      // Notify parent component of completion
      props.onElementComplete?.();
      setCurrentElement(null);
    }
  };

  return { 
    handleDrawingMouseDown, 
    handleDrawingMouseMove,
    handleDrawingMouseUp
  };
};