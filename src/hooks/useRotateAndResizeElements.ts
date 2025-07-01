import { useState } from "react";
import { useCanvasContext } from "../contexts/CanvasContext/CanvasContext";
import { ArrowElement, Connection, DrawElement, LineElement, Point, ResizeDirection } from "../types";
import { getRotatedCorners } from "../utils/geometry";

const ROTATION_THRESHOLD = 0.01;

export function useRotateAndResizeElements() {
    const {
        selectedElementIds,
        elements,
        setElements,
        connections,
        setConnections,
    } = useCanvasContext();

    const [originalElements, setOriginalElements] = useState<DrawElement[]>([]);
    const [rotationStartPoint, setRotationStartPoint] = useState<Point | null>(null);

    const resizeLineOrFreeArrow = (
        element: ArrowElement | LineElement,
        resizeDirection: ResizeDirection,
        current: Point,
    ) => {
        // Use the original startPoint and endPoint from originalElements
        const originalElement = originalElements.find(el => el.id === element.id) as ArrowElement | LineElement | undefined;
        if (!originalElement) return element;
        const { startPoint, endPoint } = originalElement;

        if (resizeDirection === "end") {
            // Move the end point to the current mouse position (relative to the canvas)
            return { ...element, startPoint, endPoint: { ...current } };
        } else {
            // Move the start point to the current mouse position (relative to the canvas)
            return { ...element, startPoint: { ...current }, endPoint };
        }
    }

    const resizeElements = (direction: ResizeDirection, start: Point, current: Point) => {
        if (!direction || selectedElementIds.length === 0) return;

        const deltaX = current.x - start.x;
        const deltaY = current.y - start.y;

        setElements(prevElements => {
            return prevElements.map(element => {
                const isSelected = selectedElementIds.includes(element.id);

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

                if (element.type === 'line') {
                    return resizeLineOrFreeArrow(element, direction, current);
                }

                if (element.type === 'arrow') {
                    const { connectionId } = element;
                    const conn = connections.find(c => c.id === connectionId);
                    if (conn) {
                        const { startElementId, endElementId } = conn;
                        if (!startElementId && !endElementId) {
                            return resizeLineOrFreeArrow(element, direction, current);
                        }
                        else {
                            // DETACH LOGIC
                            const targetElementId = direction === "start" ? conn.startElementId : conn.endElementId;
                            if (!targetElementId) {
                                // If not connected, fallback to normal resize
                                return resizeLineOrFreeArrow(element, direction, current);
                            }
                            const targetElement = elements.find(e => e.id === targetElementId);
                            if (!targetElement) {
                                return element;
                            }

                            // Calculate the new point after resize
                            const original = originalElements.find(el => el.id === element.id) as ArrowElement;
                            const { startPoint, endPoint } = original;
                            const origDx = endPoint.x - startPoint.x;
                            const origDy = endPoint.y - startPoint.y;
                            const origLength = Math.sqrt(origDx * origDx + origDy * origDy);
                            const dirX = origDx / (origLength || 1);
                            const dirY = origDy / (origLength || 1);
                            const projectedDelta = deltaX * dirX + deltaY * dirY;

                            let newPoint: Point;
                            if (direction === "end") {
                                newPoint = {
                                    x: endPoint.x + projectedDelta * dirX,
                                    y: endPoint.y + projectedDelta * dirY,
                                };
                            } else {
                                newPoint = {
                                    x: startPoint.x + projectedDelta * dirX,
                                    y: startPoint.y + projectedDelta * dirY,
                                };
                            }

                            // Check if newPoint is outside the target element's bounding box
                            const withinX = newPoint.x >= targetElement.x && newPoint.x <= targetElement.x + targetElement.width;
                            const withinY = newPoint.y >= targetElement.y && newPoint.y <= targetElement.y + targetElement.height;
                            if (!withinX || !withinY) {
                                // Remove the connection from the arrow and the element
                                setConnections((prev: Connection[]): Connection[] => {
                                    return prev.map(c =>
                                        c.id === conn.id
                                            ? {
                                                ...c,
                                                [direction === "start" ? "startElementId" : "endElementId"]: null,
                                            }
                                            : c
                                    );
                                });
                                setElements(prev => 
                                    prev.map(e => {
                                        if (e.id === targetElementId) {
                                            return {
                                                ...e,
                                                connectionIds: (e.connectionIds || []).filter(id => id !== conn.id),
                                            };
                                        }
                                        if (e.id === element.id && e.type === 'arrow') {
                                            return {
                                                ...e,
                                                startSide: direction === "start" ? null : e.startSide,
                                                endSide: direction === "end" ? null : e.endSide,
                                                startPoint : direction === "start" ? current : e.startPoint,
                                                endPoint : direction === "end" ? current : e.endPoint,
                                            };
                                        }
                                        return e;
                                    })
                                );
                                // Fallback to normal resize
                                return resizeLineOrFreeArrow(element, direction, current);
                            }

                            // If still inside, keep the connection and don't move the point freely
                            return element;
                        }
                    }

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
                        const conn = connections.find(c => c.arrowElementId === el.id);
                        if (!conn) return el;
                        if (!conn.startElementId && !conn.endElementId) {
                            return rotationHelper(el, centerX, centerY, angleDelta, isSelected);
                        }
                        else {
                            // to be continued
                            return el;
                        }
                    }

                    return rotationHelper(el, centerX, centerY, angleDelta, isSelected);

                });
            });

            setRotationStartPoint(currentPoint);
        }
    };

    const rotationHelper = (
        el: DrawElement,
        centerX: number,
        centerY: number,
        angleDelta: number,
        isSelected: boolean) => {
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
    }

    return {
        resizeElements,
        rotateElements,
        originalElements,
        setOriginalElements,
        rotationStartPoint,
        setRotationStartPoint,
    };
}