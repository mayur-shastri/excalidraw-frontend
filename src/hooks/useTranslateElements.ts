import { useState } from "react";
import { useCanvasContext } from "../contexts/CanvasContext/CanvasContext";
import { TranslatingStartState } from "../types";

export function useTranslateElements() {
  const {
    setElements,
    selectedElementIds,
    selectionBox,
    setSelectionBox,
    connections,
  } = useCanvasContext();

  const [translationStartPositions, setTranslationStartPositions] =
    useState<Record<string, TranslatingStartState>>({});

  const translateElements = (deltaX: number, deltaY: number) => {
    setElements(prevElements => {
      return prevElements.map(element => {
        if(element.isDeleted) return element;
        const isSelected = selectedElementIds.includes(element.id);

        // Case 1: Selected element (move normally)
        if (isSelected) {
          const original = translationStartPositions[element.id] || {
            x: element.x,
            y: element.y,
            ...(element.type === "arrow" && {
              startPoint: element.startPoint,
              endPoint: element.endPoint,
            }),
          };

          return {
            ...element,
            x: original.x + deltaX,
            y: original.y + deltaY,
            ...(element.type === "arrow" && {
              startPoint: {
                x: original.startPoint.x + deltaX,
                y: original.startPoint.y + deltaY,
              },
              endPoint: {
                x: original.endPoint.x + deltaX,
                y: original.endPoint.y + deltaY,
              },
            }),
          };
        }

        // Case 2: Connected arrow — update endpoint positions if start or end element is moving
        if (element.type === "arrow") {
          const connection = connections.find(c => c.arrowElementId === element.id);
          if (!connection) return element;

          const startEl = prevElements.find(el => el.id === connection.startElementId);
          const endEl = prevElements.find(el => el.id === connection.endElementId);

          const getConnectedPoint = (el, angle) => {
            const cx = el.x + el.width / 2;
            const cy = el.y + el.height / 2;
            const radiusX = el.width / 2;
            const radiusY = el.height / 2;
            return {
              x: cx + radiusX * Math.cos(angle),
              y: cy + radiusY * Math.sin(angle),
            };
          };

          const newStart = (startEl && selectedElementIds.includes(startEl.id) && connection.startAngle !== undefined)
            ? getConnectedPoint(startEl, connection.startAngle)
            : element.startPoint;

          const newEnd = (endEl && selectedElementIds.includes(endEl.id) && connection.endAngle !== undefined)
            ? getConnectedPoint(endEl, connection.endAngle)
            : element.endPoint;

          return {
            ...element,
            startPoint: newStart,
            endPoint: newEnd,
          };
        }

        // Case 3: Not selected, not connected → return as-is
        return element;
      });
    });

    // Update selection box if needed
    if (selectionBox) {
      setSelectionBox(prev => prev ? {
        ...prev,
        startX: prev.startX + deltaX,
        startY: prev.startY + deltaY,
      } : null);
    }
  };

  return { translateElements, translationStartPositions, setTranslationStartPositions };
}
