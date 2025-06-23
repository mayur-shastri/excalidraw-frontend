import { ArrowElement, DrawElement, Point, Connection } from "../../types";

export const renderArrow = (
    ctx: CanvasRenderingContext2D,
    element: ArrowElement,
    connections: Connection[],
    elements: DrawElement[],
) => {
    const { startPoint, endPoint, style, startSide, endSide, connectionId } = element;
    const strokeWidth = style.strokeWidth || 2;
    const color = style.strokeColor || "#000000";
    const arrowSize = Math.max(8, strokeWidth * 2);

    ctx.save();
    ctx.strokeStyle = color;
    ctx.fillStyle = color;
    ctx.lineWidth = strokeWidth;
    ctx.lineJoin = "round";
    ctx.lineCap = "round";

    const conn = connections.find(c => c.id === connectionId);
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
    );

    // --- Draw Sharp Path ---
    ctx.beginPath();
    ctx.moveTo(startOutside.x, startOutside.y);

    // Draw through all control points
    for (const pt of controlPoints) {
        ctx.lineTo(pt.x, pt.y);
    }

    // Final segment to end
    ctx.lineTo(endOutside.x, endOutside.y);

    // Draw Curved Path
    // const points = [startOutside, ...controlPoints, endOutside];

    // ctx.beginPath();
    // ctx.moveTo(points[0].x, points[0].y);

    // for (let i = 1; i < points.length - 1; i++) {
    //     const midX = (points[i].x + points[i + 1].x) / 2;
    //     const midY = (points[i].y + points[i + 1].y) / 2;
    //     ctx.quadraticCurveTo(points[i].x, points[i].y, midX, midY);
    // }

    // // Last segment: curve to final point
    // const penultimate = points[points.length - 2];
    // const last = points[points.length - 1];
    // ctx.quadraticCurveTo(penultimate.x, penultimate.y, last.x, last.y);


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

function calculateSmartControlPoints(
    start: Point,
    end: Point,
    startElement: DrawElement | null,
    endElement: DrawElement | null,
    startSide: 'top' | 'right' | 'left' | 'bottom' | null,
    endSide: 'top' | 'right' | 'left' | 'bottom' | null,
): Point[] {
    const OFFSET = 15;
    const controlPoints: Point[] = [];

    const midX = (start.x + end.x) / 2;
    const midY = (start.y + end.y) / 2;

    const add = (pt: Point) => controlPoints.push(pt);


    if (!startElement && !endElement) {
        // if (direction === 'left' || direction === 'right') {
        //     // add({ x: midX, y: start.y });
        //     add({ x: midX, y: end.y });
        // } else if (direction === 'up' || direction === 'down') {
        //     // add({ x: start.x, y: midY });
        //     add({ x: end.x, y: midY });
        // }
        return controlPoints;
    }
    // Always start with an outward OFFSET from start side
    if (startSide === 'top') {
        add({ x: start.x, y: start.y - OFFSET });
    } else if (startSide === 'bottom') {
        add({ x: start.x, y: start.y + OFFSET });
    } else if (startSide === 'left') {
        add({ x: start.x - OFFSET, y: start.y });
    } else if (startSide === 'right') {
        add({ x: start.x + OFFSET, y: start.y });
    }

    // Now determine routing based on both sides
    if (startSide === 'top' || startSide === 'bottom') {
        if (endSide === 'top' || endSide === 'bottom') {
            // Vertical→Vertical
            add({ x: midX, y: controlPoints[controlPoints.length - 1]!.y }); // Horizontal
            add({ x: midX, y: end.y + (endSide === 'top' ? -OFFSET : OFFSET) }); // Vertical toward end
        } else {
            // Vertical→Horizontal
            add({ x: end.x + (endSide === 'left' ? -OFFSET : OFFSET), y: controlPoints[controlPoints.length - 1]!.y });
            add({ x: end.x + (endSide === 'left' ? -OFFSET : OFFSET), y: end.y });
        }
    } else if (startSide === 'left' || startSide === 'right') {
        if (endSide === 'left' || endSide === 'right') {
            // Horizontal→Horizontal
            add({ x: controlPoints[controlPoints.length - 1]!.x, y: midY }); // Vertical
            add({ x: end.x + (endSide === 'left' ? -OFFSET : OFFSET), y: midY });
        } else {
            // Horizontal→Vertical
            add({ x: controlPoints[controlPoints.length - 1]!.x, y: end.y + (endSide === 'top' ? -OFFSET : OFFSET) });
        }
    }

    // Final approach to end with OFFSET
    if (endSide === 'top') {
        add({ x: end.x, y: end.y - OFFSET });
    } else if (endSide === 'bottom') {
        add({ x: end.x, y: end.y + OFFSET });
    } else if (endSide === 'left') {
        add({ x: end.x - OFFSET, y: end.y });
    } else if (endSide === 'right') {
        add({ x: end.x + OFFSET, y: end.y });
    }

    return controlPoints;
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