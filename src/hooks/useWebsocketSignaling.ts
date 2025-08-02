import { useEffect, useRef } from 'react';
import { Socket } from 'socket.io-client';
import { createPeerConnection } from '../webrtc/peerConnection';
import { getSocket, disconnectSocket } from '../webrtc/socket';
import { useDiagramContext } from '../contexts/DiagramContext/DiagramContext';
import { toast } from 'sonner';
import { supabase } from '../utils/supabaseClient';
import { useNavigate } from 'react-router-dom';

export const useWebsocketSignaling = () => {

    const { currentDiagramId } = useDiagramContext();

    const socketRef = useRef<Socket>();
    const peerConnectionsRef = useRef<Record<string, RTCPeerConnection>>({});
    const peerIdRef = useRef<string | null>(null);
    const dataChannelsRef = useRef<Record<string, RTCDataChannel>>({});
    const peerColorRef = useRef<string>("");
    const peerNameRef = useRef<string>("");

    const navigate = useNavigate();

    useEffect(() => {

        const run = async () => {
            const socket = getSocket();

            if (!currentDiagramId || !socket) return;

            socketRef.current = socket;

            const getSupabaseToken = async () => {
                let { data: { session }, error } = await supabase.auth.getSession();

                if (!session || error) {
                    // Try to refresh session
                    const { data: refreshedData, error: refreshError } = await supabase.auth.refreshSession();
                    if (refreshError || !refreshedData.session) {
                        toast.error("You are not logged in!");
                        return null;
                    }
                    session = refreshedData.session;
                }

                return session.access_token;
            }

            const token = await getSupabaseToken();

            socket.emit('join', { diagramId: currentDiagramId, token });

            socket.on('auth-error', () => {
                toast.warning("Authorization failed");
                disconnectSocket();
                navigate('/dashboard');
            });

            socket.on('joined', async ({ peerId, peers, peerName, peerColor }) => {
                peerIdRef.current = peerId;
                peerNameRef.current = peerName;
                peerColorRef.current = peerColor;

                // Start peer connection with each existing peer
                for (const remotePeerId of peers) {
                    await createOffer(remotePeerId);
                }
            });

            socket.on('new-peer', async ({ peerId: newPeerId }) => {
                getOrCreateConnection(newPeerId);
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

                    if (conn.signalingState !== 'have-local-offer') {
                        console.warn(`Unexpected signaling state (${conn.signalingState}) when receiving answer from ${peerIdRef}. Skipping setRemoteDescription.`);
                        return;
                    }

                    await conn.setRemoteDescription(new RTCSessionDescription(data));
                }

                if (signalType === 'ice-candidate') {
                    try {
                        await conn.addIceCandidate(new RTCIceCandidate(data));
                    } catch (err) {
                        toast.error('Failed to add ICE candidate:' + err);
                    }
                }
            });

            socket.on('peer-left', ({ peerId }) => {
                peerConnectionsRef.current[peerId]?.close();
                delete peerConnectionsRef.current[peerId];
                delete dataChannelsRef.current[peerId];
            });

        }

        run();

        return () => {
            disconnectSocket();
            Object.values(peerConnectionsRef.current).forEach(conn => conn.close());
            peerConnectionsRef.current = {};
            dataChannelsRef.current = {};
        };
    }, [currentDiagramId]);

    const getOrCreateConnection = (remotePeerId: string): RTCPeerConnection => {
        if (peerConnectionsRef.current[remotePeerId]) return peerConnectionsRef.current[remotePeerId];

        const conn = createPeerConnection();

        conn.ondatachannel = (event) => {
            const channel = event.channel;
            dataChannelsRef.current[remotePeerId] = channel;
        };

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

        peerConnectionsRef.current[remotePeerId] = conn;
        return conn;

    };

    const createOffer = async (remotePeerId: string) => {
        const conn = getOrCreateConnection(remotePeerId);

        if (conn.signalingState !== "stable") {
            console.log(`Connection with ${remotePeerId} not stable, skipping offer.`);
            return;
        }

        if (dataChannelsRef.current[remotePeerId]) {
            console.log(`Data channel with ${remotePeerId} already exists.`);
            return;
        }

        const dataChannel = conn.createDataChannel("canvas-sync");
        dataChannelsRef.current[remotePeerId] = dataChannel;

        const offer = await conn.createOffer();
        await conn.setLocalDescription(offer);

        socketRef.current?.emit('signal', {
            to: remotePeerId,
            from: peerIdRef.current,
            signalType: 'offer',
            data: offer,
        });
    };

    return { peerConnectionsRef, peerIdRef, dataChannelsRef, peerColorRef, peerNameRef };

};