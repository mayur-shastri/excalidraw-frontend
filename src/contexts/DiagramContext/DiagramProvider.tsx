import { ReactNode, useState } from "react"
import { DiagramContext } from "./DiagramContext"
import { getItemLocalStorage, removeItemLocalStorage, setItemLocalStorage } from "../../utils/localStorage";

export const DiagramProvider = ({children} : {children : ReactNode})=>{

    const initializeCurrentDiagramId = ()=>{
        const storedDiagramId = getItemLocalStorage('currentDiagramId');
        return storedDiagramId ? storedDiagramId : null;
    }

    const [currentDiagramId, setCurrentDiagramId] = useState<string | null>(initializeCurrentDiagramId);

    const setCurrentDiagramIdPersistently = (diagramId: string | null | ((prev: string | null) => string | null)) => {
        setCurrentDiagramId((prev) => {
            const newDiagramId = typeof diagramId === "function" ? (diagramId as (prev: string | null) => string | null)(prev) : diagramId;
            if (newDiagramId) {
                setItemLocalStorage('currentDiagramId', newDiagramId);
            } else {
                removeItemLocalStorage('currentDiagramId');
            }
            return newDiagramId;
        });
    }

    return (
        <DiagramContext.Provider value={{ currentDiagramId, setCurrentDiagramIdPersistently }}>
            {children}
        </DiagramContext.Provider>
    )
}