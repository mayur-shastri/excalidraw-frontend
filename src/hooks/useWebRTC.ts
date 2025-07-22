import { useEffect, useRef } from 'react';
import { Socket } from 'socket.io-client';
import { createPeerConnection } from '../webrtc/peerConnection';
import socket from '../webrtc/socket';
import { useDiagramContext } from '../contexts/DiagramContext/DiagramContext';

export const useWebRTC = () => {

    const {currentDiagramId} = useDiagramContext();

    const socketRef = useRef<Socket>();
    const connectionsRef = useRef<Record<string, RTCPeerConnection>>({});
    const peerIdRef = useRef<string | null>(null);

    useEffect(() => {
        socketRef.current = socket;

        socket.emit('join', { diagramId : currentDiagramId });

        socket.on('joined', async ({ peerId, peers }) => {
            peerIdRef.current = peerId;

            // Start peer connection with each existing peer
            for (const remotePeerId of peers) {
                await createOffer(remotePeerId);
            }
        });

        socket.on('new-peer', async ({ peerId: newPeerId }) => {
            await createOffer(newPeerId);
        });

        socket.on('signal', async ({ from, signalType, data }) => {
            const conn = getOrCreateConnection(from);

            if (signalType === 'offer') {
                await conn.setRemoteDescription(new RTCSessionDescription(data));
                const answer = await conn.createAnswer();
                await conn.setLocalDescription(answer);

                socket.emit('signal', {
                    to: from,
                    from: peerIdRef.current,
                    signalType: 'answer',
                    data: answer,
                });
            }

            if (signalType === 'answer') {
                await conn.setRemoteDescription(new RTCSessionDescription(data));
            }

            if (signalType === 'ice-candidate') {
                try {
                    await conn.addIceCandidate(new RTCIceCandidate(data));
                } catch (err) {
                    console.error('Failed to add ICE candidate:', err);
                }
            }
        });

        socket.on('peer-left', ({ peerId }) => {
            connectionsRef.current[peerId]?.close();
            delete connectionsRef.current[peerId];
        });

        return () => {
            socket.disconnect();
            Object.values(connectionsRef.current).forEach(conn => conn.close());
            connectionsRef.current = {};
        };
    }, [currentDiagramId]);

    const getOrCreateConnection = (remotePeerId: string): RTCPeerConnection => {
        if (connectionsRef.current[remotePeerId]) return connectionsRef.current[remotePeerId];

        const conn = createPeerConnection();

        conn.onicecandidate = (event) => {
            if (event.candidate && socketRef.current) {
                socketRef.current.emit('signal', {
                    to: remotePeerId,
                    from: peerIdRef.current,
                    signalType: 'ice-candidate',
                    data: event.candidate,
                });
            }
        };

        connectionsRef.current[remotePeerId] = conn;
        return conn;
    };

    const createOffer = async (remotePeerId: string) => {
        const conn = getOrCreateConnection(remotePeerId);

        const offer = await conn.createOffer();
        await conn.setLocalDescription(offer);

        socketRef.current?.emit('signal', {
            to: remotePeerId,
            from: peerIdRef.current,
            signalType: 'offer',
            data: offer,
        });
    };
};