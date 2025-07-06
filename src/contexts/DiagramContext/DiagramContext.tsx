import { createContext, useContext } from "react";

type DiagramContextType = {
    currentDiagramId: string | null;
    setCurrentDiagramIdPersistently: (id: string | null) => void;
}

export const DiagramContext = createContext<DiagramContextType | undefined>(undefined);

export const useDiagramContext = ()=>{
    const ctx = useContext(DiagramContext);
    if(!ctx) throw new Error('useDiagramContext must be used within a DiagramProvider');
    return ctx;
}