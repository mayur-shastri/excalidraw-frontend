import { Connection } from "../types";
import { setItemLocalStorage } from "../utils/localStorage";

export const mergeConnections = (prevConnections: Connection[], currConnections: Connection[], currentDiagramId: string | null) => {
    if (!currentDiagramId) return prevConnections;
    // merge on the basis of deleted status(true is superior), version (greater is retained), if version tie, pick the one with larger versionNonce
    const merged = new Map<string, Connection>();

    for (const conn of [...prevConnections, ...currConnections]) {
        const existing = merged.get(conn.id);
        if (!existing) {
            merged.set(conn.id, conn);
            continue;
        }

        const isDeleted = conn.isDeleted === true;
        if (isDeleted && existing.isDeleted === false) {
            merged.set(conn.id, conn);
            continue;
        }

        if (conn.version > existing.version) {
            merged.set(conn.id, conn);
        } else if (conn.version === existing.version) {
            if (conn.versionNonce > existing.versionNonce) {
                merged.set(conn.id, conn);
            }
        }
    }

    const newConnections = Array.from(merged.values());

    setItemLocalStorage(`${currentDiagramId}_connections`, newConnections);

    return newConnections;
}