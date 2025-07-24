import { DrawElement } from "../types";
import { renderElement } from "./renderElements";

export const drawCurrentElement = (
    currentElement: DrawElement | null, 
    canvasRef: React.RefObject<HTMLCanvasElement>,
    panOffset: { x: number; y: number },
    scale: number,
    selectedElementIds: string[]
) => {
    if (!currentElement) return;
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.save();
    ctx.translate(panOffset.x, panOffset.y);
    ctx.scale(scale, scale);
    renderElement(ctx, currentElement, (selectedElementIds.length > 1));

    ctx.restore();
};