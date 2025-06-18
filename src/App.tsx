/*
Todo:
2. Make it more like eraser.io
  2.1 : Connectors instead of plain arrows
  2.2 : No grid -->Done
  2.3 : 
3. MCP server
4. Collaboraion Feature
5. Dark theme?
*/

import { useState, useCallback, useEffect } from 'react';
import Toolbar from './components/Toolbar';
import PropertyPanel from './components/PropertyPanel';
import TextEditor from './components/TextEditor';
import { DrawElement, ElementType, Point, ElementStyle } from './types';
import { useElementOperations } from './hooks/useElementOperations';
import { CanvasProvider } from './contexts/CanvasContext/CanvasProvider';
import Canvas from './components/Canvas/Canvas';

function areElementsEqual(a: DrawElement[], b: DrawElement[]) {
  return JSON.stringify(a) === JSON.stringify(b);
}

function App() {
  // State for drawing elements
  const [elements, setElements] = useState<DrawElement[]>([]);

  // Undo/Redo stacks
  const [undoStack, setUndoStack] = useState<DrawElement[][]>([]);
  const [redoStack, setRedoStack] = useState<DrawElement[][]>([]);

  // State for the currently selected tool
  const [activeTool, setActiveTool] = useState<ElementType>('selection');

  // State for selected elements
  const [selectedElementIds, setSelectedElementIds] = useState<string[]>([]);

  // State for zoom and pan
  const [scale, setScale] = useState<number>(1);
  const [panOffset, setPanOffset] = useState<Point>({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState<boolean>(false);
  const [lastMousePos, setLastMousePos] = useState<Point>({ x: 0, y: 0 });

  // State for selection box
  const [selectionBox, setSelectionBox] = useState<{
    startX: number;
    startY: number;
    width: number;
    height: number;
    isActive: boolean;
  } | null>(null);

  // State for text editing
  const [editingText, setEditingText] = useState<{
    id: string;
    text: string;
    x: number;
    y: number;
    width: number;
    height: number;
    style: ElementStyle;
  } | null>(null);

  // Get element operations
  const {
    selectedElements,
    deleteSelectedElements,
    updateStyle,
  } = useElementOperations({
    elements,
    setElements,
    selectedElementIds,
    setSelectedElementIds,
  });

  // Wrap setElements to push to undo stack (but not on undo/redo)
  const setElementsWithUndo = useCallback((updater: (prev: DrawElement[]) => DrawElement[]) => {
    setElements(prev => {
      const updated = updater(prev);
      // Only push to undo stack if the update actually changes the state
      if (!areElementsEqual(prev, updated)) {
        setUndoStack(stack => {
          if (stack.length === 0 || !areElementsEqual(stack[stack.length - 1], prev)) {
            const slicedStack = stack.length > 50 ? stack.slice(1) : stack;
            // Only remember last 50 states
            return [...slicedStack, prev];
          }
          return stack;
        });
        setRedoStack([]);
      }
      return updated;
    });
  }, []);

  // Undo function
  const handleUndo = useCallback(() => {
    setUndoStack(prevUndo => {
      if (prevUndo.length === 0) return prevUndo;
      const prevElements = prevUndo[prevUndo.length - 1];
      setElements(currentElements => {
        setRedoStack(prevRedo => {
          if (prevRedo.length === 0 || !areElementsEqual(prevRedo[prevRedo.length - 1], currentElements)) {
            const slicedRedoStack = prevRedo.length > 50 ? prevRedo.slice(1) : prevRedo;
            return [...slicedRedoStack, currentElements];
          }
          return prevRedo;
        });
        return prevElements;
      });
      // Remove the last state from undoStack
      return prevUndo.slice(0, -1);
    });
  }, []);

  // Redo function
  const handleRedo = useCallback(() => {
    setRedoStack(prevRedo => {
      if (prevRedo.length === 0) return prevRedo;
      const nextElements = prevRedo[prevRedo.length - 1];
      setElements(currentElements => {
        setUndoStack(prevUndo => {
          if (prevUndo.length === 0 || !areElementsEqual(prevUndo[prevUndo.length - 1], currentElements)) {
            const slicedUndo = prevUndo.length > 50 ? prevUndo.slice(1) : prevUndo;
            return [...slicedUndo, currentElements];
          }
          return prevUndo;
        });
        return nextElements;
      });
      // Remove the last state from redoStack
      return prevRedo.slice(0, -1);
    });
  }, []);

  // Handle text editing
  const handleTextEdit = useCallback((element: DrawElement) => {
    setEditingText({
      ...element,
      text: element.text || '',
      style: element.style
    });
  }, []);

  // Handle text save
  const handleTextSave = useCallback((text: string, style: Partial<ElementStyle>) => {
    if (!editingText) return;

    setElementsWithUndo(prev => prev.map(el =>
      el.id === editingText.id
        ? { ...el, text, style: { ...el.style, ...style } }
        : el
    ));
    setEditingText(null);
    setActiveTool('selection'); // Reset to selection tool after editing
  }, [editingText, setElementsWithUndo]);

  // Reset to selection tool after drawing
  const handleElementComplete = useCallback(() => {
    setActiveTool('selection');
  }, []);

  // Handle wheel for zooming
  const handleWheel = useCallback((e: WheelEvent) => {
    e.preventDefault();

    const newScale = e.deltaY < 0
      ? Math.min(scale * 1.1, 5)
      : Math.max(scale / 1.1, 0.1);

    const mouseX = e.clientX;
    const mouseY = e.clientY;

    const newPanOffset = {
      x: panOffset.x - (mouseX - panOffset.x) * (newScale / scale - 1),
      y: panOffset.y - (mouseY - panOffset.y) * (newScale / scale - 1),
    };

    setScale(newScale);
    setPanOffset(newPanOffset);
  }, [scale, panOffset]);

  // Handle keyboard shortcuts
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.key === 'Delete' || e.key === 'Backspace') {
      if (document.activeElement === document.body) {
        deleteSelectedElements();
      }
    }

    if (e.key === 'z' && (e.ctrlKey || e.metaKey)) {
      handleUndo();
    }
    if (e.key === 'y' && (e.ctrlKey || e.metaKey)) {
      handleRedo();
    }

    if (e.key === ' ' && !isPanning) {
      setIsPanning(true);
      document.body.style.cursor = 'grab';
    }
  }, [deleteSelectedElements, isPanning, handleUndo, handleRedo]);

  const handleKeyUp = useCallback((e: KeyboardEvent) => {
    if (e.key === ' ') {
      setIsPanning(false);
      document.body.style.cursor = 'default';
    }
  }, []);

  // Handle mouse events for panning
  const handleMouseDown = useCallback((e: MouseEvent) => {
    if (isPanning) {
      document.body.style.cursor = 'grabbing';
      setLastMousePos({ x: e.clientX, y: e.clientY });
    }
  }, [isPanning]);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (isPanning && e.buttons === 1) {
      const dx = e.clientX - lastMousePos.x;
      const dy = e.clientY - lastMousePos.y;

      setPanOffset({
        x: panOffset.x + dx,
        y: panOffset.y + dy,
      });

      setLastMousePos({ x: e.clientX, y: e.clientY });
    }
  }, [isPanning, lastMousePos, panOffset]);

  const handleMouseUp = useCallback(() => {
    if (isPanning) {
      document.body.style.cursor = 'grab';
    }
  }, [isPanning]);

  // Add event listeners
  useEffect(() => {
    window.addEventListener('wheel', handleWheel, { passive: false });
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    window.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);

    return () => {
      window.removeEventListener('wheel', handleWheel);
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      window.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [handleWheel, handleKeyDown, handleKeyUp, handleMouseDown, handleMouseMove, handleMouseUp]);

  return (
    <CanvasProvider
      value={{
        elements,
        setElements: setElementsWithUndo,
        tool: activeTool,
        selectedElementIds,
        setSelectedElementIds,
        scale,
        panOffset,
        selectionBox,
        setSelectionBox,
        onElementComplete: handleElementComplete,
        onTextEdit: handleTextEdit,
      }}
    >
      <div className="w-screen h-screen overflow-hidden bg-gray-50 relative">
        {/* Canvas */}
        <div className="w-full h-full relative">
          <Canvas/>
        </div>

        {/* Text Editor */}
        {editingText && (
          <TextEditor
            {...editingText}
            onSave={handleTextSave}
            onCancel={() => setEditingText(null)}
          />
        )}

        {/* Property Panel */}
        {selectedElements.length > 0 && (
          <PropertyPanel
            selectedElements={selectedElements}
            onStyleChange={updateStyle}
            onDelete={deleteSelectedElements}
          />
        )}

        {/* Toolbar */}
        <Toolbar
          activeTool={activeTool}
          setActiveTool={setActiveTool}
          onUndo={handleUndo}
          onRedo={handleRedo}
          canUndo={undoStack.length > 0}
          canRedo={redoStack.length > 0}
        />

        {/* Zoom Display */}
        <div className="absolute bottom-4 right-4 bg-white rounded-md shadow-md px-2 py-1 text-sm">
          {Math.round(scale * 100)}%
        </div>
      </div>
    </CanvasProvider>
  );
}

export default App;