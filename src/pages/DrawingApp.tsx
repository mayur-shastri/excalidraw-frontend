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
import { useWebsocketSignaling } from "../hooks/useWebsocketSignaling";
import ButtonGroup from "../components/DrawingApp/ButtonGroup/ButtonGroup";
import { supabase } from "../utils/supabaseClient";
import { toast } from "sonner";
import axios from "axios";
import Loading from "./Loading";
import { mergeElements } from "../webrtc/mergeElements";
import { mergeConnections } from "../webrtc/mergeConnections";

function areEqual(a: DrawElement[], b: DrawElement[]) {
    return JSON.stringify(a) === JSON.stringify(b);
}

function areConnectionsEqual(a: Connection[], b: Connection[]) {
    return JSON.stringify(a) === JSON.stringify(b);
}

function DrawingApp() {

    type Snapshot = { elements: DrawElement[]; connections: Connection[] };
    const { currentDiagramId } = useDiagramContext();
    const navigate = useNavigate();

    const {peerConnectionsRef, peerIdRef, dataChannelsRef, peerColorRef, peerNameRef} = useWebsocketSignaling();

    const [loading, setLoading] = useState<boolean>(true);

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

            const enriched = updated.map(el => {
                const prevEl = prev.find(p => p.id === el.id);
                if (!prevEl) {
                    // New element
                    return {
                        ...el,
                        version: Date.now(),
                        versionNonce: Math.random(),
                        isDeleted: el.isDeleted ?? false,
                    };
                }

                const changed = JSON.stringify(prevEl) !== JSON.stringify(el);
                if (!changed) return el;

                return {
                    ...el,
                    version: Date.now(), // or prevEl.version + 1
                    versionNonce: Math.random(),
                    isDeleted: el.isDeleted ?? false,
                };
            });

            // Detect deleted elements (present in prev, but not in updated)
            const deleted = prev.filter(p => !updated.find(u => u.id === p.id)).map(deletedEl => ({
                ...deletedEl,
                version: Date.now(),
                versionNonce: Math.random(),
                isDeleted: true,
            }));

            const finalElements = [...enriched, ...deleted];

            if (!areEqual(prev, finalElements)) {
                pushToUndoStack(prev, connections);
                if (currentDiagramId) {
                    setItemLocalStorage(`${currentDiagramId}_elements`, finalElements);
                } else {
                    navigate('/dashboard');
                    return prev;
                }
            }

            return finalElements;
        });
    }, [connections, currentDiagramId, navigate, pushToUndoStack]);

    const setConnectionsWithUndo = useCallback((updater: (prev: Connection[]) => Connection[]) => {
        setConnections(prev => {
            const updated = updater(prev);

            const enriched = updated.map(conn => {
                const prevConn = prev.find(p => p.id === conn.id);
                if (!prevConn) {
                    return {
                        ...conn,
                        version: Date.now(),
                        versionNonce: Math.random(),
                        isDeleted: conn.isDeleted ?? false
                    };
                }

                const changed = JSON.stringify(prevConn) !== JSON.stringify(conn);
                if (!changed) return conn;

                return {
                    ...conn,
                    version: Date.now(),
                    versionNonce: Math.random(),
                    isDeleted: conn.isDeleted ?? false
                };
            });

            const deleted = prev.filter(p => !updated.find(u => u.id === p.id)).map(deletedConn => ({
                ...deletedConn,
                version: Date.now(),
                versionNonce: Math.random(),
                isDeleted: true,
            }));

            const finalConnections = [...enriched, ...deleted];

            if (!areConnectionsEqual(prev, finalConnections)) {
                pushToUndoStack(elements, prev);
                if (currentDiagramId) {
                    setItemLocalStorage(`${currentDiagramId}_connections`, finalConnections);
                } else {
                    navigate('/dashboard');
                    return prev;
                }
            }

            return finalConnections;
        });
    }, [elements, currentDiagramId, navigate, pushToUndoStack]);

    const {
        selectedElements,
        deleteSelectedElements,
        updateStyle,
    } = useElementOperations({
        elements,
        setElementsWithUndo,
        selectedElementIds,
        setSelectedElementIds,
        connections,
        setConnectionsWithUndo
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
        const getDiagramFromDatabase = async () => {
            const { data: { session }, error: sessionError } = await supabase.auth.getSession();
            if (sessionError || !session) {
                toast.error(sessionError?.message || 'User not authenticated');
                setLoading(false);
                return;
            }
            const accessToken = session.access_token;
            axios.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`;
            const res = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/diagrams/get/${currentDiagramId}`);

            setElements((prev: DrawElement[]): DrawElement[] => {
                const mergedElements = mergeElements(prev, res.data.elements, currentDiagramId);
                return mergedElements;
            });
            setConnections((prev: Connection[]): Connection[] => {
                const mergedConnections = mergeConnections(prev, res.data.connections, currentDiagramId);
                return mergedConnections;
            });
            setLoading(false);
        }

        getDiagramFromDatabase();
    }, [currentDiagramId]);

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
        loading ? <Loading /> :
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
                    peerConnectionsRef,
                    dataChannelsRef,
                    peerIdRef,
                    lastMousePos,
                    peerColorRef,
                    peerNameRef
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
                    <ButtonGroup />
                    <ZoomPanel />
                </div>
            </CanvasProvider>
    );
}

export default DrawingApp;