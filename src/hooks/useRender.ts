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

    // const renderArrow = (ctx: CanvasRenderingContext2D, element: ArrowElement) => {
    //     const { startPoint, endPoint, direction, style } = element;
    //     const strokeWidth = style.strokeWidth || 1;
    //     const pathRadius = 16;
    //     const headLength = 10 + strokeWidth;
    //     const color = style.strokeColor || "#ffffff";

    //     ctx.save();
    //     ctx.strokeStyle = color;
    //     ctx.lineWidth = strokeWidth;
    //     ctx.lineJoin = "round";
    //     ctx.lineCap = "round";

    //     // Draw path with rounded bends (basic 2-bend manhattan routing)
    //     const midX = (startPoint.x + endPoint.x) / 2;
    //     const midY = (startPoint.y + endPoint.y) / 2;

    //     ctx.beginPath();
    //     ctx.moveTo(startPoint.x, startPoint.y);

    //     if (Math.abs(startPoint.x - endPoint.x) > Math.abs(startPoint.y - endPoint.y)) {
    //         // Horizontal preference
    //         ctx.lineTo(midX, startPoint.y);
    //         ctx.lineTo(midX, endPoint.y);
    //     } else {
    //         // Vertical preference
    //         ctx.lineTo(startPoint.x, midY);
    //         ctx.lineTo(endPoint.x, midY);
    //     }

    //     ctx.lineTo(endPoint.x, endPoint.y);
    //     ctx.stroke();

    //     // Draw arrowhead at endPoint based on direction
    //     const drawArrowhead = (x: number, y: number, dir: 'up' | 'down' | 'left' | 'right') => {
    //         ctx.beginPath();
    //         switch (dir) {
    //             case 'up':
    //                 ctx.moveTo(x, y);
    //                 ctx.lineTo(x - headLength, y + headLength);
    //                 ctx.lineTo(x + headLength, y + headLength);
    //                 break;
    //             case 'down':
    //                 ctx.moveTo(x, y);
    //                 ctx.lineTo(x - headLength, y - headLength);
    //                 ctx.lineTo(x + headLength, y - headLength);
    //                 break;
    //             case 'left':
    //                 ctx.moveTo(x, y);
    //                 ctx.lineTo(x + headLength, y - headLength);
    //                 ctx.lineTo(x + headLength, y + headLength);
    //                 break;
    //             case 'right':
    //                 ctx.moveTo(x, y);
    //                 ctx.lineTo(x - headLength, y - headLength);
    //                 ctx.lineTo(x - headLength, y + headLength);
    //                 break;
    //         }
    //         ctx.closePath();
    //         ctx.fillStyle = color;
    //         ctx.fill();
    //     };

    //     drawArrowhead(endPoint.x, endPoint.y, direction);

    //     // Optional: text
    //     if (element.text?.trim()) {
    //         renderCenteredText(ctx, element);
    //     }

    //     ctx.restore();
    // };

    const renderArrow = (ctx: CanvasRenderingContext2D, element: ArrowElement) => {
        const { startPoint, endPoint, style } = element;
        const strokeWidth = style.strokeWidth || 2;
        const color = style.strokeColor || "#000000";
        const arrowSize = Math.max(8, strokeWidth * 2);
        const curveRadius = 10;

        ctx.save();
        ctx.strokeStyle = color;
        ctx.fillStyle = color;
        ctx.lineWidth = strokeWidth;
        ctx.lineJoin = "round";
        ctx.lineCap = "round";

        // Calculate direction vector
        const dx = endPoint.x - startPoint.x;
        const dy = endPoint.y - startPoint.y;
        const angle = Math.atan2(dy, dx);
        const length = Math.sqrt(dx * dx + dy * dy);

        // Smart path routing with smooth curves
        if (length > 0) {
            const controlPoints = calculateSmartControlPoints(startPoint, endPoint);

            // Draw the curved path
            ctx.beginPath();
            ctx.moveTo(startPoint.x, startPoint.y);

            if (controlPoints.length === 1) {
                // Simple curve
                ctx.quadraticCurveTo(
                    controlPoints[0].x,
                    controlPoints[0].y,
                    endPoint.x,
                    endPoint.y
                );
            } else if (controlPoints.length === 2) {
                // Bezier curve
                ctx.bezierCurveTo(
                    controlPoints[0].x,
                    controlPoints[0].y,
                    controlPoints[1].x,
                    controlPoints[1].y,
                    endPoint.x,
                    endPoint.y
                );
            } else {
                // Straight line as fallback
                ctx.lineTo(endPoint.x, endPoint.y);
            }

            ctx.stroke();

            // Draw arrowhead
            drawModernArrowhead(ctx, endPoint, angle, arrowSize);
        }

        // Optional: text rendering
        if (element.text?.trim()) {
            renderCenteredText(ctx, element);
        }

        ctx.restore();
    };

    function calculateSmartControlPoints(start: Point, end: Point): Point[] {
        const dx = end.x - start.x;
        const dy = end.y - start.y;
        const minDistanceForCurve = 50;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance < minDistanceForCurve) {
            return []; // Straight line for short distances
        }

        // Manhattan-style routing with smooth curves
        if (Math.abs(dx) > Math.abs(dy)) {
            // Horizontal dominant
            const midX = start.x + dx * 0.5;
            return [
                { x: midX, y: start.y },
                { x: midX, y: end.y }
            ];
        } else {
            // Vertical dominant
            const midY = start.y + dy * 0.5;
            return [
                { x: start.x, y: midY },
                { x: end.x, y: midY }
            ];
        }
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
        ctx.moveTo(0, 0);
        ctx.lineTo(-size, -size / 2);
        ctx.lineTo(-size, size / 2);
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