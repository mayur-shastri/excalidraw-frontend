import { useEffect, useState } from "react";
import { Connection, DrawElement, PeerState } from "../types";
import { useCanvasContext } from "../contexts/CanvasContext/CanvasContext";
import { mergeElements } from "../webrtc/mergeElements";
import { useDiagramContext } from "../contexts/DiagramContext/DiagramContext";
import { mergeConnections } from "../webrtc/mergeConnections";

type PropType = {
    currentElement: DrawElement | null;
    isDrawing: boolean;
}

export const useWebRTC = ({ currentElement, isDrawing }: PropType) => {

    const {
        elements,
        setElements,
        connections,
        setConnections,
        dataChannelsRef,
        peerIdRef,
        lastMousePos,
        selectedElementIds,
        peerNameRef,
        peerColorRef,
    } = useCanvasContext();

    const { currentDiagramId } = useDiagramContext();

    const initializeMyState = () => {
        const initState = {
            peerId: peerIdRef.current,
            peerName: peerNameRef.current, // Replace with actual name
            cursorPosition: lastMousePos,
            currentElement,
            selectedElementIds,
            isDrawing,
            peerColor: peerColorRef.current,
            version: new Date(),
        } as PeerState;
        return initState;
    };

    const [peerStates, setPeerStates] = useState<PeerState[]>([]);
    const [myState, setMyState] = useState<PeerState | null>(() => {
        return initializeMyState();
    });

    useEffect(()=>{
        console.log("As soon as page loads");
        console.log(peerColorRef.current);
        console.log(peerNameRef.current);
        console.log(myState);
    }, []);

    useEffect(() => {
        setMyState((prev) => {
            if (!prev) return null;

            return {
                ...prev,
                cursorPosition: lastMousePos,
            };
        });
    }, [lastMousePos]);

    useEffect(() => {
        if (!myState) return;

        const sendToAllPeers = (message: object) => {
            if (!dataChannelsRef.current) return;
            const messageStr = JSON.stringify(message);
            for (const [peerId, channel] of Object.entries(dataChannelsRef.current)) {
                if (channel.readyState === 'open') {
                    channel.send(messageStr);
                }
            }
        };

        const broadcastPeerStateViaWebRTC = () => {
            const message = {
                type: "PEER_SYNC",
                payload: {
                    peerState: myState
                },
            };
            sendToAllPeers(message);
        };

        // Apply some throttling/frame dropping here
        broadcastPeerStateViaWebRTC();
    }, [myState, dataChannelsRef]);

    useEffect(() => {
        if (!elements || !connections) return;

        const sendToAllPeers = (message: object) => {
            if (!dataChannelsRef.current) return;
            const messageStr = JSON.stringify(message);
            for (const [peerId, channel] of Object.entries(dataChannelsRef.current)) {
                if(peerId === peerIdRef.current) continue;
                if (channel.readyState === 'open') {
                    channel.send(messageStr);
                }
            }
        };

        const broadcastAppStateViaWebRTC = () => {
            const message = {
                type: "STATE_SYNC",
                payload: {
                    peerId: peerIdRef.current,
                    elements,        // Local diagram elements
                    connections,     // Local connections
                },
            };

            sendToAllPeers(message);
        };

        // Apply some throttling/frame dropping here
        broadcastAppStateViaWebRTC();
    }, [elements, connections, dataChannelsRef, peerIdRef]);

    useEffect(() => {

        const applyIncomingStatesToMyState = () => {
            // handle listening to incoming messages from peers
            if (!dataChannelsRef.current) return;
            for (const [peerId, channel] of Object.entries(dataChannelsRef.current)) {
                channel.onmessage = (event) => {
                    const message = JSON.parse(event.data);
                    if (peerId === peerIdRef.current) return;
                    switch (message.type) {
                        case "PEER_SYNC": {
                            const peerState = message.payload.peerState;
                            setPeerStates((prev) => {
                                const existingIndex = prev.findIndex(
                                    (p: PeerState) => p.peerId === peerState.peerId
                                );
                                if (existingIndex !== -1) {
                                    // Update existing peer
                                    const updatedPeers = [...prev];
                                    updatedPeers[existingIndex] = peerState;
                                    return updatedPeers;
                                } else {
                                    // Add new peer
                                    return [...prev, peerState];
                                }
                            });
                            break;
                        }
                        case "STATE_SYNC": {
                            const peerElements = message.payload.elements;
                            const peerConnections = message.payload.connections;
                            setElements((prev: DrawElement[]): DrawElement[] => {
                                const mergedElements = mergeElements(prev, peerElements, currentDiagramId);
                                return mergedElements;
                            });
                            setConnections((prev: Connection[]): Connection[] => {
                                const mergedConnections = mergeConnections(prev, peerConnections, currentDiagramId);
                                return mergedConnections;
                            });
                        }
                    }
                }
            }
        }

        applyIncomingStatesToMyState();
    }, [currentDiagramId, dataChannelsRef, elements, setElements, setConnections]);

    useEffect(() => {
        if (
            !peerIdRef.current ||
            !peerNameRef.current ||
            !peerColorRef.current
        ) return; // Don't set state if essential fields are missing

        const updateMyState = () => {
            setMyState(prev => {
                if (!prev) return null;

                const next: PeerState = {
                    ...prev,
                    cursorPosition: lastMousePos,
                    currentElement,
                    selectedElementIds,
                    isDrawing,
                };

                const hasChanged =
                    prev.currentElement !== currentElement ||
                    prev.isDrawing !== isDrawing ||
                    prev.cursorPosition.x !== lastMousePos.x ||
                    prev.cursorPosition.y !== lastMousePos.y ||
                    JSON.stringify(prev.selectedElementIds) !== JSON.stringify(selectedElementIds);

                if (hasChanged) {
                    return {
                        ...next,
                        version: Date.now()  // Only bump version if something changed
                    };
                }

                return prev;
            });
        };

        updateMyState();

    }, [lastMousePos, currentElement, selectedElementIds, isDrawing]);

    return { peerStates, setMyState, peerIdRef };

};