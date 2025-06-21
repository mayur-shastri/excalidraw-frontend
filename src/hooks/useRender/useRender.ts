import { useCanvasContext } from "../../contexts/CanvasContext/CanvasContext";
import { ArrowElement, DrawElement, FreedrawElement, LineElement, TextElement } from "../../types";
import { renderArrow } from "./renderArrow";
import { renderDiamond } from "./renderDiamond";
import { renderEllipse } from "./renderEllipse";
import { renderFreedraw } from "./renderFreeDraw";
import { renderLine } from "./renderLine";
import { renderRectangle } from "./renderRectangle";
import { renderRhombus } from "./renderRhombus";
import { drawSelectionOutline } from "./renderSelectionOutline";
import { renderCenteredText, renderText } from "./renderText";

export const useRender = () => {

    const { elements, connections } = useCanvasContext();

    const renderElement = (
        ctx: CanvasRenderingContext2D,
        element: DrawElement,
        multiSelectionFlag: boolean) => {
        const { style, isSelected } = element;

        ctx.strokeStyle = style.strokeColor;
        ctx.fillStyle = style.backgroundColor;
        ctx.lineWidth = style.strokeWidth;
        ctx.globalAlpha = style.opacity;

        ctx.save();

        if (element.angle !== 0) {
            const centerX = element.x + element.width / 2;
            const centerY = element.y + element.height / 2;

            ctx.translate(centerX, centerY);
            ctx.rotate(element.angle);
            ctx.translate(-centerX, -centerY);
        }

        switch (element.type) {
            case 'freedraw':
                renderFreedraw(ctx, element as FreedrawElement);
                break;
            case 'rectangle':
                renderRectangle(ctx, element);
                break;
            case 'ellipse':
                renderEllipse(ctx, element);
                break;
            case 'arrow':
                renderArrow(ctx, element as ArrowElement, connections, elements);
                break;
            case 'line':
                renderLine(ctx, element as LineElement);
                break;
            case 'diamond':
                renderDiamond(ctx, element);
                break;
            case 'rhombus':
                renderRhombus(ctx, element);
                break;
            case 'text':
                renderText(ctx, element as TextElement);
                break;
        }

        // Draw centered text for all elements except freedraw and line (unless you want it for those too)
        if (
            element.text &&
            element.text.trim() !== '' &&
            element.type !== 'freedraw' &&
            element.type !== 'line'
        ) {
            renderCenteredText(ctx, element);
        }

        if (isSelected) {
            drawSelectionOutline(ctx, element, multiSelectionFlag);
        }

        ctx.restore();
    };

    return { renderElement };

};