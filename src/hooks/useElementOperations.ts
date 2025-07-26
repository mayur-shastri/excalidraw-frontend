import { useCallback } from 'react';
import { Connection, DrawElement, ElementStyle } from '../types';

interface ElementOperationsProps {
  elements: DrawElement[];
  setElementsWithUndo: (updater: (prev: DrawElement[]) => DrawElement[]) => void;
  selectedElementIds: string[];
  setSelectedElementIds: React.Dispatch<React.SetStateAction<string[]>>;
  connections: Connection[];
  setConnectionsWithUndo: (updater: (prev: Connection[]) => Connection[]) => void;
}

export const useElementOperations = ({
  elements,
  // setElements,
  setElementsWithUndo,
  selectedElementIds,
  setSelectedElementIds,
  setConnectionsWithUndo
}: ElementOperationsProps) => {

  // Get selected elements
  const selectedElements = elements.filter(el => selectedElementIds.includes(el.id));

  // Delete selected elements and their connections
  const deleteSelectedElements = useCallback(() => {
    if (selectedElementIds.length === 0) return;

    const selectedIdSet = new Set(selectedElementIds);

    setElementsWithUndo(prev =>
      prev.map(el => {
        if (selectedIdSet.has(el.id)) {
          return { ...el, isDeleted: true, isSelected : false };
        }
        return el;
      })
    );

    // Handle connections based on deleted elements
    setConnectionsWithUndo(prev =>
      prev.map(conn => {
        const startDeleted = selectedIdSet.has(conn.startElementId || '');
        const endDeleted = selectedIdSet.has(conn.endElementId || '');

        if (startDeleted && endDeleted) {
          return { ...conn, isDeleted: true };
        }

        const updatedConn = { ...conn };
        if (startDeleted) updatedConn.startElementId = undefined;
        if (endDeleted) updatedConn.endElementId = undefined;

        return updatedConn;
      })
    );

    setSelectedElementIds([]);
  }, [selectedElementIds, setElementsWithUndo, setConnectionsWithUndo, setSelectedElementIds]);


  // Update style of selected elements
  const updateStyle = useCallback(
    (styleUpdates: Partial<ElementStyle>) => {
      if (selectedElementIds.length === 0) return;

      setElementsWithUndo(prev =>
        prev.map(el => {
          if (selectedElementIds.includes(el.id) && !el.isDeleted) {
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
    [selectedElementIds, setElementsWithUndo]
  );



  return {
    selectedElements,
    deleteSelectedElements,
    updateStyle,
  };
};