import { DrawElement } from "../../types";
import { getProportionalRadius } from "./getProportionalRadius";

export const renderDiamond = (ctx: CanvasRenderingContext2D, element: DrawElement) => {
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