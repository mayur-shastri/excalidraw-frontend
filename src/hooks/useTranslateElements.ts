import { useState } from "react";
import { useCanvasContext } from "../contexts/CanvasContext/CanvasContext";
import { TranslatingStartState } from "../types";

export function useTranslateElements() {

    const {
        setElements,
        selectedElementIds,
        selectionBox,
        setSelectionBox
    } = useCanvasContext();

    const [translationStartPositions, setTranslationStartPositions] = useState<Record<string, TranslatingStartState>>({});

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

    return {translateElements, translationStartPositions, setTranslationStartPositions};
}