import { DrawElement } from "../../types";
import { getProportionalRadius } from "./getProportionalRadius";

export const renderRectangle = (ctx: CanvasRenderingContext2D, element: DrawElement) => {
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