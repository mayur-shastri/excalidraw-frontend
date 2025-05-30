import { useResize } from './useResize.ts';
import { useSelection } from './useSelection.ts';
import { useDrawing } from './useDrawing.ts';

export const useCanvasTools = (
  canvasRef: React.RefObject<HTMLCanvasElement>,
  props: any,
  redrawCanvas: () => void
) => {
  const { handleResizeMouseDown, handleResizeMouseMove, handleResizeMouseUp } = useResize(
    canvasRef,
    props,
    redrawCanvas
  );

  const { handleSelectionMouseDown, handleSelectionMouseMove } = useSelection(
    canvasRef,
    props,
    redrawCanvas
  );

  const { handleDrawingMouseDown, handleDrawingMouseMove } = useDrawing(
    canvasRef,
    props,
    redrawCanvas
  );

  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (handleResizeMouseDown(e)) return;
    if (props.tool === 'selection') handleSelectionMouseDown(e);
    else handleDrawingMouseDown(e);
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (handleResizeMouseMove(e)) return;
    if (props.tool === 'selection') handleSelectionMouseMove(e);
    else handleDrawingMouseMove(e);
  };

  const handleMouseUp = () => {
    handleResizeMouseUp();
    redrawCanvas();
  };

  return { handleMouseDown, handleMouseMove, handleMouseUp };
};