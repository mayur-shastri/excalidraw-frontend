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
  cornerRadius?: number;
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
  connectionIds: string[];
  version: Date;
  isDeleted: boolean;
  versionNonce : number;
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
  connectionId: string;
  startSide: 'top' | 'bottom' | 'left' | 'right' | null;
  endSide: 'top' | 'bottom' | 'left' | 'right' | null;
  direction : 'up' | 'right' | 'down' | 'left';
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
  setElements: (updater: (prev: DrawElement[]) => DrawElement[]) => void;
  tool: ElementType;
  setActiveTool: (tool: ElementType) => void;
  selectedElementIds: string[];
  setSelectedElementIds: React.Dispatch<React.SetStateAction<string[]>>;
  scale: number;
  setScale: (prev: number) => void;
  panOffset: Point;
  onElementComplete: () => void;
  onTextEdit: (element: TextElement) => void;
  hoveredElement: DrawElement | null;
  setHoveredElement: (element: DrawElement | null) => void;
  arrowStartPoint: ArrowPoint | null;
  setArrowStartPoint: (point: ArrowPoint | null) => void;
  arrowEndPoint: ArrowPoint | null;
  setArrowEndPoint: (point: ArrowPoint | null) => void;
  connections: Connection[];
  setConnections: (updater: (prev: Connection[]) => Connection[]) => void;
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

export type ResizeDirection = 'n' | 'ne' | 'e' | 'se' | 's' | 'sw' | 'w' | 'nw' | 'start' | 'end' | null;

export interface TranslatingStartState extends Point {
  startPoint?: Point;
  endPoint?: Point;
  points?: Point[];
}

export interface ArrowPoint {
  elementId?: string;
  point: Point;
}

export type Connection = {
  id: string;
  startElementId?: string;
  endElementId?: string;
  startAngle?: number; // Angle from start element's center
  endAngle?: number;   // Angle from end element's center
  arrowElementId: string; // Optional reference to visual arrow
  version: Date;
  isDeleted : boolean;
  versionNonce : number;
};

export type DropdownButtonProps = {
    content: string;
    handleClick: () => void;
    color: string;
    icon: 'user' | 'settings' | 'logout' | 'layers' | 'star' | 'clock' | 'share-2' | 'invitations';
};

export interface Invitation {
    id: string;
    type: 'collaboration' | 'team' | 'workspace';
    inviter: {
        name: string;
        email: string;
        avatar?: string;
    };
    diagram : {
      id: string,
      title : string
    }
    invitedAt: string;
    expiresAt?: string;
    status: 'PENDING' | 'ACCEPTED' | 'REJECTED' | 'EXPIRED';
}

export interface InvitationsProps {
    onGoBack?: () => void;
}

export type InvitationCount = {
    countPending: number;
    countAccepted: number;
    countRejected: number;
    countAll: number;
};

export interface CanvasPreviewProps {
  elements: DrawElement[];
  connections: Connection[];
  scale?: number;
  panOffset?: { x: number; y: number };
}