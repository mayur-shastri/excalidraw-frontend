import { LineElement } from "../../types";
import { renderCenteredText } from "./renderText";

export const renderLine = (ctx: CanvasRenderingContext2D, element: LineElement) => {
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