import { DrawElement, Point } from "../types";

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