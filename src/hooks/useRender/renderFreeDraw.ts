import { FreedrawElement } from "../../types";

export const renderFreedraw = (ctx: CanvasRenderingContext2D, element: FreedrawElement) => {
    const { points } = element;

    if (points.length < 2) return;

    ctx.beginPath();
    ctx.moveTo(points[0].x, points[0].y);

    for (let i = 1; i < points.length; i++) {
        ctx.lineTo(points[i].x, points[i].y);
    }

    ctx.stroke();
};