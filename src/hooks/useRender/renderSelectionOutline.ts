import { ArrowElement, Connection, DrawElement, LineElement, ResizeHandle } from "../../types";

export const drawSelectionOutline = (
    ctx: CanvasRenderingContext2D,
    element: DrawElement,
    multiSelectionFlag: boolean,
    connections: Connection[],
    elements: DrawElement[]
) => {
    // Special case for arrow: only 3 handles (2 at ends, 1 in center)
    if (element.type === "arrow") {
        const arrow = element as ArrowElement;
        let { startPoint, endPoint } = arrow;

        const conn = connections.find(c => c.id === arrow.connectionId);

        if (!conn) return;

        const { startElementId, endElementId } = conn;


        if (startElementId) {
            const startElement = elements.find(el => el.id === startElementId);
            if (startElement) {
                const { x, y, width, height } = startElement;
                if (arrow.startSide === 'top' || arrow.startSide === 'bottom')
                    startPoint = { x: x + width / 2, y: y + (arrow.startSide === 'bottom' ? height : 0) };
                else
                    startPoint = { x: x + (arrow.startSide === 'right' ? width : 0), y: y + height / 2 };
            }
        }

        if (endElementId) {
            const endElement = elements.find(el => el.id === endElementId);
            if (endElement) {
                const { x, y, width, height } = endElement;
                if (arrow.endSide === 'top' || arrow.endSide === 'bottom')
                    endPoint = { x: x + width / 2, y: y + (arrow.endSide === 'bottom' ? height : 0) };
                else
                    endPoint = { x: x + (arrow.endSide === 'right' ? width : 0), y: y + height / 2 };
            }
        }

        // Calculate center point
        
        // Draw 3 handles: start, end, center
        const handleSize = 10;
        const handles = [
            { x: startPoint.x, y: startPoint.y },
            { x: endPoint.x, y: endPoint.y },
        ];
        if(!startElementId && !endElementId){
            const centerX = (startPoint.x + endPoint.x) / 2;
            const centerY = (startPoint.y + endPoint.y) / 2;
            handles.push({x : centerX, y : centerY});
        }

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
    
    if (element.type === "line") {
        const line = element as LineElement;
        const { startPoint, endPoint } = line;


        // Calculate center point
        const centerX = (startPoint.x + endPoint.x) / 2;
        const centerY = (startPoint.y + endPoint.y) / 2;

        // Draw 3 handles: start, end, center
        const handleSize = 10;
        const handles = [
            { x: startPoint.x, y: startPoint.y },
            { x: endPoint.x, y: endPoint.y },
            { x: centerX, y: centerY },
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