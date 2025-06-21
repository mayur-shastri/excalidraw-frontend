import { DrawElement } from "../../types";
import { getProportionalRadius } from "./getProportionalRadius";

export const renderRhombus = (ctx: CanvasRenderingContext2D, element: DrawElement) => {
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