import React, { useEffect, useRef } from 'react';
import { ArrowElement, CanvasPreviewProps, DrawElement, FreedrawElement, LineElement, TextElement } from '../../types';
import { renderFreedraw } from '../../hooks/useRender/renderFreeDraw';
import { renderRectangle } from '../../hooks/useRender/renderRectangle';
import { renderEllipse } from '../../hooks/useRender/renderEllipse';
import { renderArrow } from '../../hooks/useRender/renderArrow';
import { renderLine } from '../../hooks/useRender/renderLine';
import { renderDiamond } from '../../hooks/useRender/renderDiamond';
import { renderRhombus } from '../../hooks/useRender/renderRhombus';
import { renderCenteredText, renderText } from '../../hooks/useRender/renderText';

const CanvasPreview: React.FC<CanvasPreviewProps> = ({
  elements,
  connections,
  scale = 1,
  panOffset = { x: 0, y: 0 }
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const renderElement = (
    ctx: CanvasRenderingContext2D,
    element: DrawElement) => {
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
      case 'arrow': {
        renderArrow(ctx, element as ArrowElement, connections, elements);
        break;
      }
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

    ctx.restore();
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

    elements.forEach((element) => {
      renderElement(ctx, element);
    });

    ctx.restore();
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;

    redrawCanvas();
  }, [elements, scale, panOffset]);

  return (
    <canvas
      ref={canvasRef}
      className="w-full h-full touch-none"
    />
  );
};

export default CanvasPreview;
