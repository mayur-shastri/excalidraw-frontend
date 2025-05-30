import { useState } from 'react';
import { Point } from '../../../types';
import { findElementAtPosition, findElementsInSelectionBox } from '../utils/elementUtils';
import { getCoordinates } from '../utils/canvasUtils';

export const useSelection = (
  canvasRef: React.RefObject<HTMLCanvasElement>,
  props: any,
  redrawCanvas: () => void
) => {
  const [startPoint, setStartPoint] = useState<Point>({ x: 0, y: 0 });
  const [isDrawingSelection, setIsDrawingSelection] = useState(false);

  const getCoords = (event: React.MouseEvent<HTMLCanvasElement>): Point => {
    return getCoordinates(event, canvasRef, props.scale, props.panOffset);
  };

  const handleSelectionMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const point = getCoords(e);
    setStartPoint(point);
    
    const clickedElement = findElementAtPosition(point, props.elements);
    
    if (clickedElement) {
      // If shift key is pressed, toggle selection
      if (e.shiftKey) {
        if (props.selectedElementIds.includes(clickedElement.id)) {
          props.setSelectedElementIds(prev => 
            prev.filter(id => id !== clickedElement.id)
          );
        } else {
          props.setSelectedElementIds(prev => [...prev, clickedElement.id]);
        }
      } else {
        // If element already selected, keep selection for dragging
        if (!props.selectedElementIds.includes(clickedElement.id)) {
          props.setSelectedElementIds([clickedElement.id]);
        }
      }
    } else {
      // Start selection box
      props.setSelectionBox({
        startX: point.x,
        startY: point.y,
        width: 0,
        height: 0,
        isActive: true,
      });
      setIsDrawingSelection(true);
      
      // Clear selection if not holding shift
      if (!e.shiftKey) {
        props.setSelectedElementIds([]);
      }
    }
  };

  const handleSelectionMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawingSelection) return;
    
    const currentPoint = getCoords(e);
    
    props.setSelectionBox(prev => {
      if (!prev) return null;
      return {
        ...prev,
        width: currentPoint.x - prev.startX,
        height: currentPoint.y - prev.startY,
      };
    });
    
    redrawCanvas();
  };

  const handleSelectionMouseUp = () => {
    if (isDrawingSelection) {
      // Find elements within selection box
      if (props.selectionBox?.isActive) {
        const selectedElements = findElementsInSelectionBox(
          props.selectionBox, 
          props.elements
        );
        
        props.setSelectedElementIds(prev => {
          const newSelection = [...prev];
          selectedElements.forEach(id => {
            if (!newSelection.includes(id)) {
              newSelection.push(id);
            }
          });
          return newSelection;
        });
      }
      
      props.setSelectionBox(null);
      setIsDrawingSelection(false);
    }
  };

  return { 
    handleSelectionMouseDown, 
    handleSelectionMouseMove,
    handleSelectionMouseUp
  };
};