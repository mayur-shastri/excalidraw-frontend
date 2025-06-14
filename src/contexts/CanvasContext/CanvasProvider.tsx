import React from 'react';
import { CanvasContext } from './CanvasContext';
import { CanvasProps } from '../../types';

export const CanvasProvider: React.FC<{ value: CanvasProps; children: React.ReactNode }> = ({ value, children }) => (
  <CanvasContext.Provider value={value}>
    {children}
  </CanvasContext.Provider>
);