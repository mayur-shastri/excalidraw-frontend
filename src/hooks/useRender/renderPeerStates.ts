import { PeerState } from "../../types";
import { drawCurrentElement } from "../../utils/drawCurrentElement";

export const renderPeerStates = (peerstates: PeerState[],
    canvasRef: React.RefObject<HTMLCanvasElement>,
    panOffset: { x: number; y: number },
    scale: number,
    selfPeerIdRef: React.RefObject<string | null>) => {

    peerstates.forEach((peerState: PeerState) => {
        // if (peerState.peerId === selfPeerIdRef.current) return;
        drawCurrentElement(peerState.currentElement, canvasRef, panOffset, scale, peerState.selectedElementIds);
    });
}