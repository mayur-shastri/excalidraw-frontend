import { useEffect } from 'react';
import { drawGrid } from '../utils/canvasUtils.ts';
import { renderElement } from '../../../utils/renderElements.tsx';

export const useCanvasSetup = (canvasRef: React.RefObject<HTMLCanvasElement>, props: any) => {
  // const redrawCanvas = () => {
  //   const canvas = canvasRef.current;
  //   if (!canvas) return;
    
  //   const ctx = canvas.getContext('2d');
  //   if (!ctx) return;

  //   ctx.clearRect(0, 0, canvas.width, canvas.height);
  //   ctx.save();
  //   ctx.translate(props.panOffset.x, props.panOffset.y);
  //   ctx.scale(props.scale, props.scale);

  //   drawGrid(ctx, canvas.width, canvas.height, props.scale, props.panOffset);
  //   props.elements.forEach(element => renderElement(ctx, element));

  //   ctx.restore();
  // };

  const redrawCanvas = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      
      const ctx = canvas.getContext('2d');
      if (!ctx) return;
  
      // Clear canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height);
  
      // Apply zoom and pan transformations
      ctx.save();
      ctx.translate(props.panOffset.x, props.panOffset.y);
      ctx.scale(props.scale, props.scale);
  
      // Draw grid
      drawGrid(ctx, canvas.width, canvas.height, props.scale, props.panOffset);
  
      // Draw all elements
      props.elements.forEach(element => {
        renderElement(ctx, element);
      });
  
      // Draw selection box if active
      if (props.selectionBox?.isActive) {
        ctx.strokeStyle = '#4285f4';
        ctx.lineWidth = 1;
        ctx.setLineDash([5, 5]);
        ctx.strokeRect(
          props.selectionBox.startX,
          props.selectionBox.startY,
          props.selectionBox.width,
          props.selectionBox.height
        );
        ctx.setLineDash([]);
      }
  
      // Draw resize handles if elements are selected
      if (props.selectedElementIds.length > 0 && !props.isDrawing) {
        props.drawResizeHandles(ctx);
      }
  
      ctx.restore();
    };

  useEffect(() => {
    const resizeCanvas = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
      redrawCanvas();
    };
    
    window.addEventListener('resize', resizeCanvas);
    resizeCanvas();
    
    return () => window.removeEventListener('resize', resizeCanvas);
  }, []);

  useEffect(() => {
    redrawCanvas();
  }, [props.elements, props.scale, props.panOffset]);

  return { redrawCanvas };
};