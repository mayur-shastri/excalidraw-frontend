import { useCanvasContext } from "../contexts/CanvasContext/CanvasContext";
import { ArrowElement, DrawElement, FreedrawElement, LineElement, Point, ResizeHandle, TextElement } from "../types";

export const useRender = () => {

    const { elements, connections } = useCanvasContext();

    const renderElement = (
        ctx: CanvasRenderingContext2D,
        element: DrawElement,
        multiSelectionFlag: boolean) => {
        const { style, isSelected } = element;

        ctx.strokeStyle = style.strokeColor;
        ctx.fillStyle = style.backgroundColor;
        ctx.lineWidth = style.strokeWidth;
        ctx.globalAlpha = style.opacity;

        ctx.save();

        if (element.angle !== 0) {
            const centerX = element.x + element.width / 2;
            const centerY = element.y + element.height / 2;

            ctx.translate(centerX, centerY);
            ctx.rotate(element.angle);
            ctx.translate(-centerX, -centerY);
        }

        switch (element.type) {
            case 'freedraw':
                renderFreedraw(ctx, element as FreedrawElement);
                break;
            case 'rectangle':
                renderRectangle(ctx, element);
                break;
            case 'ellipse':
                renderEllipse(ctx, element);
                break;
            case 'arrow':
                renderArrow(ctx, element as ArrowElement);
                break;
            case 'line':
                renderLine(ctx, element as LineElement);
                break;
            case 'diamond':
                renderDiamond(ctx, element);
                break;
            case 'rhombus':
                renderRhombus(ctx, element);
                break;
            case 'text':
                renderText(ctx, element as TextElement);
                break;
        }

        // Draw centered text for all elements except freedraw and line (unless you want it for those too)
        if (
            element.text &&
            element.text.trim() !== '' &&
            element.type !== 'freedraw' &&
            element.type !== 'line'
        ) {
            renderCenteredText(ctx, element);
        }

        if (isSelected) {
            drawSelectionOutline(ctx, element, multiSelectionFlag);
        }

        ctx.restore();
    };

    const renderText = (ctx: CanvasRenderingContext2D, element: TextElement) => {
        // For text elements, center the text in the bounding box
        renderCenteredText(ctx, element);
    };

    const renderFreedraw = (ctx: CanvasRenderingContext2D, element: FreedrawElement) => {
        const { points } = element;

        if (points.length < 2) return;

        ctx.beginPath();
        ctx.moveTo(points[0].x, points[0].y);

        for (let i = 1; i < points.length; i++) {
            ctx.lineTo(points[i].x, points[i].y);
        }

        ctx.stroke();
    };
    const getProportionalRadius = (width: number, height: number, base: number = 12) => {
        // Use the smaller dimension to scale the radius, clamp to avoid too large radius
        const minDim = Math.min(width, height);
        return Math.max(2, Math.min(base, minDim / 4));
    };

    const renderRectangle = (ctx: CanvasRenderingContext2D, element: DrawElement) => {
        const { x, y, width, height, style } = element;
        const radius = getProportionalRadius(width, height, style.cornerRadius ?? 12);

        ctx.beginPath();
        // Draw rounded rectangle
        ctx.moveTo(x + radius, y);
        ctx.lineTo(x + width - radius, y);
        ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
        ctx.lineTo(x + width, y + height - radius);
        ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
        ctx.lineTo(x + radius, y + height);
        ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
        ctx.lineTo(x, y + radius);
        ctx.quadraticCurveTo(x, y, x + radius, y);
        ctx.closePath();

        if (style.fillStyle === 'solid') {
            ctx.fill();
        }

        ctx.stroke();
    };

    const renderEllipse = (ctx: CanvasRenderingContext2D, element: DrawElement) => {
        const { x, y, width, height, style } = element;

        const centerX = x + width / 2;
        const centerY = y + height / 2;
        const radiusX = width / 2;
        const radiusY = height / 2;

        ctx.beginPath();
        ctx.ellipse(centerX, centerY, radiusX, radiusY, 0, 0, 2 * Math.PI);

        if (style.fillStyle === 'solid') {
            ctx.fill();
        }

        ctx.stroke();
    };

    const renderDiamond = (ctx: CanvasRenderingContext2D, element: DrawElement) => {
        const { x, y, width, height, style } = element;
        const radius = getProportionalRadius(width, height, style.cornerRadius ?? 12);

        // Calculate diamond points
        const top = { x: x + width / 2, y: y };
        const right = { x: x + width, y: y + height / 2 };
        const bottom = { x: x + width / 2, y: y + height };
        const left = { x: x, y: y + height / 2 };

        ctx.beginPath();
        // Move to top, then draw lines with quadratic curves for rounded corners
        ctx.moveTo(top.x - radius, top.y + radius);
        ctx.quadraticCurveTo(top.x, top.y, top.x + radius, top.y + radius);

        ctx.lineTo(right.x - radius, right.y - radius);
        ctx.quadraticCurveTo(right.x, right.y, right.x - radius, right.y + radius);

        ctx.lineTo(bottom.x + radius, bottom.y - radius);
        ctx.quadraticCurveTo(bottom.x, bottom.y, bottom.x - radius, bottom.y - radius);

        ctx.lineTo(left.x + radius, left.y + radius);
        ctx.quadraticCurveTo(left.x, left.y, left.x + radius, left.y - radius);

        ctx.closePath();

        if (style.fillStyle === 'solid') {
            ctx.fill();
        }

        ctx.stroke();
    };

    const renderRhombus = (ctx: CanvasRenderingContext2D, element: DrawElement) => {
        const { x, y, width, height, style } = element;
        const skew = width * 0.25;
        const radius = getProportionalRadius(width, height, style.cornerRadius ?? 12);

        // Rhombus points
        const topLeft = { x: x + skew, y: y };
        const topRight = { x: x + width, y: y };
        const bottomRight = { x: x + width - skew, y: y + height };
        const bottomLeft = { x: x, y: y + height };

        ctx.beginPath();
        ctx.moveTo(topLeft.x + radius, topLeft.y);
        ctx.lineTo(topRight.x - radius, topRight.y);
        ctx.quadraticCurveTo(topRight.x, topRight.y, topRight.x, topRight.y + radius);

        ctx.lineTo(bottomRight.x + radius, bottomRight.y - radius);
        ctx.quadraticCurveTo(bottomRight.x, bottomRight.y, bottomRight.x - radius, bottomRight.y);

        ctx.lineTo(bottomLeft.x + radius, bottomLeft.y);
        ctx.quadraticCurveTo(bottomLeft.x, bottomLeft.y, bottomLeft.x, bottomLeft.y - radius);

        ctx.lineTo(topLeft.x - radius, topLeft.y + radius);
        ctx.quadraticCurveTo(topLeft.x, topLeft.y, topLeft.x + radius, topLeft.y);

        ctx.closePath();

        if (style.fillStyle === 'solid') {
            ctx.fill();
        }

        ctx.stroke();
    };
    
    const renderArrow = (ctx: CanvasRenderingContext2D, element: ArrowElement) => {
        const { startPoint, endPoint, style, direction, startSide, endSide } = element;
        const strokeWidth = style.strokeWidth || 2;
        const color = style.strokeColor || "#000000";
        const arrowSize = Math.max(8, strokeWidth * 2);

        ctx.save();
        ctx.strokeStyle = color;
        ctx.fillStyle = color;
        ctx.lineWidth = strokeWidth;
        ctx.lineJoin = "round";
        ctx.lineCap = "round";

        const conn = connections.find(c => c.id === element.connectionId);
        const startElement = elements.find(el => el.id === conn?.startElementId);
        const endElement = elements.find(el => el.id === conn?.endElementId);

        const startOutside = getPointOutsideElement(startElement, startPoint, endPoint, startSide);
        const endOutside = getPointOutsideElement(endElement, endPoint, startPoint, endSide);

        const controlPoints = calculateSmartControlPoints(
            startOutside,
            endOutside,
            startElement || null,
            endElement || null,
            startSide,
            endSide,
            direction
        );


        // --- Draw Path ---
        ctx.beginPath();
        ctx.moveTo(startOutside.x, startOutside.y);

        // Draw through all control points
        for (const pt of controlPoints) {
            ctx.lineTo(pt.x, pt.y);
        }

        // Final segment to end
        ctx.lineTo(endOutside.x, endOutside.y);

        ctx.stroke();

        // --- Arrowhead ---
        let arrowAngle: number;

        if (endSide) {
            switch (endSide) {
                case 'top': arrowAngle = Math.PI / 2; break;
                case 'bottom': arrowAngle = -Math.PI / 2; break;
                case 'left': arrowAngle = 0; break;
                case 'right': arrowAngle = Math.PI; break;
                default: arrowAngle = 0;
            }
        } else {
            const last = controlPoints.length > 0
                ? controlPoints[controlPoints.length - 1]
                : startOutside;
            const dx = endOutside.x - last.x;
            const dy = endOutside.y - last.y;
            arrowAngle = Math.atan2(dy, dx);
        }

        drawModernArrowhead(ctx, endOutside, arrowAngle, arrowSize);

        // --- Optional Text ---
        if (element.text?.trim()) {
            renderCenteredText(ctx, {
                ...element,
                startPoint: startOutside,
                endPoint: endOutside
            });
        }

        ctx.restore();
    };


    function getPointOutsideElement(
        element: DrawElement | undefined,
        fromPoint: Point,
        toPoint: Point,
        forceSide?: 'top' | 'bottom' | 'left' | 'right'
    ): Point {
        if (!element) return fromPoint;
        const { x, y, width, height } = element;
        const padding = 6;

        switch (forceSide) {
            case 'top':
                return { x: x + width / 2, y: y - padding };
            case 'bottom':
                return { x: x + width / 2, y: y + height + padding };
            case 'left':
                return { x: x - padding, y: y + height / 2 };
            case 'right':
                return { x: x + width + padding, y: y + height / 2 };
            default: {
                // fallback to geometric vector logic
                const cx = x + width / 2;
                const cy = y + height / 2;
                const dx = toPoint.x - cx;
                const dy = toPoint.y - cy;
                const len = Math.sqrt(dx * dx + dy * dy) || 1;
                const nx = dx / len;
                const ny = dy / len;

                const sides = [
                    { x1: x - padding, y1: y - padding, x2: x + width + padding, y2: y - padding }, // top
                    { x1: x + width + padding, y1: y - padding, x2: x + width + padding, y2: y + height + padding }, // right
                    { x1: x + width + padding, y1: y + height + padding, x2: x - padding, y2: y + height + padding }, // bottom
                    { x1: x - padding, y1: y + height + padding, x2: x - padding, y2: y - padding }, // left
                ];
                for (const side of sides) {
                    const intersect = lineIntersection(
                        cx, cy, cx + nx * 9999, cy + ny * 9999,
                        side.x1, side.y1, side.x2, side.y2
                    );
                    if (intersect) return intersect;
                }
            }
                return fromPoint;
        }
    }

    // Returns intersection point of two lines, or null if parallel
    function lineIntersection(
        x1: number, y1: number, x2: number, y2: number,
        x3: number, y3: number, x4: number, y4: number
    ): { x: number, y: number } | null {
        const denom = (x1 - x2) * (y3 - y4) - (y1 - y2) * (x3 - x4);
        if (denom === 0) return null;
        const px = ((x1 * y2 - y1 * x2) * (x3 - x4) - (x1 - x2) * (x3 * y4 - y3 * x4)) / denom;
        const py = ((x1 * y2 - y1 * x2) * (y3 - y4) - (y1 - y2) * (x3 * y4 - y3 * x4)) / denom;
        // Check if intersection is within the segment
        if (
            Math.min(x3, x4) - 0.1 <= px && px <= Math.max(x3, x4) + 0.1 &&
            Math.min(y3, y4) - 0.1 <= py && py <= Math.max(y3, y4) + 0.1
        ) {
            return { x: px, y: py };
        }
        return null;
    }

    const getElementCenterPoint = (element: DrawElement | null): Point | null => {
        if (!element) return null;
        const { x, y, width, height } = element;
        return { x: x + width / 2, y: y + height / 2 };
    }

    function calculateSmartControlPoints(
        start: Point,
        end: Point,
        startElement: DrawElement | null,
        endElement: DrawElement | null,
        startSide: 'top' | 'right' | 'left' | 'bottom' | null,
        endSide: 'top' | 'right' | 'left' | 'bottom' | null,
        direction: 'up' | 'down' | 'left' | 'right' | null,
    ): Point[] {

        const OFFSET = 15;

        // Use a Set to collect unique control points as JSON strings
        const controlPointSet = new Set<string>();

        const addPoint = (pt: Point) => {
            controlPointSet.add(JSON.stringify(pt));
        };

        const startElementCenter = getElementCenterPoint(startElement);
        const endElementCenter = getElementCenterPoint(endElement);

        if ((!startElement && !endElement)) {
            console.log("0");
            if (direction === 'left' || direction === 'right') {
                addPoint({ x: start.x, y: end.y });
            }
            else if (direction === 'up' || direction === 'down') {
                addPoint({ x: end.x, y: start.y });
            }
            return Array.from(controlPointSet).map(str => JSON.parse(str));
        }
        if (startElement) {
            if (
                startElementCenter &&
                (
                    // start and end are on the opposite sides of the center line (vertical or horizontal)
                    (startSide === 'top' && end.y > startElementCenter.y) ||
                    (startSide === 'bottom' && end.y < startElementCenter.y) ||
                    (startSide === 'left' && end.x > startElementCenter.x) ||
                    (startSide === 'right' && end.x < startElementCenter.x)
                )
            ) {
                console.log("1");
                // Opposite side: route around the element
                if (startSide === 'top' || startSide === 'bottom') {
                    addPoint({ x: start.x, y: start.y + (startSide === 'top' ? -OFFSET : OFFSET) });
                    addPoint({ x: (end.x + start.x)/2, y: start.y + (startSide === 'top' ? -OFFSET : OFFSET) });
                } else if (startSide === 'left' || startSide === 'right') {
                    addPoint({ x: start.x + (startSide === 'left' ? -OFFSET : OFFSET), y: start.y });
                    addPoint({ x: start.x + (startSide === 'left' ? -OFFSET : OFFSET), y: end.y });
                }
            }
            else if (
                startElementCenter &&
                (
                    (startSide === 'top' && end.y < startElementCenter.y) ||
                    (startSide === 'bottom' && end.y > startElementCenter.y) ||
                    (startSide === 'left' && end.x < startElementCenter.x) ||
                    (startSide === 'right' && end.x > startElementCenter.x)
                )
            ) {
                console.log("2");
                if (startSide === 'top' || startSide === 'bottom') {
                    addPoint({ x: start.x, y: (start.y + end.y)/2 });
                } else if (startSide === 'left' || startSide === 'right') {
                    addPoint({ x: (start.x + end.x)/2, y: start.y });
                }
            }
        }
        if (endElement) {
            if (
                endElementCenter &&
                (
                    // End is on the opposite side of the center (should route around)
                    (endSide === 'top' && start.y > endElementCenter.y) ||
                    (endSide === 'bottom' && start.y < endElementCenter.y) ||
                    (endSide === 'left' && start.x > endElementCenter.x) ||
                    (endSide === 'right' && start.x < endElementCenter.x)
                )
            ) {
                console.log("3");
                // Opposite side: route around the end element
                if (endSide === 'top' || endSide === 'bottom') {
                    addPoint({ x: (start.x + end.x)/2, y: end.y + (endSide === 'top' ? -OFFSET : OFFSET) });
                    addPoint({ x: end.x, y: end.y + (endSide === 'top' ? -OFFSET : OFFSET) });
                } else if (endSide === 'left' || endSide === 'right') {
                    addPoint({ x: end.x + (endSide === 'left' ? OFFSET : -OFFSET), y: start.y });
                    addPoint({ x: end.x + (endSide === 'left' ? OFFSET : -OFFSET), y: end.y });
                }
            } else if (
                endElementCenter &&
                (
                    // End is in the expected direction (directly approachable)
                    (endSide === 'top' && start.y < endElementCenter.y) ||
                    (endSide === 'bottom' && start.y > endElementCenter.y) ||
                    (endSide === 'left' && start.x < endElementCenter.x) ||
                    (endSide === 'right' && start.x > endElementCenter.x)
                )
            ) {
                console.log("4");
                if (endSide === 'top' || endSide === 'bottom') {
                    addPoint({ x: (start.x + end.x)/2, y: end.y + (endSide === 'top' ? -OFFSET : OFFSET) });
                    addPoint({ x: end.x, y: end.y + (endSide === 'top' ? -OFFSET : OFFSET) });
                } else if (endSide === 'left' || endSide === 'right') {
                    addPoint({ x: (start.x + end.x)/2, y: end.y });
                }
            }
        }
        return Array.from(controlPointSet).map(str => JSON.parse(str));
    }

    function drawModernArrowhead(
        ctx: CanvasRenderingContext2D,
        point: Point,
        angle: number,
        size: number
    ) {
        ctx.save();
        ctx.translate(point.x, point.y);
        ctx.rotate(angle);

        ctx.beginPath();
        // Sleeker arrowhead: longer and narrower
        ctx.moveTo(0, 0);
        ctx.lineTo(-size * 1.2, -size * 0.45);
        ctx.lineTo(-size * 0.7, 0);
        ctx.lineTo(-size * 1.2, size * 0.45);
        ctx.closePath();
        ctx.fill();

        ctx.restore();
    }

    const renderLine = (ctx: CanvasRenderingContext2D, element: LineElement) => {
        const { startPoint, endPoint } = element;

        ctx.beginPath();
        ctx.moveTo(startPoint.x, startPoint.y);
        ctx.lineTo(endPoint.x, endPoint.y);
        ctx.stroke();

        // Draw centered text for line if present
        if (element.text && element.text.trim() !== '') {
            renderCenteredText(ctx, element);
        }
    };

    const renderCenteredText = (ctx: CanvasRenderingContext2D, element: any) => {
        const { x, y, width, height, style, text } = element;
        if (!text || text.trim() === '') return;

        // Default font settings
        const fontSize = style?.fontSize || 16;
        const fontFamily = style?.fontFamily || 'Arial';
        ctx.font = `${fontSize}px ${fontFamily}`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillStyle = style?.strokeColor || '#000';

        let centerX = x + (width ? width / 2 : 0);
        let centerY = y + (height ? height / 2 : 0);

        // For lines/arrows, center between startPoint and endPoint
        if (element.type === 'line' || element.type === 'arrow') {
            const { startPoint, endPoint } = element;
            centerX = (startPoint.x + endPoint.x) / 2;
            centerY = (startPoint.y + endPoint.y) / 2;
        }

        ctx.fillText(text, centerX, centerY);
    };

    const drawSelectionOutline = (
        ctx: CanvasRenderingContext2D,
        element: DrawElement,
        multiSelectionFlag: boolean,
    ) => {
        // Special case for arrow: only 3 handles (2 at ends, 1 in center)
        if (element.type === "arrow" || element.type === "line") {
            const arrow = element as ArrowElement;
            const { startPoint, endPoint } = arrow;

            // Calculate center point
            const centerX = (startPoint.x + endPoint.x) / 2;
            const centerY = (startPoint.y + endPoint.y) / 2;

            // Draw 3 handles: start, end, center
            const handleSize = 10;
            const handles = [
                { x: startPoint.x, y: startPoint.y },
                { x: centerX, y: centerY },
                { x: endPoint.x, y: endPoint.y },
            ];

            ctx.save();
            ctx.fillStyle = 'white';
            ctx.strokeStyle = '#4285f4';
            ctx.lineWidth = 1.5;
            handles.forEach(handle => {
                ctx.beginPath();
                ctx.arc(handle.x, handle.y, handleSize / 2, 0, 2 * Math.PI);
                ctx.fill();
                ctx.stroke();
            });
            ctx.restore();

            return;
        }

        // Default selection outline for other shapes
        const { x, y, width, height } = element;
        const outlinePadding = 7;
        const outlineRadius = 12;

        // Draw continuous rounded rectangle outline outside the element
        ctx.save();
        ctx.strokeStyle = '#4285f4';
        ctx.lineWidth = 2;
        ctx.setLineDash([]); // continuous

        ctx.beginPath();
        ctx.moveTo(x - outlinePadding + outlineRadius, y - outlinePadding);
        ctx.lineTo(x + width + outlinePadding - outlineRadius, y - outlinePadding);
        ctx.quadraticCurveTo(x + width + outlinePadding, y - outlinePadding, x + width + outlinePadding, y - outlinePadding + outlineRadius);
        ctx.lineTo(x + width + outlinePadding, y + height + outlinePadding - outlineRadius);
        ctx.quadraticCurveTo(x + width + outlinePadding, y + height + outlinePadding, x + width + outlinePadding - outlineRadius, y + height + outlinePadding);
        ctx.lineTo(x - outlinePadding + outlineRadius, y + height + outlinePadding);
        ctx.quadraticCurveTo(x - outlinePadding, y + height + outlinePadding, x - outlinePadding, y + height + outlinePadding - outlineRadius);
        ctx.lineTo(x - outlinePadding, y - outlinePadding + outlineRadius);
        ctx.quadraticCurveTo(x - outlinePadding, y - outlinePadding, x - outlinePadding + outlineRadius, y - outlinePadding);
        ctx.closePath();
        ctx.stroke();
        ctx.restore();

        // Draw resize handles (still at corners/edges, but outside the element)
        const handleSize = 8;
        const handleOffset = outlinePadding;
        const handles: { position: ResizeHandle; x: number; y: number }[] = [
            { position: 'top-left', x: x - handleOffset - handleSize / 2, y: y - handleOffset - handleSize / 2 },
            { position: 'top', x: x + width / 2 - handleSize / 2, y: y - handleOffset - handleSize / 2 },
            { position: 'top-right', x: x + width + handleOffset - handleSize / 2, y: y - handleOffset - handleSize / 2 },
            { position: 'left', x: x - handleOffset - handleSize / 2, y: y + height / 2 - handleSize / 2 },
            { position: 'right', x: x + width + handleOffset - handleSize / 2, y: y + height / 2 - handleSize / 2 },
            { position: 'bottom-left', x: x - handleOffset - handleSize / 2, y: y + height + handleOffset - handleSize / 2 },
            { position: 'bottom', x: x + width / 2 - handleSize / 2, y: y + height + handleOffset - handleSize / 2 },
            { position: 'bottom-right', x: x + width + handleOffset - handleSize / 2, y: y + height + handleOffset - handleSize / 2 },
        ];

        ctx.save();
        ctx.fillStyle = 'white';
        ctx.strokeStyle = '#4285f4';
        ctx.lineWidth = 0.5;

        handles.forEach(handle => {
            ctx.beginPath();
            ctx.rect(handle.x, handle.y, handleSize, handleSize);
            ctx.fill();
            ctx.stroke();
        });
        ctx.restore();

        // Draw rotation handle as a small circle above the top center
        if (!multiSelectionFlag) {
            const rotationHandleY = y - outlinePadding - 20;
            const rotationHandleX = x + width / 2;
            const rotationHandleRadius = 5;

            ctx.save();
            ctx.fillStyle = '#fff';
            ctx.strokeStyle = '#4285f4';
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.arc(rotationHandleX, rotationHandleY, rotationHandleRadius, 0, 2 * Math.PI);
            ctx.fill();
            ctx.stroke();
            ctx.restore();
        }
    };

    return { renderElement };

};