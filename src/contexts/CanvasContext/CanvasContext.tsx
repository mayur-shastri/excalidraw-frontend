import { createContext, useContext } from 'react';
import { CanvasProps } from '../../types/index';

export const CanvasContext = createContext<CanvasProps | undefined>(undefined);

export const useCanvasContext = () => {
  const ctx = useContext(CanvasContext);
  if (!ctx) throw new Error('useCanvasContext must be used within a CanvasProvider');
  return ctx;
};