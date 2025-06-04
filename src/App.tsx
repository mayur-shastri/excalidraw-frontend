import React, { useState, useCallback, useEffect } from 'react';
import Canvas from './components/Canvas';
import Toolbar from './components/Toolbar';
import PropertyPanel from './components/PropertyPanel';
import TextEditor from './components/TextEditor';
import { DrawElement, ElementType, Point, ElementStyle } from './types';
import { useElementOperations } from './hooks/useElementOperations';

function App() {
  // State for drawing elements
  const [elements, setElements] = useState<DrawElement[]>([]);
  
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
    startDragging,
    dragElements,
    stopDragging,
    rotateElements,
  } = useElementOperations({
    elements,
    setElements,
    selectedElementIds,
    setSelectedElementIds,
  });

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

    setElements(prev => prev.map(el => 
      el.id === editingText.id 
        ? { ...el, text, style: { ...el.style, ...style } }
        : el
    ));
    setEditingText(null);
    setActiveTool('selection'); // Reset to selection tool after editing
  }, [editingText]);

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
      // Undo functionality would go here
    }
    
    if (e.key === ' ' && !isPanning) {
      setIsPanning(true);
      document.body.style.cursor = 'grab';
    }
  }, [deleteSelectedElements, isPanning]);

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
    <div className="w-screen h-screen overflow-hidden bg-gray-50 relative">
      {/* Canvas */}
      <div className="w-full h-full relative">
        <Canvas
          elements={elements}
          setElements={setElements}
          tool={activeTool}
          selectedElementIds={selectedElementIds}
          setSelectedElementIds={setSelectedElementIds}
          scale={scale}
          panOffset={panOffset}
          selectionBox={selectionBox}
          setSelectionBox={setSelectionBox}
          onElementComplete={handleElementComplete}
          onTextEdit={handleTextEdit}
        />
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
      />
      
      {/* Zoom Display */}
      <div className="absolute bottom-4 right-4 bg-white rounded-md shadow-md px-2 py-1 text-sm">
        {Math.round(scale * 100)}%
      </div>
    </div>
  );
}

export default App;