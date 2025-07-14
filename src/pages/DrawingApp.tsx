// import { useCallback, useEffect, useState } from "react";
// import { ElementType, ArrowPoint, DrawElement, Connection, Point, ElementStyle } from "../types";
// import { useElementOperations } from "../hooks/useElementOperations";
// import { CanvasProvider } from "../contexts/CanvasContext/CanvasProvider";
// import Canvas from "../components/Canvas/Canvas";
// import TextEditor from "../components/TextEditor";
// import PropertyPanel from "../components/PropertyPanel";
// import Toolbar from "../components/Toolbar";
// import ZoomPanel from "../components/ZoomPanel";
// import { getItemLocalStorage, setItemLocalStorage } from "../utils/localStorage";
// import { useDiagramContext } from "../contexts/DiagramContext/DiagramContext";
// import { useNavigate } from "react-router-dom";
// import InviteButton from "../components/Buttons/InviteButton";

// function areElementsEqual(a: DrawElement[], b: DrawElement[]) {
//     return JSON.stringify(a) === JSON.stringify(b);
// }

// export default function DrawingApp() {
//     // State for drawing elements

//     const { currentDiagramId } = useDiagramContext();
//     const navigate = useNavigate();

//     const initializeElements = () => {
//         if (!currentDiagramId) {
//             // If no diagram ID is set, redirect to dashboard
//             return [];
//         }
//         const storedElements = getItemLocalStorage(`${currentDiagramId}_elements`);
//         if (storedElements && Array.isArray(storedElements)) {
//             return storedElements;
//         }
//         return [];
//     }

//     const initializeConnections = () => {
//         if (!currentDiagramId) {
//             // If no diagram ID is set, redirect to dashboard
//             return [];
//         }
//         const storedConnections = getItemLocalStorage(`${currentDiagramId}_connections`);
//         if (storedConnections && Array.isArray(storedConnections)) {
//             return storedConnections;
//         }
//         return [];
//     }

//     const [elements, setElements] = useState<DrawElement[]>(initializeElements);
//     const [connections, setConnections] = useState<Connection[]>([]);

//     // Undo/Redo stacks
//     const [undoStack, setUndoStack] = useState<DrawElement[][]>([]);
//     const [redoStack, setRedoStack] = useState<DrawElement[][]>([]);

//     // State for the currently selected tool
//     const [activeTool, setActiveTool] = useState<ElementType>('selection');

//     // State for selected elements
//     const [selectedElementIds, setSelectedElementIds] = useState<string[]>([]);

//     // State for hovered elements
//     const [hoveredElement, setHoveredElement] = useState<DrawElement | null>(null);
//     const [arrowStartPoint, setArrowStartPoint] = useState<ArrowPoint | null>(null);
//     const [arrowEndPoint, setArrowEndPoint] = useState<ArrowPoint | null>(null);


//     // State for zoom and pan
//     const [scale, setScale] = useState<number>(1);
//     const [panOffset, setPanOffset] = useState<Point>({ x: 0, y: 0 });
//     const [isPanning, setIsPanning] = useState<boolean>(false);
//     const [lastMousePos, setLastMousePos] = useState<Point>({ x: 0, y: 0 });

//     // State for selection box
//     const [selectionBox, setSelectionBox] = useState<{
//         startX: number;
//         startY: number;
//         width: number;
//         height: number;
//         isActive: boolean;
//     } | null>(null);

//     // State for text editing
//     const [editingText, setEditingText] = useState<{
//         id: string;
//         text: string;
//         x: number;
//         y: number;
//         width: number;
//         height: number;
//         style: ElementStyle;
//     } | null>(null);

//     // Get element operations
//     const {
//         selectedElements,
//         deleteSelectedElements,
//         updateStyle,
//     } = useElementOperations({
//         elements,
//         setElements,
//         selectedElementIds,
//         setSelectedElementIds,
//     });

//     // Wrap setElements to push to undo stack (but not on undo/redo)
//     const setElementsWithUndo = useCallback((updater: (prev: DrawElement[]) => DrawElement[]) => {
//         setElements(prev => {
//             const updated = updater(prev);
//             // Only push to undo stack if the update actually changes the state
//             if (!areElementsEqual(prev, updated)) {
//                 setUndoStack(stack => {
//                     if (stack.length === 0 || !areElementsEqual(stack[stack.length - 1], prev)) {
//                         const slicedStack = stack.length > 50 ? stack.slice(1) : stack;
//                         // Only remember last 50 states
//                         return [...slicedStack, prev];
//                     }
//                     return stack;
//                 });
//                 setRedoStack([]);
//             }
//             // Save updated elements to local storage
//             if (currentDiagramId) {
//                 setItemLocalStorage(`${currentDiagramId}_elements`, updated);
//             } else {
//                 navigate('/dashboard'); // Redirect if no diagram ID
//                 return prev; // Return previous state if no ID
//             }
//             return updated;
//         });
//     }, []);

//     const setConnectionsWithStorage = () => {

//     };

//     // Undo function
//     const handleUndo = useCallback(() => {
//         setUndoStack(prevUndo => {
//             if (prevUndo.length === 0) return prevUndo;
//             const prevElements = prevUndo[prevUndo.length - 1];
//             setElements(currentElements => {
//                 setRedoStack(prevRedo => {
//                     if (prevRedo.length === 0 || !areElementsEqual(prevRedo[prevRedo.length - 1], currentElements)) {
//                         const slicedRedoStack = prevRedo.length > 50 ? prevRedo.slice(1) : prevRedo;
//                         return [...slicedRedoStack, currentElements];
//                     }
//                     return prevRedo;
//                 });
//                 return prevElements;
//             });
//             // Remove the last state from undoStack
//             return prevUndo.slice(0, -1);
//         });
//     }, []);

//     // Redo function
//     const handleRedo = useCallback(() => {
//         setRedoStack(prevRedo => {
//             if (prevRedo.length === 0) return prevRedo;
//             const nextElements = prevRedo[prevRedo.length - 1];
//             setElements(currentElements => {
//                 setUndoStack(prevUndo => {
//                     if (prevUndo.length === 0 || !areElementsEqual(prevUndo[prevUndo.length - 1], currentElements)) {
//                         const slicedUndo = prevUndo.length > 50 ? prevUndo.slice(1) : prevUndo;
//                         return [...slicedUndo, currentElements];
//                     }
//                     return prevUndo;
//                 });
//                 return nextElements;
//             });
//             // Remove the last state from redoStack
//             return prevRedo.slice(0, -1);
//         });
//     }, []);

//     // Handle text editing
//     const handleTextEdit = useCallback((element: DrawElement) => {
//         setEditingText({
//             ...element,
//             text: element.text || '',
//             style: element.style
//         });
//     }, []);

//     // Handle text save
//     const handleTextSave = useCallback((text: string, style: Partial<ElementStyle>) => {
//         if (!editingText) return;

//         setElementsWithUndo(prev => prev.map(el =>
//             el.id === editingText.id
//                 ? { ...el, text, style: { ...el.style, ...style } }
//                 : el
//         ));
//         setEditingText(null);
//         setActiveTool('selection'); // Reset to selection tool after editing
//     }, [editingText, setElementsWithUndo]);

//     // Reset to selection tool after drawing
//     const handleElementComplete = useCallback(() => {
//         setActiveTool('selection');
//     }, []);

//     // Handle wheel for zooming
//     const handleWheel = useCallback((e: WheelEvent) => {
//         e.preventDefault();

//         const newScale = e.deltaY < 0
//             ? Math.min(scale * 1.1, 5)
//             : Math.max(scale / 1.1, 0.1);

//         const mouseX = e.clientX;
//         const mouseY = e.clientY;

//         const newPanOffset = {
//             x: panOffset.x - (mouseX - panOffset.x) * (newScale / scale - 1),
//             y: panOffset.y - (mouseY - panOffset.y) * (newScale / scale - 1),
//         };

//         setScale(newScale);
//         setPanOffset(newPanOffset);
//     }, [scale, panOffset]);

//     // Handle keyboard shortcuts
//     const handleKeyDown = useCallback((e: KeyboardEvent) => {
//         if (e.key === 'Delete' || e.key === 'Backspace') {
//             if (document.activeElement === document.body) {
//                 deleteSelectedElements();
//             }
//         }

//         if (e.key === 'z' && (e.ctrlKey || e.metaKey)) {
//             handleUndo();
//         }
//         if (e.key === 'y' && (e.ctrlKey || e.metaKey)) {
//             handleRedo();
//         }

//         if (e.key === ' ' && !isPanning) {
//             setIsPanning(true);
//             document.body.style.cursor = 'grab';
//         }
//     }, [deleteSelectedElements, isPanning, handleUndo, handleRedo]);

//     const handleKeyUp = useCallback((e: KeyboardEvent) => {
//         if (e.key === ' ') {
//             setIsPanning(false);
//             document.body.style.cursor = 'default';
//         }
//     }, []);

//     // Handle mouse events for panning
//     const handleMouseDown = useCallback((e: MouseEvent) => {
//         if (isPanning) {
//             document.body.style.cursor = 'grabbing';
//             setLastMousePos({ x: e.clientX, y: e.clientY });
//         }
//     }, [isPanning]);

//     const handleMouseMove = useCallback((e: MouseEvent) => {
//         if (isPanning && e.buttons === 1) {
//             const dx = e.clientX - lastMousePos.x;
//             const dy = e.clientY - lastMousePos.y;

//             setPanOffset({
//                 x: panOffset.x + dx,
//                 y: panOffset.y + dy,
//             });

//             setLastMousePos({ x: e.clientX, y: e.clientY });
//         }
//     }, [isPanning, lastMousePos, panOffset]);

//     const handleMouseUp = useCallback(() => {
//         if (isPanning) {
//             document.body.style.cursor = 'grab';
//         }
//     }, [isPanning]);

//     // Add event listeners
//     useEffect(() => {
//         window.addEventListener('wheel', handleWheel, { passive: false });
//         window.addEventListener('keydown', handleKeyDown);
//         window.addEventListener('keyup', handleKeyUp);
//         window.addEventListener('mousedown', handleMouseDown);
//         window.addEventListener('mousemove', handleMouseMove);
//         window.addEventListener('mouseup', handleMouseUp);

//         return () => {
//             window.removeEventListener('wheel', handleWheel);
//             window.removeEventListener('keydown', handleKeyDown);
//             window.removeEventListener('keyup', handleKeyUp);
//             window.removeEventListener('mousedown', handleMouseDown);
//             window.removeEventListener('mousemove', handleMouseMove);
//             window.removeEventListener('mouseup', handleMouseUp);
//         };
//     }, [handleWheel, handleKeyDown, handleKeyUp, handleMouseDown, handleMouseMove, handleMouseUp]);

//     return (
//         <CanvasProvider
//             value={{
//                 elements,
//                 setElements: setElementsWithUndo,
//                 tool: activeTool,
//                 setActiveTool,
//                 selectedElementIds,
//                 setSelectedElementIds,
//                 scale,
//                 setScale,
//                 panOffset,
//                 selectionBox,
//                 setSelectionBox,
//                 onElementComplete: handleElementComplete,
//                 onTextEdit: handleTextEdit,
//                 hoveredElement,
//                 setHoveredElement,
//                 arrowStartPoint,
//                 setArrowStartPoint,
//                 arrowEndPoint,
//                 setArrowEndPoint,
//                 connections,
//                 setConnections,
//             }}
//         >
//             <div className="w-screen h-screen overflow-hidden bg-gray-50 relative">
//                 {/* Canvas */}
//                 <div className="w-full h-full relative">
//                     <Canvas />
//                 </div>

//                 {/* Text Editor */}
//                 {editingText && (
//                     <TextEditor
//                         {...editingText}
//                         onSave={handleTextSave}
//                         onCancel={() => setEditingText(null)}
//                     />
//                 )}

//                 {/* Property Panel */}
//                 {selectedElements.length > 0 && (
//                     <PropertyPanel
//                         selectedElements={selectedElements}
//                         onStyleChange={updateStyle}
//                         onDelete={deleteSelectedElements}
//                     />
//                 )}

//                 {/* Toolbar */}
//                 <Toolbar
//                     activeTool={activeTool}
//                     setActiveTool={setActiveTool}
//                     onUndo={handleUndo}
//                     onRedo={handleRedo}
//                     canUndo={undoStack.length > 0}
//                     canRedo={redoStack.length > 0}
//                 />

//                 <InviteButton diagramId={currentDiagramId!} />

//                 {/* Zoom Display */}
//                 <ZoomPanel />
//             </div>
//         </CanvasProvider>
//     );
// }

import { useCallback, useEffect, useState } from "react";
import { ElementType, ArrowPoint, DrawElement, Connection, Point, ElementStyle } from "../types";
import { useElementOperations } from "../hooks/useElementOperations";
import { CanvasProvider } from "../contexts/CanvasContext/CanvasProvider";
import Canvas from "../components/Canvas/Canvas";
import TextEditor from "../components/TextEditor";
import PropertyPanel from "../components/PropertyPanel";
import Toolbar from "../components/Toolbar";
import ZoomPanel from "../components/ZoomPanel";
import { getItemLocalStorage, setItemLocalStorage } from "../utils/localStorage";
import { useDiagramContext } from "../contexts/DiagramContext/DiagramContext";
import { useNavigate } from "react-router-dom";
import InviteButton from "../components/Buttons/InviteButton";

function areEqual(a: DrawElement[], b: DrawElement[]) {
    return JSON.stringify(a) === JSON.stringify(b);
}

function areConnectionsEqual(a: Connection[], b: Connection[]) {
    return JSON.stringify(a) === JSON.stringify(b);
}

function DrawingApp() {
    const { currentDiagramId } = useDiagramContext();
    const navigate = useNavigate();

    const initializeElements = () => {
        if (!currentDiagramId) return [];
        const stored = getItemLocalStorage(`${currentDiagramId}_elements`);
        return Array.isArray(stored) ? stored : [];
    };

    const initializeConnections = () => {
        if (!currentDiagramId) return [];
        const stored = getItemLocalStorage(`${currentDiagramId}_connections`);
        return Array.isArray(stored) ? stored : [];
    };

    const [elements, setElements] = useState<DrawElement[]>(initializeElements);
    const [connections, setConnections] = useState<Connection[]>(initializeConnections);

    type Snapshot = { elements: DrawElement[]; connections: Connection[] };
    const [undoStack, setUndoStack] = useState<Snapshot[]>([]);
    const [redoStack, setRedoStack] = useState<Snapshot[]>([]);

    const [activeTool, setActiveTool] = useState<ElementType>('selection');
    const [selectedElementIds, setSelectedElementIds] = useState<string[]>([]);
    const [hoveredElement, setHoveredElement] = useState<DrawElement | null>(null);
    const [arrowStartPoint, setArrowStartPoint] = useState<ArrowPoint | null>(null);
    const [arrowEndPoint, setArrowEndPoint] = useState<ArrowPoint | null>(null);

    const [scale, setScale] = useState<number>(1);
    const [panOffset, setPanOffset] = useState<Point>({ x: 0, y: 0 });
    const [isPanning, setIsPanning] = useState<boolean>(false);
    const [lastMousePos, setLastMousePos] = useState<Point>({ x: 0, y: 0 });

    const [selectionBox, setSelectionBox] = useState<{
        startX: number;
        startY: number;
        width: number;
        height: number;
        isActive: boolean;
    } | null>(null);

    const [editingText, setEditingText] = useState<{
        id: string;
        text: string;
        x: number;
        y: number;
        width: number;
        height: number;
        style: ElementStyle;
    } | null>(null);

    const pushToUndoStack = useCallback((prevElements: DrawElement[], prevConnections: Connection[]) => {
        setUndoStack(stack => {
            const newStack = stack.length >= 50 ? stack.slice(1) : stack;
            return [...newStack, { elements: prevElements, connections: prevConnections }];
        });
        setRedoStack([]);
    }, []);

    const setElementsWithUndo = useCallback((updater: (prev: DrawElement[]) => DrawElement[]) => {
        setElements(prev => {
            const updated = updater(prev);
            if (!areEqual(prev, updated)) {
                pushToUndoStack(prev, connections);
                if (currentDiagramId) {
                    setItemLocalStorage(`${currentDiagramId}_elements`, updated);
                } else {
                    navigate('/dashboard');
                    return prev;
                }
            }
            return updated;
        });
    }, [connections, currentDiagramId, navigate, pushToUndoStack]);

    const setConnectionsWithUndo = useCallback((updater: (prev: Connection[]) => Connection[]) => {
        setConnections(prev => {
            const updated = updater(prev);
            if (!areConnectionsEqual(prev, updated)) {
                pushToUndoStack(elements, prev);
                if (currentDiagramId) {
                    setItemLocalStorage(`${currentDiagramId}_connections`, updated);
                } else {
                    navigate('/dashboard');
                    return prev;
                }
            }
            return updated;
        });
    }, [elements, currentDiagramId, navigate, pushToUndoStack]);

    const {
        selectedElements,
        deleteSelectedElements,
        updateStyle,
    } = useElementOperations({
        elements,
        setElements: setElementsWithUndo,
        selectedElementIds,
        setSelectedElementIds,
        connections,
        setConnections: setConnectionsWithUndo
    });

    const handleUndo = useCallback(() => {
        setUndoStack(prev => {
            if (prev.length === 0) return prev;
            const last = prev[prev.length - 1];
            setRedoStack(stack => [...stack, { elements, connections }]);
            setElements(last.elements);
            setConnections(last.connections);
            return prev.slice(0, -1);
        });
    }, [elements, connections]);

    const handleRedo = useCallback(() => {
        setRedoStack(prev => {
            if (prev.length === 0) return prev;
            const last = prev[prev.length - 1];
            setUndoStack(stack => [...stack, { elements, connections }]);
            setElements(last.elements);
            setConnections(last.connections);
            return prev.slice(0, -1);
        });
    }, [elements, connections]);

    const handleTextEdit = useCallback((element: DrawElement) => {
        setEditingText({
            ...element,
            text: element.text || '',
            style: element.style
        });
    }, []);

    const handleTextSave = useCallback((text: string, style: Partial<ElementStyle>) => {
        if (!editingText) return;
        setElementsWithUndo(prev => prev.map(el =>
            el.id === editingText.id
                ? { ...el, text, style: { ...el.style, ...style } }
                : el
        ));
        setEditingText(null);
        setActiveTool('selection');
    }, [editingText, setElementsWithUndo]);

    const handleElementComplete = useCallback(() => {
        setActiveTool('selection');
    }, []);

    const handleWheel = useCallback((e: WheelEvent) => {
        e.preventDefault();
        const newScale = e.deltaY < 0 ? Math.min(scale * 1.1, 5) : Math.max(scale / 1.1, 0.1);
        const mouseX = e.clientX;
        const mouseY = e.clientY;

        const newPanOffset = {
            x: panOffset.x - (mouseX - panOffset.x) * (newScale / scale - 1),
            y: panOffset.y - (mouseY - panOffset.y) * (newScale / scale - 1),
        };

        setScale(newScale);
        setPanOffset(newPanOffset);
    }, [scale, panOffset]);

    const handleKeyDown = useCallback((e: KeyboardEvent) => {
        if (e.key === 'Delete' || e.key === 'Backspace') {
            if (document.activeElement === document.body) {
                deleteSelectedElements();
            }
        }
        if (e.key === 'z' && (e.ctrlKey || e.metaKey)) handleUndo();
        if (e.key === 'y' && (e.ctrlKey || e.metaKey)) handleRedo();
        if (e.key === ' ' && !isPanning) {
            setIsPanning(true);
            document.body.style.cursor = 'grab';
        }
    }, [deleteSelectedElements, handleUndo, handleRedo, isPanning]);

    const handleKeyUp = useCallback((e: KeyboardEvent) => {
        if (e.key === ' ') {
            setIsPanning(false);
            document.body.style.cursor = 'default';
        }
    }, []);

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
            setPanOffset(prev => ({ x: prev.x + dx, y: prev.y + dy }));
            setLastMousePos({ x: e.clientX, y: e.clientY });
        }
    }, [isPanning, lastMousePos]);

    const handleMouseUp = useCallback(() => {
        if (isPanning) {
            document.body.style.cursor = 'grab';
        }
    }, [isPanning]);

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
                setActiveTool,
                selectedElementIds,
                setSelectedElementIds,
                scale,
                setScale,
                panOffset,
                selectionBox,
                setSelectionBox,
                onElementComplete: handleElementComplete,
                onTextEdit: handleTextEdit,
                hoveredElement,
                setHoveredElement,
                arrowStartPoint,
                setArrowStartPoint,
                arrowEndPoint,
                setArrowEndPoint,
                connections,
                setConnections: setConnectionsWithUndo,
            }}
        >
            <div className="w-screen h-screen overflow-hidden bg-gray-50 relative">
                <div className="w-full h-full relative">
                    <Canvas />
                </div>
                {editingText && (
                    <TextEditor
                        {...editingText}
                        onSave={handleTextSave}
                        onCancel={() => setEditingText(null)}
                    />
                )}
                {selectedElements.length > 0 && (
                    <PropertyPanel
                        selectedElements={selectedElements}
                        onStyleChange={updateStyle}
                        onDelete={deleteSelectedElements}
                    />
                )}
                <Toolbar
                    activeTool={activeTool}
                    setActiveTool={setActiveTool}
                    onUndo={handleUndo}
                    onRedo={handleRedo}
                    canUndo={undoStack.length > 0}
                    canRedo={redoStack.length > 0}
                />
                <InviteButton diagramId={currentDiagramId!} />
                <ZoomPanel />
            </div>
        </CanvasProvider>
    );
}

export default DrawingApp;