import { useState } from "react";
import { useCanvasContext } from "../contexts/CanvasContext/CanvasContext";
import { DrawElement, Point, ResizeDirection } from "../types";
import { getRotatedCorners } from "../utils/geometry";

const ROTATION_THRESHOLD = 0.01;

export function useRotateAndResizeElements() {
    const {
        selectedElementIds,
        elements,
        setElements,

    } = useCanvasContext();

    const [originalElements, setOriginalElements] = useState<DrawElement[]>([]);
    const [rotationStartPoint, setRotationStartPoint] = useState<Point | null>(null);

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

    return {resizeElements, rotateElements, originalElements, setOriginalElements, rotationStartPoint, setRotationStartPoint};

}

