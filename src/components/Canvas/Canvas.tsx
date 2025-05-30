import React, { useRef } from 'react';
import { CanvasContext } from './CanvasContext';
import { useCanvasSetup } from './hooks/useCanvasSetup';
import { useResize } from './hooks/useResize';
import { useSelection } from './hooks/useSelection';
import { useDrawing } from './hooks/useDrawing';
import { CanvasProps } from '../../types';

const Canvas: React.FC<CanvasProps> = (props) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { redrawCanvas } = useCanvasSetup(canvasRef, props);

  // Initialize all custom hooks
  const { handleResizeMouseDown, handleResizeMouseMove, handleResizeMouseUp } = 
    useResize(canvasRef, props, redrawCanvas);
  const { handleSelectionMouseDown, handleSelectionMouseMove, handleSelectionMouseUp } = 
    useSelection(canvasRef, props, redrawCanvas);
  const { handleDrawingMouseDown, handleDrawingMouseMove, handleDrawingMouseUp } = 
    useDrawing(canvasRef, props, redrawCanvas);

  // Combined mouse handlers
  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    // First check if we're resizing
    if (handleResizeMouseDown(e)) return;
    
    // Then handle based on current tool
    if (props.tool === 'selection') {
      handleSelectionMouseDown(e);
    } else {
      handleDrawingMouseDown(e);
    }
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    // First check if we're resizing
    if (handleResizeMouseMove(e)) return;
    
    // Then handle based on current tool
    if (props.tool === 'selection') {
      handleSelectionMouseMove(e);
    } else {
      handleDrawingMouseMove(e);
    }
  };

  const handleMouseUp = () => {
    // Handle all possible mouse up scenarios
    handleResizeMouseUp();
    handleSelectionMouseUp();
    handleDrawingMouseUp();
    redrawCanvas();
  };

  return (
    <CanvasContext.Provider value={props}>
      <canvas
        ref={canvasRef}
        className="w-full h-full touch-none"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      />
    </CanvasContext.Provider>
  );
};

export default Canvas;