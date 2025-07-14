import { useCallback } from 'react';
import { Connection, DrawElement, ElementStyle } from '../types';

interface ElementOperationsProps {
  elements: DrawElement[];
  setElements: (updater: (prev: DrawElement[]) => DrawElement[]) => void;
  selectedElementIds: string[];
  setSelectedElementIds: React.Dispatch<React.SetStateAction<string[]>>;
  connections: Connection[];
  setConnections: (updater: (prev: Connection[]) => Connection[]) => void;
}

export const useElementOperations = ({
  elements,
  setElements,
  selectedElementIds,
  setSelectedElementIds,
  setConnections
}: ElementOperationsProps) => {

  // Get selected elements
  const selectedElements = elements.filter(el => selectedElementIds.includes(el.id));

  // Delete selected elements and their connections
  const deleteSelectedElements = useCallback(() => {
    if (selectedElementIds.length === 0) return;

    setElements(prev => prev.filter(el => !selectedElementIds.includes(el.id)));

    setConnections(prev => {
      const selectedIdSet = new Set(selectedElementIds);
      return prev.map(conn => {
        const updatedConn = { ...conn };
        if (selectedIdSet.has(conn.startElementId || '')) {
          updatedConn.startElementId = undefined;
        }
        if (selectedIdSet.has(conn.endElementId || '')) {
          updatedConn.endElementId = undefined;
        }
        return updatedConn;
      });
    });

    setSelectedElementIds([]);
  }, [selectedElementIds, setElements, setConnections, setSelectedElementIds]);

  // Update style of selected elements
  const updateStyle = useCallback(
    (styleUpdates: Partial<ElementStyle>) => {
      if (selectedElementIds.length === 0) return;

      setElements(prev =>
        prev.map(el => {
          if (selectedElementIds.includes(el.id)) {
            return {
              ...el,
              style: {
                ...el.style,
                ...styleUpdates,
              },
            };
          }
          return el;
        })
      );
    },
    [selectedElementIds, setElements]
  );



  return {
    selectedElements,
    deleteSelectedElements,
    updateStyle,
  };
};