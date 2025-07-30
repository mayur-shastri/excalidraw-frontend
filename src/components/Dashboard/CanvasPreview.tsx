import React, { useEffect, useRef, useState } from 'react';
import {
  ArrowElement,
  CanvasPreviewProps, // If this type forces scale/panOffset required, you can adjust below or create a local props type.
  Connection,
  DrawElement,
  FreedrawElement,
  LineElement,
  TextElement,
} from '../../types';
import { renderFreedraw } from '../../hooks/useRender/renderFreeDraw';
import { renderRectangle } from '../../hooks/useRender/renderRectangle';
import { renderEllipse } from '../../hooks/useRender/renderEllipse';
import { renderArrow } from '../../hooks/useRender/renderArrow';
import { renderLine } from '../../hooks/useRender/renderLine';
import { renderDiamond } from '../../hooks/useRender/renderDiamond';
import { renderRhombus } from '../../hooks/useRender/renderRhombus';
import { renderCenteredText, renderText } from '../../hooks/useRender/renderText';

// ---- Optional: narrow the props to make scale/panOffset optional ----
type CardsPreviewProps = Omit<CanvasPreviewProps, 'scale' | 'panOffset'> & {
  /** If provided, we will use these instead of auto-fit */
  scale?: number;
  panOffset?: { x: number; y: number };
  /** Force auto-fit even if scale/panOffset are provided */
  autoFit?: boolean;
};

const CanvasPreview: React.FC<CardsPreviewProps> = ({
  elements,
  connections,
  scale: scaleProp,
  panOffset: panOffsetProp,
  autoFit = true, // default to auto-fit behavior like CanvasPreviewAI
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Internal view state only used when auto-fit is active or when props not provided
  const [scale, setScale] = useState<number>(1);
  const [panOffset, setPanOffset] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

  const effectiveScale = autoFit || scaleProp == null ? scale : scaleProp;
  const effectivePan = autoFit || panOffsetProp == null ? panOffset : panOffsetProp;

  const renderElement = (ctx: CanvasRenderingContext2D, element: DrawElement) => {
    const {isDeleted, style } = element;
    if(isDeleted) return;
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

    // Draw centered text for all elements except freedraw and line
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

  // Compute auto-fit scale & pan when elements/connections change OR container resizes
  useEffect(() => {
    if (!autoFit) return;

    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    // Sync canvas size to container CSS size
    canvas.width = container.offsetWidth;
    canvas.height = container.offsetHeight;

    if (elements.length === 0) {
      // No elements: reset to defaults
      setScale(1);
      setPanOffset({ x: 0, y: 0 });
      return;
    }

    // Compute diagram bounds (axis-aligned, ignores rotation like in your AI preview)
    let minX = Infinity;
    let minY = Infinity;
    let maxX = -Infinity;
    let maxY = -Infinity;

    elements.forEach((el) => {
      minX = Math.min(minX, el.x);
      minY = Math.min(minY, el.y);
      maxX = Math.max(maxX, el.x + el.width);
      maxY = Math.max(maxY, el.y + el.height);
    });

    const diagramWidth = Math.max(0, maxX - minX);
    const diagramHeight = Math.max(0, maxY - minY);

    // If diagram is degenerate, just center the origin-ish area
    if (diagramWidth === 0 || diagramHeight === 0) {
      setScale(1);
      setPanOffset({
        x: canvas.width / 2 - minX,
        y: canvas.height / 2 - minY,
      });
      return;
    }

    const PADDING = 80; // match AI preview
    const effectiveCanvasWidth = Math.max(1, canvas.width - PADDING);
    const effectiveCanvasHeight = Math.max(1, canvas.height - PADDING);

    const newScale = Math.min(
      effectiveCanvasWidth / diagramWidth,
      effectiveCanvasHeight / diagramHeight
    );

    const scaledDiagramWidth = diagramWidth * newScale;
    const scaledDiagramHeight = diagramHeight * newScale;

    const newPanOffsetX = (canvas.width - scaledDiagramWidth) / 2 - minX * newScale;
    const newPanOffsetY = (canvas.height - scaledDiagramHeight) / 2 - minY * newScale;

    setScale(newScale);
    setPanOffset({ x: newPanOffsetX, y: newPanOffsetY });
  }, [elements, connections, autoFit]);


  // Redraw when data or view changes (whether auto-fit or externally controlled)
  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    // Keep the canvas backing store in sync with current container size
    if (canvas.width !== container.offsetWidth || canvas.height !== container.offsetHeight) {
      canvas.width = container.offsetWidth;
      canvas.height = container.offsetHeight;
    }

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.save();
    ctx.translate(effectivePan.x, effectivePan.y);
    ctx.scale(effectiveScale, effectiveScale);

    elements.forEach((el) => renderElement(ctx, el));

    ctx.restore();
  }, [elements, connections, effectiveScale, effectivePan]);

  // ResizeObserver to re-fit/redraw when the container resizes
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const ro = new ResizeObserver(() => {
      const canvas = canvasRef.current;
      if (!canvas) return;

      // Resize the canvas to the container
      canvas.width = container.offsetWidth;
      canvas.height = container.offsetHeight;

      // Trigger a re-fit if autoFit is on; otherwise just redraw with current view
      if (autoFit) {
        // changing elements state would retrigger; we can explicitly recompute by toggling a state or by
        // forcing a layout pass—simplest is to copy the same logic via dependency on container size.
        // Here we just trigger a no-op state update to rerun effects by setting scale to itself.
        setScale((s) => s);
      } else {
        // Force a redraw by nudging pan slightly then back (no visual change)
        setPanOffset((p) => ({ ...p }));
      }
    });

    ro.observe(container);
    return () => ro.disconnect();
  }, [autoFit]);

  return (
    <div ref={containerRef} className="w-full h-full">
      <canvas ref={canvasRef} className="w-full h-full touch-none" />
    </div>
  );
};

export default CanvasPreview;