import React from 'react';
import { CanvasProps, DrawElement, ElementType, Point } from '../../types';

interface CanvasContextType extends CanvasProps {
  elements: DrawElement[];
  setElements: React.Dispatch<React.SetStateAction<DrawElement[]>>;
  tool: ElementType;
  selectedElementIds: string[];
  setSelectedElementIds: React.Dispatch<React.SetStateAction<string[]>>;
  scale: number;
  panOffset: Point;
}

export const CanvasContext = React.createContext<CanvasContextType | undefined>(undefined);