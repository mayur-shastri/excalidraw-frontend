import { PeerState } from "../../types";
import { drawCurrentElement } from "../../utils/drawCurrentElement";

export const renderPeerStates = (peerstates: PeerState[],
    canvasRef: React.RefObject<HTMLCanvasElement>,
    panOffset: { x: number; y: number },
    scale: number) => {
    peerstates.forEach((peerState: PeerState) => {
        console.log(peerState.isDrawing);
        drawCurrentElement(peerState.currentElement, canvasRef, panOffset, scale, peerState.selectedElementIds);
    });
}