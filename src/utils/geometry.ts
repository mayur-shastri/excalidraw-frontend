import { ArrowElement, DrawElement, Point } from "../types";

export const getRotatedCorners = (element: DrawElement): Point[] => {
    const { x, y, width, height, angle = 0 } = element;
    const centerX = x + width / 2;
    const centerY = y + height / 2;

    const corners = [
        { x, y },
        { x: x + width, y },
        { x: x + width, y: y + height },
        { x, y: y + height }
    ];

    return corners.map(p => {
        const translatedX = p.x - centerX;
        const translatedY = p.y - centerY;
        const rotatedX = translatedX * Math.cos(angle) - translatedY * Math.sin(angle);
        const rotatedY = translatedX * Math.sin(angle) + translatedY * Math.cos(angle);
        return {
            x: rotatedX + centerX,
            y: rotatedY + centerY
        };
    });
};

export const isPointInRect = (point: Point, x: number, y: number, width: number, height: number): boolean => {
    return point.x >= x && point.x <= x + width && point.y >= y && point.y <= y + height;
};

export const getConnectedArrowEndPoints =
    (
        elements: DrawElement[],
        arrow: ArrowElement,
        startElementId?: string,
        endElementId?: string,

    ) => {

        let startPoint = arrow.startPoint;
        let endPoint = arrow.endPoint;

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

        return { startPoint, endPoint };

    }