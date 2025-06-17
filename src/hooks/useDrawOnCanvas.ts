import { useCanvasContext } from '../contexts/CanvasContext/CanvasContext';
import { getRotatedCorners } from '../utils/geometry';
import { DrawElement } from '../types';
import { defaultStyle } from '../constants';
import { renderElement } from '../utils/renderElements';

export function useDrawOnCanvas(canvasRef: React.RefObject<HTMLCanvasElement>, isDrawing: boolean) {
  const {
    elements,
    selectedElementIds,
    panOffset,
    scale,
    selectionBox,
  } = useCanvasContext();

  const drawGrid = (ctx: CanvasRenderingContext2D, width: number, height: number) => {
    const gridSize = 20;
    ctx.strokeStyle = '#f0f0f0';
    ctx.lineWidth = 1;

    const offsetX = (panOffset.x % gridSize) / scale;
    const offsetY = (panOffset.y % gridSize) / scale;

    for (let x = offsetX; x < width / scale; x += gridSize) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height / scale);
      ctx.stroke();
    }

    for (let y = offsetY; y < height / scale; y += gridSize) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width / scale, y);
      ctx.stroke();
    }
  };

  const drawResizeHandles = (ctx: CanvasRenderingContext2D) => {
    const selectedElements = elements.filter(el => selectedElementIds.includes(el.id));
    if (selectedElements.length === 0) return;

    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;

    selectedElements.forEach(element => {
      const rotatedPoints = getRotatedCorners(element);
      rotatedPoints.forEach(p => {
        minX = Math.min(minX, p.x);
        minY = Math.min(minY, p.y);
        maxX = Math.max(maxX, p.x);
        maxY = Math.max(maxY, p.y);
      });
    });

    const width = maxX - minX;
    const height = maxY - minY;

    if (selectedElementIds.length > 1) {
      const pseudoSelectionElement: DrawElement = {
        id: 'selection-outline',
        type: 'selection-outline',
        x: minX,
        y: minY,
        width,
        height,
        angle: 0,
        style: { ...defaultStyle },
        isSelected: true,
      };

      renderElement(ctx, pseudoSelectionElement, false);
    }
  };

  const redrawCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.save();
    ctx.translate(panOffset.x, panOffset.y);
    ctx.scale(scale, scale);

    drawGrid(ctx, canvas.width, canvas.height);

    elements.forEach(element => {
      if (element.isMarkedForDeletion) return;
      renderElement(ctx, element, (selectedElementIds.length > 1));
    });

    if (selectionBox?.isActive) {
      ctx.strokeStyle = '#4285f4';
      ctx.lineWidth = 1;
      ctx.setLineDash([5, 5]);
      ctx.strokeRect(
        selectionBox.startX,
        selectionBox.startY,
        selectionBox.width,
        selectionBox.height
      );
      ctx.setLineDash([]);
    }

    if (selectedElementIds.length > 0 && !isDrawing) {
      drawResizeHandles(ctx);
    }

    ctx.restore();
  };

  return { redrawCanvas, drawGrid, drawResizeHandles };
}