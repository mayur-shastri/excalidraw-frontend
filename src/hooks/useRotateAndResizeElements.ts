import { useState } from "react";
import { useCanvasContext } from "../contexts/CanvasContext/CanvasContext";
import { DrawElement, Point, ResizeDirection } from "../types";
import { getRotatedCorners } from "../utils/geometry";

const ROTATION_THRESHOLD = 0.01;

function getConnectedPoint(el: DrawElement, angle: number): Point {
    const cx = el.x + el.width / 2;
    const cy = el.y + el.height / 2;
    const rx = el.width / 2;
    const ry = el.height / 2;

    return {
        x: cx + rx * Math.cos(angle),
        y: cy + ry * Math.sin(angle),
    };
}

export function useRotateAndResizeElements() {
    const {
        selectedElementIds,
        elements,
        setElements,
        connections,
    } = useCanvasContext();

    const [originalElements, setOriginalElements] = useState<DrawElement[]>([]);
    const [rotationStartPoint, setRotationStartPoint] = useState<Point | null>(null);

    const resizeElements = (direction: ResizeDirection, start: Point, current: Point) => {
        if (!direction || selectedElementIds.length === 0) return;

        const deltaX = current.x - start.x;
        const deltaY = current.y - start.y;

        setElements(prevElements => {
            return prevElements.map(element => {
                const isSelected = selectedElementIds.includes(element.id);

                // Arrow auto-adjustment
                if (element.type === 'arrow') {
                    const connection = connections.find(c => c.arrowElementId === element.id);
                    if (!connection) return element;

                    const startEl = prevElements.find(e => e.id === connection.startElementId);
                    const endEl = prevElements.find(e => e.id === connection.endElementId);

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

                if (!isSelected) return element;
                const originalElement = originalElements.find(el => el.id === element.id);
                if (!originalElement) return element;

                const newElement = { ...element };
                const { x: origX, y: origY, width: origW, height: origH } = originalElement;

                if (element.type === 'freedraw') {
                    // handle freedraw same as before (unchanged)
                    // ...
                    return newElement;
                }

                if (element.type === 'line' || element.type === 'arrow') {
                    // Direct resizing of lines
                    // ...
                    return newElement;
                }

                // Default shape resize
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
            setElements(prevElements => {
                return prevElements.map(el => {
                    const isSelected = selectedElementIds.includes(el.id);

                    // Arrows update based on connected element rotation
                    if (el.type === 'arrow') {
                        const connection = connections.find(c => c.arrowElementId === el.id);
                        if (!connection) return el;

                        const startEl = prevElements.find(e => e.id === connection.startElementId);
                        const endEl = prevElements.find(e => e.id === connection.endElementId);

                        const newStart = (startEl && isSelected && connection.startAngle !== undefined)
                            ? getConnectedPoint(startEl, connection.startAngle)
                            : el.startPoint;

                        const newEnd = (endEl && isSelected && connection.endAngle !== undefined)
                            ? getConnectedPoint(endEl, connection.endAngle)
                            : el.endPoint;

                        return {
                            ...el,
                            startPoint: newStart,
                            endPoint: newEnd,
                        };
                    }

                    if (!isSelected) return el;

                    const cx = el.x + el.width / 2;
                    const cy = el.y + el.height / 2;

                    const dx = cx - centerX;
                    const dy = cy - centerY;

                    const rotatedCx = centerX + (dx * Math.cos(angleDelta) - dy * Math.sin(angleDelta));
                    const rotatedCy = centerY + (dx * Math.sin(angleDelta) + dy * Math.cos(angleDelta));

                    const newX = rotatedCx - el.width / 2;
                    const newY = rotatedCy - el.height / 2;

                    return {
                        ...el,
                        x: newX,
                        y: newY,
                        angle: ((el.angle || 0) + angleDelta) % (2 * Math.PI),
                    };
                });
            });

            setRotationStartPoint(currentPoint);
        }
    };

    return {
        resizeElements,
        rotateElements,
        originalElements,
        setOriginalElements,
        rotationStartPoint,
        setRotationStartPoint,
    };
}