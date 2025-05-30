// import React, { useRef, useState, useEffect } from 'react';
// import { ArrowElement, DrawElement, ElementType, LineElement, Point, TextElement } from '../types';
// import { renderElement } from '../utils/renderElements';
// import { generateId } from '../utils/helpers';
// import { defaultStyle } from '../constants';

// interface CanvasProps {
//   elements: DrawElement[];
//   setElements: React.Dispatch<React.SetStateAction<DrawElement[]>>;
//   tool: ElementType;
//   selectedElementIds: string[];
//   setSelectedElementIds: React.Dispatch<React.SetStateAction<string[]>>;
//   scale: number;
//   panOffset: Point;
//   onElementComplete: () => void;
//   onTextEdit: (element: TextElement) => void;
//   selectionBox: {
//     startX: number;
//     startY: number;
//     width: number;
//     height: number;
//     isActive: boolean;
//   } | null;
//   setSelectionBox: React.Dispatch<React.SetStateAction<{
//     startX: number;
//     startY: number;
//     width: number;
//     height: number;
//     isActive: boolean;
//   } | null>>;
// }

// // Resize direction type
// type ResizeDirection = 'n' | 'ne' | 'e' | 'se' | 's' | 'sw' | 'w' | 'nw' | null;

// const Canvas: React.FC<CanvasProps> = ({
//   elements,
//   setElements,
//   tool,
//   selectedElementIds,
//   setSelectedElementIds,
//   scale,
//   panOffset,
//   selectionBox,
//   setSelectionBox,
// }) => {
//   const canvasRef = useRef<HTMLCanvasElement>(null);
//   const [isDrawing, setIsDrawing] = useState(false);
//   const [isResizing, setIsResizing] = useState(false);
//   const [startPoint, setStartPoint] = useState<Point>({ x: 0, y: 0 });
//   const [currentElement, setCurrentElement] = useState<DrawElement | null>(null);
//   const [resizeDirection, setResizeDirection] = useState<ResizeDirection>(null);
//   const [originalElements, setOriginalElements] = useState<DrawElement[]>([]);

//   // Clear canvas and redraw all elements
//   const redrawCanvas = () => {
//     const canvas = canvasRef.current;
//     if (!canvas) return;
    
//     const ctx = canvas.getContext('2d');
//     if (!ctx) return;

//     // Clear canvas
//     ctx.clearRect(0, 0, canvas.width, canvas.height);

//     // Apply zoom and pan transformations
//     ctx.save();
//     ctx.translate(panOffset.x, panOffset.y);
//     ctx.scale(scale, scale);

//     // Draw grid
//     drawGrid(ctx, canvas.width, canvas.height);

//     // Draw all elements
//     elements.forEach(element => {
//       renderElement(ctx, element);
//     });

//     // Draw selection box if active
//     if (selectionBox?.isActive) {
//       ctx.strokeStyle = '#4285f4';
//       ctx.lineWidth = 1;
//       ctx.setLineDash([5, 5]);
//       ctx.strokeRect(
//         selectionBox.startX,
//         selectionBox.startY,
//         selectionBox.width,
//         selectionBox.height
//       );
//       ctx.setLineDash([]);
//     }

//     // Draw resize handles if elements are selected
//     if (selectedElementIds.length > 0 && !isDrawing) {
//       drawResizeHandles(ctx);
//     }

//     ctx.restore();
//   };

//   // Draw resize handles around selected elements
//   const drawResizeHandles = (ctx: CanvasRenderingContext2D) => {
//     const selectedElements = elements.filter(el => selectedElementIds.includes(el.id));
//     if (selectedElements.length === 0) return;

//     // Calculate combined bounding box for all selected elements
//     let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
    
//     selectedElements.forEach(element => {
//       minX = Math.min(minX, element.x);
//       minY = Math.min(minY, element.y);
//       maxX = Math.max(maxX, element.x + element.width);
//       maxY = Math.max(maxY, element.y + element.height);
//     });

//     const width = maxX - minX;
//     const height = maxY - minY;

//     // Draw the bounding box
//     ctx.strokeStyle = '#4285f4';
//     ctx.lineWidth = 1 / scale; // Adjust for zoom
//     ctx.setLineDash([5, 5]);
//     ctx.strokeRect(minX, minY, width, height);
//     ctx.setLineDash([]);

//     // Draw resize handles
//     const handleSize = 8 / scale; // Adjust handle size based on zoom
//     const halfHandle = handleSize / 2;

//     // Positions for all 8 handles
//     const handles = [
//       { x: minX - halfHandle, y: minY - halfHandle, dir: 'nw' }, // top-left
//       { x: minX + width / 2 - halfHandle, y: minY - halfHandle, dir: 'n' }, // top
//       { x: minX + width - halfHandle, y: minY - halfHandle, dir: 'ne' }, // top-right
//       { x: minX + width - halfHandle, y: minY + height / 2 - halfHandle, dir: 'e' }, // right
//       { x: minX + width - halfHandle, y: minY + height - halfHandle, dir: 'se' }, // bottom-right
//       { x: minX + width / 2 - halfHandle, y: minY + height - halfHandle, dir: 's' }, // bottom
//       { x: minX - halfHandle, y: minY + height - halfHandle, dir: 'sw' }, // bottom-left
//       { x: minX - halfHandle, y: minY + height / 2 - halfHandle, dir: 'w' }, // left
//     ];

//     ctx.fillStyle = '#ffffff';
//     ctx.strokeStyle = '#4285f4';
//     ctx.lineWidth = 1 / scale;

//     handles.forEach(handle => {
//       ctx.beginPath();
//       ctx.rect(handle.x, handle.y, handleSize, handleSize);
//       ctx.fill();
//       ctx.stroke();
//     });
//   };

//   // Check if mouse is over a resize handle
//   const checkResizeHandle = (point: Point): ResizeDirection => {
//     const selectedElements = elements.filter(el => selectedElementIds.includes(el.id));
//     if (selectedElements.length === 0) return null;

//     // Calculate combined bounding box
//     let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
    
//     selectedElements.forEach(element => {
//       minX = Math.min(minX, element.x);
//       minY = Math.min(minY, element.y);
//       maxX = Math.max(maxX, element.x + element.width);
//       maxY = Math.max(maxY, element.y + element.height);
//     });

//     const width = maxX - minX;
//     const height = maxY - minY;

//     const handleSize = 8 / scale;
//     const tolerance = handleSize * 2; // Increase hit area

//     // Check each handle position
//     if (isPointInRect(point, minX - handleSize/2, minY - handleSize/2, handleSize, tolerance)) return 'nw';
//     if (isPointInRect(point, minX + width/2 - handleSize/2, minY - handleSize/2, handleSize, tolerance)) return 'n';
//     if (isPointInRect(point, minX + width - handleSize/2, minY - handleSize/2, handleSize, tolerance)) return 'ne';
//     if (isPointInRect(point, minX + width - handleSize/2, minY + height/2 - handleSize/2, handleSize, tolerance)) return 'e';
//     if (isPointInRect(point, minX + width - handleSize/2, minY + height - handleSize/2, handleSize, tolerance)) return 'se';
//     if (isPointInRect(point, minX + width/2 - handleSize/2, minY + height - handleSize/2, handleSize, tolerance)) return 's';
//     if (isPointInRect(point, minX - handleSize/2, minY + height - handleSize/2, handleSize, tolerance)) return 'sw';
//     if (isPointInRect(point, minX - handleSize/2, minY + height/2 - handleSize/2, handleSize, tolerance)) return 'w';

//     return null;
//   };

//   // Helper function to check if point is in rectangle
//   const isPointInRect = (point: Point, x: number, y: number, width: number, height: number): boolean => {
//     return point.x >= x && point.x <= x + width && point.y >= y && point.y <= y + height;
//   };

//   // Resize selected elements
//   const resizeElements = (direction: ResizeDirection, start: Point, current: Point) => {
//     if (!direction || selectedElementIds.length === 0) return;

//     const deltaX = current.x - start.x;
//     const deltaY = current.y - start.y;

//     setElements(prevElements => {
//       return prevElements.map(element => {
//         if (!selectedElementIds.includes(element.id)) return element;

//         // Find the original state of the element
//         const originalElement = originalElements.find(el => el.id === element.id);
//         if (!originalElement) return element;

//         const newElement = { ...element };
//         const originalX = originalElement.x;
//         const originalY = originalElement.y;
//         const originalWidth = originalElement.width;
//         const originalHeight = originalElement.height;

//         switch (direction) {
//           case 'nw':
//             newElement.x = originalX + deltaX;
//             newElement.y = originalY + deltaY;
//             newElement.width = originalWidth - deltaX;
//             newElement.height = originalHeight - deltaY;
//             break;
//           case 'n':
//             newElement.y = originalY + deltaY;
//             newElement.height = originalHeight - deltaY;
//             break;
//           case 'ne':
//             newElement.y = originalY + deltaY;
//             newElement.width = originalWidth + deltaX;
//             newElement.height = originalHeight - deltaY;
//             break;
//           case 'e':
//             newElement.width = originalWidth + deltaX;
//             break;
//           case 'se':
//             newElement.width = originalWidth + deltaX;
//             newElement.height = originalHeight + deltaY;
//             break;
//           case 's':
//             newElement.height = originalHeight + deltaY;
//             break;
//           case 'sw':
//             newElement.x = originalX + deltaX;
//             newElement.width = originalWidth - deltaX;
//             newElement.height = originalHeight + deltaY;
//             break;
//           case 'w':
//             newElement.x = originalX + deltaX;
//             newElement.width = originalWidth - deltaX;
//             break;
//         }

//         // Ensure minimum dimensions
//         if (newElement.width < 5) newElement.width = 5;
//         if (newElement.height < 5) newElement.height = 5;

//         return newElement;
//       });
//     });
//   };

//   // Draw grid background
//   const drawGrid = (ctx: CanvasRenderingContext2D, width: number, height: number) => {
//     const gridSize = 20;
//     ctx.strokeStyle = '#f0f0f0';
//     ctx.lineWidth = 1;

//     // Adjust grid offset based on pan
//     const offsetX = (panOffset.x % gridSize) / scale;
//     const offsetY = (panOffset.y % gridSize) / scale;

//     for (let x = offsetX; x < width / scale; x += gridSize) {
//       ctx.beginPath();
//       ctx.moveTo(x, 0);
//       ctx.lineTo(x, height / scale);
//       ctx.stroke();
//     }

//     for (let y = offsetY; y < height / scale; y += gridSize) {
//       ctx.beginPath();
//       ctx.moveTo(0, y);
//       ctx.lineTo(width / scale, y);
//       ctx.stroke();
//     }
//   };

//   // Get canvas coordinates from mouse event
//   const getCoordinates = (event: React.MouseEvent<HTMLCanvasElement>): Point => {
//     const canvas = canvasRef.current;
//     if (!canvas) return { x: 0, y: 0 };

//     const rect = canvas.getBoundingClientRect();
//     const x = (event.clientX - rect.left - panOffset.x) / scale;
//     const y = (event.clientY - rect.top - panOffset.y) / scale;
//     return { x, y };
//   };

//   // Create a new element based on the selected tool
//   const createElement = (type: ElementType, start: Point): DrawElement | null => {
//     const id = generateId();
    
//     switch (type) {
//       case 'freedraw':
//         return {
//           id,
//           type: 'freedraw',
//           points: [start],
//           x: start.x,
//           y: start.y,
//           width: 0,
//           height: 0,
//           angle: 0,
//           style: { ...defaultStyle },
//           isSelected: false,
//         };
//       case 'rectangle':
//         return {
//           id,
//           type: 'rectangle',
//           x: start.x,
//           y: start.y,
//           width: 0,
//           height: 0,
//           angle: 0,
//           style: { ...defaultStyle },
//           isSelected: false,
//         };
//       case 'ellipse':
//         return {
//           id,
//           type: 'ellipse',
//           x: start.x,
//           y: start.y,
//           width: 0,
//           height: 0,
//           angle: 0,
//           style: { ...defaultStyle },
//           isSelected: false,
//         };
//       case 'arrow':
//         return {
//           id,
//           type: 'arrow',
//           startPoint: start,
//           endPoint: start,
//           x: start.x,
//           y: start.y,
//           width: 0,
//           height: 0,
//           angle: 0,
//           style: { ...defaultStyle },
//           isSelected: false,
//         };
//       case 'line':
//         return {
//           id,
//           type: 'line',
//           startPoint: start,
//           endPoint: start,
//           x: start.x,
//           y: start.y,
//           width: 0,
//           height: 0,
//           angle: 0,
//           style: { ...defaultStyle },
//           isSelected: false,
//         };
//       case 'diamond':
//         return {
//           id,
//           type: 'diamond',
//           x: start.x,
//           y: start.y,
//           width: 0,
//           height: 0,
//           angle: 0,
//           style: { ...defaultStyle },
//           isSelected: false,
//         };
//       case 'rhombus':
//         return {
//           id,
//           type: 'rhombus',
//           x: start.x,
//           y: start.y,
//           width: 0,
//           height: 0,
//           angle: 0,
//           style: { ...defaultStyle },
//           isSelected: false,
//         };
//       case 'text':
//         return {
//           id,
//           type: 'text',
//           x: start.x,
//           y: start.y,
//           width: 100,
//           height: 24,
//           angle: 0,
//           style: { ...defaultStyle },
//           isSelected: false,
//           text: 'Double click to edit',
//         };
//       default:
//         return null;
//     }
//   };

//   // Handle element selection
//   const findElementAtPosition = (point: Point): DrawElement | null => {
//     // Iterate in reverse to check elements from front to back
//     for (let i = elements.length - 1; i >= 0; i--) {
//       const element = elements[i];
//       const { x, y, width, height } = element;
      
//       // Simple bounding box check
//       if (
//         point.x >= x && 
//         point.x <= x + width && 
//         point.y >= y && 
//         point.y <= y + height
//       ) {
//         return element;
//       }
//     }
//     return null;
//   };

//   // Find elements within selection box
//   const findElementsInSelectionBox = () => {
//     if (!selectionBox) return [];
    
//     const selectedElements = elements.filter(element => {
//       const elementRight = element.x + element.width;
//       const elementBottom = element.y + element.height;
//       const boxRight = selectionBox.startX + selectionBox.width;
//       const boxBottom = selectionBox.startY + selectionBox.height;
      
//       return (
//         element.x < boxRight &&
//         elementRight > selectionBox.startX &&
//         element.y < boxBottom &&
//         elementBottom > selectionBox.startY
//       );
//     });
    
//     return selectedElements.map(element => element.id);
//   };

//   // Handle mouse down event
//   const handleMouseDown = (event: React.MouseEvent<HTMLCanvasElement>) => {
//     const point = getCoordinates(event);
//     setStartPoint(point);

//     // Check if we're resizing
//     const resizeDir = checkResizeHandle(point);
//     if (resizeDir && selectedElementIds.length > 0) {
//       setIsResizing(true);
//       setResizeDirection(resizeDir);
//       setOriginalElements(elements.filter(el => selectedElementIds.includes(el.id)));
//       return;
//     }

//     setIsDrawing(true);

//     if (tool === 'selection') {
//       const clickedElement = findElementAtPosition(point);
      
//       if (clickedElement) {
//         // If shift key is pressed, toggle selection
//         if (event.shiftKey) {
//           if (selectedElementIds.includes(clickedElement.id)) {
//             setSelectedElementIds(prev => prev.filter(id => id !== clickedElement.id));
//           } else {
//             setSelectedElementIds(prev => [...prev, clickedElement.id]);
//           }
//         } else {
//           // If element already selected, keep selection for dragging
//           if (!selectedElementIds.includes(clickedElement.id)) {
//             setSelectedElementIds([clickedElement.id]);
//           }
//         }
//       } else {
//         // Start selection box
//         setSelectionBox({
//           startX: point.x,
//           startY: point.y,
//           width: 0,
//           height: 0,
//           isActive: true,
//         });
        
//         // Clear selection if not holding shift
//         if (!event.shiftKey) {
//           setSelectedElementIds([]);
//         }
//       }
//     } else {
//       // Clear selection when drawing new elements
//       setSelectedElementIds([]);
      
//       // Create a new element
//       const newElement = createElement(tool, point);
//       if (newElement) {
//         setCurrentElement(newElement);
//       }
//     }
//   };

//   // Handle mouse move event
//   const handleMouseMove = (event: React.MouseEvent<HTMLCanvasElement>) => {
//     const currentPoint = getCoordinates(event);
    
//     if (isResizing && resizeDirection) {
//       resizeElements(resizeDirection, startPoint, currentPoint);
//       redrawCanvas();
//       return;
//     }

//     if (!isDrawing) {
//       // Update cursor based on resize handle hover
//       const resizeDir = checkResizeHandle(currentPoint);
//       const canvas = canvasRef.current;
//       if (canvas) {
//         if (resizeDir) {
//           let cursor = '';
//           switch (resizeDir) {
//             case 'n':
//             case 's':
//               cursor = 'ns-resize';
//               break;
//             case 'e':
//             case 'w':
//               cursor = 'ew-resize';
//               break;
//             case 'nw':
//             case 'se':
//               cursor = 'nwse-resize';
//               break;
//             case 'ne':
//             case 'sw':
//               cursor = 'nesw-resize';
//               break;
//           }
//           canvas.style.cursor = cursor;
//         } else {
//           canvas.style.cursor = tool === 'selection' ? 'default' : 'crosshair';
//         }
//       }
//       return;
//     }
    
//     if (tool === 'selection' && selectionBox?.isActive) {
//       // Update selection box
//       setSelectionBox(prev => {
//         if (!prev) return null;
//         return {
//           ...prev,
//           width: currentPoint.x - prev.startX,
//           height: currentPoint.y - prev.startY,
//         };
//       });
//     } else if (currentElement) {
//       // Update element based on type
//       const updatedElement = { ...currentElement };
      
//       switch (currentElement.type) {
//         case 'freedraw': {
//           updatedElement.points = [...(updatedElement as FreedrawElement).points, currentPoint];
//           // Update bounding box
//           const points = (updatedElement as FreedrawElement).points;
//           let minX = points[0].x;
//           let minY = points[0].y;
//           let maxX = points[0].x;
//           let maxY = points[0].y;
          
//           points.forEach(point => {
//             minX = Math.min(minX, point.x);
//             minY = Math.min(minY, point.y);
//             maxX = Math.max(maxX, point.x);
//             maxY = Math.max(maxY, point.y);
//           });
          
//           updatedElement.x = minX;
//           updatedElement.y = minY;
//           updatedElement.width = maxX - minX;
//           updatedElement.height = maxY - minY;
//           break;
//         }
//         case 'rectangle':
//         case 'ellipse':
//         case 'diamond':
//         case 'rhombus': {
//           updatedElement.width = currentPoint.x - startPoint.x;
//           updatedElement.height = currentPoint.y - startPoint.y;
//           // Handle negative dimensions
//           if (updatedElement.width < 0) {
//             updatedElement.x = currentPoint.x;
//             updatedElement.width = Math.abs(updatedElement.width);
//           }
//           if (updatedElement.height < 0) {
//             updatedElement.y = currentPoint.y;
//             updatedElement.height = Math.abs(updatedElement.height);
//           }
//           break;
//         }
//         case 'arrow':
//         case 'line': {
//           (updatedElement as ArrowElement | LineElement).endPoint = currentPoint;
//           // Update bounding box
//           const startX = (updatedElement as ArrowElement | LineElement).startPoint.x;
//           const startY = (updatedElement as ArrowElement | LineElement).startPoint.y;
//           const endX = (updatedElement as ArrowElement | LineElement).endPoint.x;
//           const endY = (updatedElement as ArrowElement | LineElement).endPoint.y;
          
//           updatedElement.x = Math.min(startX, endX);
//           updatedElement.y = Math.min(startY, endY);
//           updatedElement.width = Math.abs(endX - startX);
//           updatedElement.height = Math.abs(endY - startY);
//           break;
//         }
//       }
      
//       setCurrentElement(updatedElement);
//     }
    
//     redrawCanvas();
    
//     // Draw current element or selection box
//     const canvas = canvasRef.current;
//     if (!canvas) return;
    
//     const ctx = canvas.getContext('2d');
//     if (!ctx) return;
    
//     ctx.save();
//     ctx.translate(panOffset.x, panOffset.y);
//     ctx.scale(scale, scale);
    
//     if (currentElement) {
//       renderElement(ctx, currentElement);
//     }
    
//     ctx.restore();
//   };

//   // Handle mouse up event
//   const handleMouseUp = () => {
//     if (isResizing) {
//       setIsResizing(false);
//       setResizeDirection(null);
//       setOriginalElements([]);
//       return;
//     }

//     if (!isDrawing) return;
//     setIsDrawing(false);
    
//     if (tool === 'selection' && selectionBox?.isActive) {
//       // Find elements within selection box
//       const selectedElements = findElementsInSelectionBox();
//       setSelectedElementIds(prev => {
//         const newSelection = [...prev];
//         selectedElements.forEach(id => {
//           if (!newSelection.includes(id)) {
//             newSelection.push(id);
//           }
//         });
//         return newSelection;
//       });
//       setSelectionBox(null);
//     } else if (currentElement && tool !== 'selection') {
//       // Add current element to elements array
//       setElements(prev => [...prev, currentElement]);
//     }
    
//     setCurrentElement(null);
//   };

//   // Resize canvas when window resizes
//   useEffect(() => {
//     const resizeCanvas = () => {
//       const canvas = canvasRef.current;
//       if (!canvas) return;
      
//       canvas.width = canvas.offsetWidth;
//       canvas.height = canvas.offsetHeight;
//       redrawCanvas();
//     };
    
//     window.addEventListener('resize', resizeCanvas);
//     resizeCanvas();
    
//     return () => {
//       window.removeEventListener('resize', resizeCanvas);
//     };
//   }, []);

//   // Redraw canvas when elements or zoom changes
//   useEffect(() => {
//     redrawCanvas();
//   }, [elements, scale, panOffset, selectionBox]);

//   // Update elements when selected elements change
//   useEffect(() => {
//     setElements(prev => 
//       prev.map(el => ({
//         ...el,
//         isSelected: selectedElementIds.includes(el.id)
//       }))
//     );
//   }, [selectedElementIds]);

//   return (
//     <canvas
//       ref={canvasRef}
//       className="w-full h-full touch-none"
//       onMouseDown={handleMouseDown}
//       onMouseMove={handleMouseMove}
//       onMouseUp={handleMouseUp}
//       onMouseLeave={handleMouseUp}
//     />
//   );
// };

// export default Canvas;