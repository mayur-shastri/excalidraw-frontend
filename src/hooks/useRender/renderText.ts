import { DrawElement, TextElement } from "../../types";

export const renderCenteredText = (ctx: CanvasRenderingContext2D, element: DrawElement) => {
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

export const renderText = (ctx: CanvasRenderingContext2D, element: TextElement) => {
    // For text elements, center the text in the bounding box
    renderCenteredText(ctx, element);
};