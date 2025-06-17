export type Point = {
  x: number;
  y: number;
};

export type ElementType = 'selection' | 'freedraw' | 'rectangle' | 'ellipse' | 'arrow' | 'line' | 'diamond' | 'rhombus' | 'eraser' | 'text' | 'selection-outline';

export type ElementStyle = {
  strokeColor: string;
  backgroundColor: string;
  strokeWidth: number;
  fillStyle: 'solid' | 'hachure';
  opacity: number;
  fontSize?: number;
  fontFamily?: string;
  textAlign?: 'left' | 'center' | 'right';
  text?: string;
  cornerRadius? : number;
};

export type ElementBase = {
  id: string;
  type: ElementType;
  x: number;
  y: number;
  width: number;
  height: number;
  angle: number;
  style: ElementStyle;
  isSelected: boolean;
  text?: string;
  isMarkedForDeletion?: boolean;
};

export type FreedrawElement = ElementBase & {
  type: 'freedraw';
  points: Point[];
};

export type RectangleElement = ElementBase & {
  type: 'rectangle';
};

export type EllipseElement = ElementBase & {
  type: 'ellipse';
};

export type ArrowElement = ElementBase & {
  type: 'arrow';
  startPoint: Point;
  endPoint: Point;
};

export type LineElement = ElementBase & {
  type: 'line';
  startPoint: Point;
  endPoint: Point;
};

export type DiamondElement = ElementBase & {
  type: 'diamond';
};

export type RhombusElement = ElementBase & {
  type: 'rhombus';
};

export type TextElement = ElementBase & {
  type: 'text';
  text: string;
};

export type SelectionOutline = ElementBase & {
  type: 'selection-outline';
}

export type DrawElement =
  | FreedrawElement
  | RectangleElement
  | EllipseElement
  | ArrowElement
  | LineElement
  | DiamondElement
  | RhombusElement
  | TextElement
  | SelectionOutline;

export type ToolOption = {
  type: ElementType;
  icon: string;
  label: string;
};

export type ResizeHandle = 'top-left' | 'top' | 'top-right' | 'left' | 'right' | 'bottom-left' | 'bottom' | 'bottom-right';

export interface CanvasProps {
  elements: DrawElement[];
  setElements: React.Dispatch<React.SetStateAction<DrawElement[]>>;
  tool: ElementType;
  selectedElementIds: string[];
  setSelectedElementIds: React.Dispatch<React.SetStateAction<string[]>>;
  scale: number;
  panOffset: Point;
  onElementComplete: () => void;
  onTextEdit: (element: TextElement) => void;
  selectionBox: {
    startX: number;
    startY: number;
    width: number;
    height: number;
    isActive: boolean;
  } | null;
  setSelectionBox: React.Dispatch<React.SetStateAction<{
    startX: number;
    startY: number;
    width: number;
    height: number;
    isActive: boolean;
  } | null>>;
}

export type ResizeDirection = 'n' | 'ne' | 'e' | 'se' | 's' | 'sw' | 'w' | 'nw' | null;

export interface TranslatingStartState extends Point {
  startPoint?: Point;
  endPoint?: Point;
  points?: Point[];
}