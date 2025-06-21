import { DrawElement } from "../../types";

export const renderEllipse = (ctx: CanvasRenderingContext2D, element: DrawElement) => {
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