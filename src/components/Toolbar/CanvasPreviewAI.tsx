import React, { useEffect, useRef, useState } from 'react';
import { ArrowElement, DrawElement, FreedrawElement, LineElement, TextElement, Connection } from '../../types'; // Assuming types are in this path
import { renderFreedraw } from '../../hooks/useRender/renderFreeDraw';
import { renderRectangle } from '../../hooks/useRender/renderRectangle';
import { renderEllipse } from '../../hooks/useRender/renderEllipse';
import { renderArrow } from '../../hooks/useRender/renderArrow';
import { renderLine } from '../../hooks/useRender/renderLine';
import { renderDiamond } from '../../hooks/useRender/renderDiamond';
import { renderRhombus } from '../../hooks/useRender/renderRhombus';
import { renderCenteredText, renderText } from '../../hooks/useRender/renderText';

// Updated Props: scale and panOffset are removed.
interface AutoFitCanvasPreviewProps {
  elements: DrawElement[];
  connections: Connection[];
}

const CanvasPreviewAI: React.FC<AutoFitCanvasPreviewProps> = ({
  elements,
  connections,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  // 1. Internal state for scale and panOffset
  const [scale, setScale] = useState(1);
  const [panOffset, setPanOffset] = useState({ x: 0, y: 0 });

  const renderElement = (
    ctx: CanvasRenderingContext2D,
    element: DrawElement
  ) => {
    const { style } = element;
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

    if (
      element.text &&
      element.text.trim() !== '' &&
      element.type !== 'freedraw' &&
      element.type !== 'line'
    ) {
      renderCenteredText(ctx, element);
    }
    ctx.restore();
  };

  // This useEffect calculates the optimal view and updates the state.
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || elements.length === 0) return;
    
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;

    let minX = Infinity;
    let minY = Infinity;
    let maxX = -Infinity;
    let maxY = -Infinity;

    elements.forEach(element => {
      minX = Math.min(minX, element.x);
      minY = Math.min(minY, element.y);
      maxX = Math.max(maxX, element.x + element.width);
      maxY = Math.max(maxY, element.y + element.height);
    });

    const diagramWidth = maxX - minX;
    const diagramHeight = maxY - minY;

    if (diagramWidth === 0 || diagramHeight === 0) {
        setScale(1);
        setPanOffset({ x: canvas.width / 2 - minX, y: canvas.height / 2 - minY });
        return;
    }

    const PADDING = 80;
    const effectiveCanvasWidth = canvas.width - PADDING;
    const effectiveCanvasHeight = canvas.height - PADDING;

    const newScale = Math.min(effectiveCanvasWidth / diagramWidth, effectiveCanvasHeight / diagramHeight);
    
    const scaledDiagramWidth = diagramWidth * newScale;
    const scaledDiagramHeight = diagramHeight * newScale;

    const newPanOffsetX = (canvas.width - scaledDiagramWidth) / 2 - (minX * newScale);
    const newPanOffsetY = (canvas.height - scaledDiagramHeight) / 2 - (minY * newScale);

    setScale(newScale);
    setPanOffset({ x: newPanOffsetX, y: newPanOffsetY });

  }, [elements, connections]); // Recalculate when elements or connections change

  // This useEffect handles the actual drawing whenever the view (scale, panOffset) or data changes.
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Ensure canvas is ready
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;
    
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.save();
    ctx.translate(panOffset.x, panOffset.y);
    ctx.scale(scale, scale);

    elements.forEach((element) => {
      renderElement(ctx, element);
    });

    ctx.restore();
  }, [elements, connections, scale, panOffset]); // Redraw when anything changes

  return (
    <>
    <canvas
      ref={canvasRef}
      className="w-full h-full touch-none bg-gray-50 rounded-lg border border-gray-200"
    />
    </>
  );
};

export default CanvasPreviewAI;