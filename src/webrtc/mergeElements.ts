import { DrawElement } from "../types";
import { setItemLocalStorage } from "../utils/localStorage";

export const mergeElements = (prevElements : DrawElement[], currElements : DrawElement[], currentDiagramId : string | null)=>{
    if (!currentDiagramId) return prevElements;
    // merge on the basis of deleted status(true is superior), version (greater is retained), if version tie, pick the one with larger versionNonce
    const merged = new Map<string, DrawElement>();

    for (const el of [...prevElements, ...currElements]) {
        const existing = merged.get(el.id);
        if (!existing) {
            merged.set(el.id, el);
            continue;
        }

        const isDeleted = el.isDeleted === true;
        if (isDeleted && existing.isDeleted === false) {
            merged.set(el.id, el);
            continue;
        }

        if (el.version > existing.version) {
            merged.set(el.id, el);
        } else if (el.version === existing.version) {
            if (el.versionNonce > existing.versionNonce) {
                merged.set(el.id, el);
            }
        }
    }

    const newElements = Array.from(merged.values());

    setItemLocalStorage(`${currentDiagramId}_elements`, newElements);

    return newElements;
}