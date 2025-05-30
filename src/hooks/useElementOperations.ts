import { useState, useCallback } from 'react';
import { DrawElement, ElementStyle, Point, ResizeHandle } from '../types';

interface ElementOperationsProps {
  elements: DrawElement[];
  setElements: React.Dispatch<React.SetStateAction<DrawElement[]>>;
  selectedElementIds: string[];
  setSelectedElementIds: React.Dispatch<React.SetStateAction<string[]>>;
}

export const useElementOperations = ({
  elements,
  setElements,
  selectedElementIds,
  setSelectedElementIds,
}: ElementOperationsProps) => {
  const [dragInfo, setDragInfo] = useState<{
    isDragging: boolean;
    startPoint: Point;
    originalElements: DrawElement[];
    handle?: ResizeHandle;
    isRotating?: boolean;
  } | null>(null);

  // Get selected elements
  const selectedElements = elements.filter(el => selectedElementIds.includes(el.id));

  // Delete selected elements
  const deleteSelectedElements = useCallback(() => {
    if (selectedElementIds.length === 0) return;

    setElements(prev => prev.filter(el => !selectedElementIds.includes(el.id)));
    setSelectedElementIds([]);
  }, [selectedElementIds, setElements, setSelectedElementIds]);

  // Update style of selected elements
  const updateStyle = useCallback(
    (styleUpdates: Partial<ElementStyle>) => {
      if (selectedElementIds.length === 0) return;

      setElements(prev =>
        prev.map(el => {
          if (selectedElementIds.includes(el.id)) {
            return {
              ...el,
              style: {
                ...el.style,
                ...styleUpdates,
              },
            };
          }
          return el;
        })
      );
    },
    [selectedElementIds, setElements]
  );

  // Start dragging elements
  const startDragging = useCallback(
    (startPoint: Point, handle?: ResizeHandle, isRotating?: boolean) => {
      if (selectedElementIds.length === 0) return;

      setDragInfo({
        isDragging: true,
        startPoint,
        originalElements: [...elements],
        handle,
        isRotating,
      });
    },
    [selectedElementIds, elements]
  );

  // Handle element dragging and resizing
  const dragElements = useCallback(
    (currentPoint: Point) => {
      if (!dragInfo || !dragInfo.isDragging) return;

      const dx = currentPoint.x - dragInfo.startPoint.x;
      const dy = currentPoint.y - dragInfo.startPoint.y;

      if (dragInfo.isRotating) {
        // Handle rotation
        setElements(prev =>
          prev.map(el => {
            if (selectedElementIds.includes(el.id)) {
              const originalEl = dragInfo.originalElements.find(oe => oe.id === el.id);
              if (!originalEl) return el;

              const centerX = originalEl.x + originalEl.width / 2;
              const centerY = originalEl.y + originalEl.height / 2;
              
              const angle = Math.atan2(
                currentPoint.y - centerY,
                currentPoint.x - centerX
              ) * (180 / Math.PI);

              return {
                ...el,
                angle: angle,
              };
            }
            return el;
          })
        );
      } else if (dragInfo.handle) {
        // Handle resizing
        setElements(prev =>
          prev.map(el => {
            if (selectedElementIds.includes(el.id)) {
              const originalEl = dragInfo.originalElements.find(oe => oe.id === el.id);
              if (!originalEl) return el;

              let newX = originalEl.x;
              let newY = originalEl.y;
              let newWidth = originalEl.width;
              let newHeight = originalEl.height;

              switch (dragInfo.handle) {
                case 'top-left':
                  newX = originalEl.x + dx;
                  newY = originalEl.y + dy;
                  newWidth = originalEl.width - dx;
                  newHeight = originalEl.height - dy;
                  break;
                case 'top':
                  newY = originalEl.y + dy;
                  newHeight = originalEl.height - dy;
                  break;
                case 'top-right':
                  newY = originalEl.y + dy;
                  newWidth = originalEl.width + dx;
                  newHeight = originalEl.height - dy;
                  break;
                case 'right':
                  newWidth = originalEl.width + dx;
                  break;
                case 'bottom-right':
                  newWidth = originalEl.width + dx;
                  newHeight = originalEl.height + dy;
                  break;
                case 'bottom':
                  newHeight = originalEl.height + dy;
                  break;
                case 'bottom-left':
                  newX = originalEl.x + dx;
                  newWidth = originalEl.width - dx;
                  newHeight = originalEl.height + dy;
                  break;
                case 'left':
                  newX = originalEl.x + dx;
                  newWidth = originalEl.width - dx;
                  break;
              }

              return {
                ...el,
                x: newX,
                y: newY,
                width: Math.max(newWidth, 10),
                height: Math.max(newHeight, 10),
              };
            }
            return el;
          })
        );
      } else {
        // Handle moving
        setElements(prev =>
          prev.map(el => {
            if (selectedElementIds.includes(el.id)) {
              const originalEl = dragInfo.originalElements.find(oe => oe.id === el.id);
              if (!originalEl) return el;

              const newElement = { ...el };
              newElement.x = originalEl.x + dx;
              newElement.y = originalEl.y + dy;

              if (newElement.type === 'line' || newElement.type === 'arrow') {
                const typedElement = newElement as any;
                const typedOriginal = originalEl as any;
                
                if (typedElement.startPoint && typedOriginal.startPoint) {
                  typedElement.startPoint = {
                    x: typedOriginal.startPoint.x + dx,
                    y: typedOriginal.startPoint.y + dy,
                  };
                }
                
                if (typedElement.endPoint && typedOriginal.endPoint) {
                  typedElement.endPoint = {
                    x: typedOriginal.endPoint.x + dx,
                    y: typedOriginal.endPoint.y + dy,
                  };
                }
              }

              if (newElement.type === 'freedraw') {
                const freedrawElement = newElement as any;
                const originalFreedraw = originalEl as any;
                
                if (freedrawElement.points && originalFreedraw.points) {
                  freedrawElement.points = originalFreedraw.points.map((p: Point) => ({
                    x: p.x + dx,
                    y: p.y + dy,
                  }));
                }
              }

              return newElement;
            }
            return el;
          })
        );
      }
    },
    [dragInfo, selectedElementIds, setElements]
  );

  // Stop dragging elements
  const stopDragging = useCallback(() => {
    setDragInfo(null);
  }, []);

  return {
    selectedElements,
    deleteSelectedElements,
    updateStyle,
    startDragging,
    dragElements,
    stopDragging,
  };
};