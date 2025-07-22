export const createPeerConnection = () => {
  const config: RTCConfiguration = {
    iceServers: [{ urls: 'stun:stun.l.google.com:19302' }],
  };

  const connection = new RTCPeerConnection(config);
  return connection;
};