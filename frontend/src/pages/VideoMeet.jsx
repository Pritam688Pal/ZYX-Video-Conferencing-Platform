import React, { useRef, useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import io from 'socket.io-client';
import { Badge, IconButton, TextField, Button, useMediaQuery } from '@mui/material';
import CallEndIcon from '@mui/icons-material/CallEnd';
import MicIcon from '@mui/icons-material/Mic';
import MicOffIcon from '@mui/icons-material/MicOff';
import ScreenShareIcon from '@mui/icons-material/ScreenShare';
import StopScreenShareIcon from '@mui/icons-material/StopScreenShare';
import VideocamIcon from '@mui/icons-material/Videocam';
import VideocamOffIcon from '@mui/icons-material/VideocamOff';
import ChatIcon from '@mui/icons-material/Chat';
import CloseIcon from '@mui/icons-material/Close';
import SpeakerNotesOffIcon from '@mui/icons-material/SpeakerNotesOff';
import { AuthContext } from '../contexts/AuthContext.jsx';



const server_url = import.meta.env.VITE_socket_server_url;
let connections = {};
const peerConfigConnections = {
    "iceServers": [{ "urls": "stun:stun.l.google.com:19302" }]
};

function VideoMeet() {
    const navigate = useNavigate();
    const { user, addToUserHistory } = useContext(AuthContext);
    const param = useParams().url;
    const socketRef = useRef();
    const socketIdRef = useRef();
    const localVideoRef = useRef();

    // MUI Responsiveness Hooks
    const isMobile = useMediaQuery('(max-width:768px)');

    const [videoAvailable, setVideoAvailable] = useState(true);
    const [audioAvailable, setAudioAvailable] = useState(true);
    const [video, setVideo] = useState(false);
    const [audio, setAudio] = useState(false);
    const [screen, setScreen] = useState(false);
    const [showModel, setShowModel] = useState(false);
    const [screenAvailable, setScreenAvailable] = useState(false);
    const [messages, setMessages] = useState([]);
    const [message, setMessage] = useState("");
    const [askForUsername, setAskForUsername] = useState(true);
    const [username, setUsername] = useState(user || "");
    const [videos, setVideos] = useState([]);
    const [copied, setCopied] = useState(false);

    let getPermissions = async () => {
        try {
            const videoPermission = await navigator.mediaDevices.getUserMedia({ video: true });
            if (videoPermission) setVideoAvailable(true);
            const audioPermission = await navigator.mediaDevices.getUserMedia({ audio: true });
            if (audioPermission) setAudioAvailable(true);

            if (navigator.mediaDevices.getDisplayMedia) {
                setScreenAvailable(true);
            } else {
                setScreenAvailable(false);
            }

            if (videoAvailable || audioAvailable) {
                const userMediaStream = await navigator.mediaDevices.getUserMedia({ video: videoAvailable, audio: audioAvailable });
                if (userMediaStream) {
                    window.localStream = userMediaStream;
                    if (localVideoRef.current) {
                        localVideoRef.current.srcObject = userMediaStream;
                    }
                }
            }
            setAudio(true);
            setVideo(true);
        } catch (error) {
            console.log(error);
        }
    };

    let getUserMedia = () => {
        if ((video && videoAvailable) || (audio && audioAvailable)) {
            navigator.mediaDevices.getUserMedia({ video: video, audio: audio })
                .then(getUserMediaSuccess)
                .catch((e) => console.log(e));
        } else {
            try {
                let tracks = localVideoRef.current.srcObject.getTracks();
                tracks.forEach(track => track.stop());
                localVideoRef.current.srcObject = null;
            } catch (e) { }
        }
    };

    let getUserMediaSuccess = (stream) => {
        window.localStream = stream;
        if (localVideoRef.current) {
            localVideoRef.current.srcObject = stream;
        }

        for (let id in connections) {
            if (id === socketIdRef.current) continue;
            window.localStream.getTracks().forEach(track => {
                const sender = connections[id].getSenders().find(s => s.track && s.track.kind === track.kind);
                if (sender) {
                    sender.replaceTrack(track);
                } else {
                    connections[id].addTrack(track, window.localStream);
                }
            });
            connections[id].createOffer().then((description) => {
                connections[id].setLocalDescription(description).then(() => {
                    socketRef.current.emit("signal", id, JSON.stringify({ "sdp": connections[id].localDescription }));
                }).catch((e) => console.log(e));
            });
        }

        stream.getTracks().forEach(track => track.onended = () => {
            setAudio(false);
            setVideo(false);
            try {
                let tracks = localVideoRef.current.srcObject.getTracks();
                tracks.forEach(track => track.stop());
            } catch (error) {
                console.log(error);
            }
            let blackSilence = (...args) => new MediaStream([black(...args), silence()]);
            window.localStream = blackSilence();
            if (localVideoRef.current) localVideoRef.current.srcObject = window.localStream;

            for (let id in connections) {
                window.localStream.getTracks().forEach(track => {
                    const sender = connections[id].getSenders().find(s => s.track?.kind === track.kind);
                    if (sender) {
                        sender.replaceTrack(track);
                    } else {
                        connections[id].addTrack(track, window.localStream);
                    }
                });
                connections[id].createOffer().then((description) => {
                    connections[id].setLocalDescription(description).then(() => {
                        socketRef.current.emit('signal', id, JSON.stringify({ 'sdp': connections[id].localDescription }));
                    }).catch(e => console.log(e));
                });
            }
        });
    };

    let silence = () => {
        let ctx = new AudioContext();
        let oscillator = ctx.createOscillator();
        let dst = oscillator.connect(ctx.createMediaStreamDestination());
        oscillator.start();
        ctx.resume();
        return Object.assign(dst.stream.getAudioTracks()[0], { enabled: false });
    };

    let black = ({ width = 640, height = 480 } = {}) => {
        let canvas = Object.assign(document.createElement("canvas"), { width, height });
        canvas.getContext('2d').fillRect(0, 0, width, height);
        let stream = canvas.captureStream();
        return Object.assign(stream.getVideoTracks()[0], { enabled: false });
    };

    let gotMessageFromServer = (fromId, message) => {
        if (!connections[fromId]) return;
        var signal = JSON.parse(message);

        if (fromId !== socketIdRef.current) {
            if (signal.ice) {
                connections[fromId].addIceCandidate(new RTCIceCandidate(signal.ice)).catch((e) => console.log(e));
            }
            if (signal.sdp) {
                connections[fromId].setRemoteDescription(new RTCSessionDescription(signal.sdp)).then(() => {
                    if (signal.sdp.type === "offer") {
                        connections[fromId].createAnswer().then((description) => {
                            connections[fromId].setLocalDescription(description).then(() => {
                                socketRef.current.emit('signal', fromId, JSON.stringify({ "sdp": connections[fromId].localDescription }));
                            }).catch((e) => console.log(e));
                        }).catch((e) => console.log(e));
                    }
                }).catch((e) => console.log(e));
            }
        }
    };

    let connectToSocketServer = () => {
        socketRef.current = io.connect(server_url, { secure: false });
        socketRef.current.on('signal', gotMessageFromServer);
        socketRef.current.on('connect', () => {
            socketRef.current.emit('joinRoom', { roomId: param, name: username });
            socketIdRef.current = socketRef.current.id;
            socketRef.current.on('chatMessage', addMessage);
            socketRef.current.on("userLeft", ({ userId }) => {
                if (connections[userId]) {
                    connections[userId].close();
                    delete connections[userId];
                }
                setVideos(prev => prev.filter(v => v.socketId != userId));
            });
            socketRef.current.on('userJoined', ({ userId, currentUsers }) => {
                currentUsers.forEach(({ id, name }) => {
                    if (id === socketIdRef.current || connections[id]) return;
                    const pc = new RTCPeerConnection(peerConfigConnections);
                    connections[id] = pc;

                    pc.onicecandidate = (event) => {
                        if (event.candidate) {
                            socketRef.current.emit("signal", id, JSON.stringify({ ice: event.candidate }));
                        }
                    };

                    pc.ontrack = (event) => {
                        const remoteStream = event.streams[0];
                        setVideos(prev => {
                            const exists = prev.find(v => v.socketId === id);
                            if (exists) {
                                return prev.map(v => v.socketId === id ? { ...v, stream: remoteStream } : v);
                            }
                            return [...prev, { socketId: id, n: name, stream: remoteStream }];
                        });
                    };

                    if (window.localStream) {
                        window.localStream.getTracks().forEach(track => pc.addTrack(track, window.localStream));
                    }
                });

                if (userId === socketIdRef.current) {
                    Object.entries(connections).forEach(async ([id, pc]) => {
                        try {
                            const offer = await pc.createOffer();
                            await pc.setLocalDescription(offer);
                            socketRef.current.emit("signal", id, JSON.stringify({ sdp: pc.localDescription }));
                        } catch (err) {
                            console.error(err);
                        }
                    });
                }
            });
        });
    };

    useEffect(() => { getPermissions(); }, []);
    useEffect(() => { if (video !== undefined && audio !== undefined) getUserMedia(); }, [video, audio]);
    useEffect(() => { if (screen !== undefined) getDislayMedia(); }, [screen]);

    let getMedia = () => {
        setVideo(videoAvailable);
        setAudio(audioAvailable);
        connectToSocketServer();
    };

    const connect = () => {
        setAskForUsername(false);
        getMedia();
        if (user) {
            addToUserHistory(param);
        }

    };

    const sendMessage = () => {
        if (!message) return;
        socketRef.current.emit('chatMessage', { message, roomId: param });
        setMessage("");
    };

    const addMessage = ({ message, sender, timestamp }) => {
        setMessages((prevMessages) => [...prevMessages, { sender, data: message, timestamp }]);
    };

    const handleVideo = () => setVideo(!video);
    const handleAudio = () => setAudio(!audio);
    const handleScreen = () => setScreen(!screen);

    const handleEndCall = () => {
        try {
            let tracks = localVideoRef.current.srcObject.getTracks();
            tracks.forEach(track => track.stop());
        } catch (e) { }
        navigate('/home');
    };

    const handleCopyCode = () => {
        if (param) {
            navigator.clipboard.writeText(param)
                .then(() => {
                    setCopied(true);
                    setTimeout(() => setCopied(false), 2000);
                })
                .catch((err) => console.log(err));
        }
    };

    let getDislayMedia = () => {
        if (screen && navigator.mediaDevices.getDisplayMedia) {
            navigator.mediaDevices.getDisplayMedia({ video: true, audio: true })
                .then(getDislayMediaSuccess)
                .catch((e) => console.log(e));
        }
    };

    let getDislayMediaSuccess = async (stream) => {
        try {
            if (window.localStream) {
                window.localStream.getTracks().forEach(track => track.stop());
            }
            window.localStream = stream;
            if (localVideoRef.current) localVideoRef.current.srcObject = stream;

            for (let id in connections) {
                if (id === socketIdRef.current) continue;
                stream.getTracks().forEach(track => {
                    const sender = connections[id].getSenders().find(s => s.track?.kind === track.kind);
                    if (sender) {
                        sender.replaceTrack(track);
                    } else {
                        connections[id].addTrack(track, stream);
                    }
                });
                const offer = await connections[id].createOffer();
                await connections[id].setLocalDescription(offer);
                socketRef.current.emit("signal", id, JSON.stringify({ sdp: connections[id].localDescription }));
            }
            stream.getVideoTracks()[0].onended = () => {
                setScreen(false);
                getUserMedia();
            };
        } catch (err) {
            console.error(err);
        }
    };

    return (
        <div style={{ backgroundColor: "#14171a", minHeight: "100vh", color: "#fff", fontFamily: "sans-serif" }}>
            {askForUsername ? (
                /* RESPONSIVE LOBBY */
                <div style={{
                    display: "flex",
                    flexDirection: isMobile ? "column" : "row",
                    justifyContent: "center",
                    alignItems: "center",
                    minHeight: "100vh",
                    gap: isMobile ? "20px" : "40px",
                    padding: "20px"
                }}>
                    {/* Camera Preview */}
                    <div style={{
                        position: "relative",
                        width: "100%",
                        maxWidth: isMobile ? "100%" : "500px",
                        aspectRatio: "4/3",
                        backgroundColor: "#000",
                        borderRadius: "12px",
                        overflow: "hidden",
                        boxShadow: "0 8px 24px rgba(0,0,0,0.3)"
                    }}>
                        <video ref={localVideoRef} autoPlay muted playsInline style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                        <div style={{ position: "absolute", bottom: "20px", left: "50%", transform: "translateX(-50%)", display: "flex", gap: "15px", backgroundColor: "rgba(0,0,0,0.6)", padding: "8px 16px", borderRadius: "30px" }}>
                            <IconButton onClick={handleAudio} style={{ color: audio ? "#fff" : "#ff4444" }}>
                                {audio ? <MicIcon /> : <MicOffIcon />}
                            </IconButton>
                            <IconButton onClick={handleVideo} style={{ color: video ? "#fff" : "#ff4444" }}>
                                {video ? <VideocamIcon /> : <VideocamOffIcon />}
                            </IconButton>
                        </div>
                    </div>

                    {/* Join Options Card */}
                    <div style={{
                        width: "100%",
                        maxWidth: isMobile ? "100%" : "380px",
                        display: "flex",
                        flexDirection: "column",
                        gap: "20px",
                        backgroundColor: "#1e2226",
                        padding: isMobile ? "20px" : "30px",
                        borderRadius: "12px",
                        boxSizing: "border-box"
                    }}>
                        <h1 style={{ margin: 0, fontSize: "1.8rem" }}>Join Meeting</h1>

                        <div style={{ display: "flex", alignItems: "center", gap: "10px", backgroundColor: "rgba(255,255,255,0.03)", padding: "10px", borderRadius: "6px", border: "1px solid #2d3238" }}>
                            <div style={{ flex: 1, minWidth: 0 }}>
                                <span style={{ fontSize: "0.8rem", color: "#888", display: "block", textTransform: "uppercase", fontWeight: 600 }}>Meeting ID</span>
                                <span style={{ fontSize: "1.1rem", fontWeight: "bold", color: "#fff", display: "block", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{param}</span>
                            </div>
                            <Button
                                variant={copied ? "contained" : "outlined"}
                                color={copied ? "success" : "primary"}
                                size="small"
                                onClick={handleCopyCode}
                                style={{ minWidth: "80px", textTransform: "none" }}
                            >
                                {copied ? "Copied!" : "Copy"}
                            </Button>
                        </div>

                        <TextField
                            fullWidth
                            label="Display Name"
                            variant="outlined"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            InputLabelProps={{ style: { color: '#aaa' } }}
                            inputProps={{ style: { color: '#fff' } }}
                            style={{ backgroundColor: "rgba(255,255,255,0.05)", borderRadius: "4px" }}
                        />
                        <Button variant="contained" size="large" onClick={connect} disabled={!username} style={{ backgroundColor: "#1976d2", padding: "12px" }}>
                            Join Conference
                        </Button>
                    </div>
                </div>
            ) : (
                /* RESPONSIVE MEETING CALL */
                <div style={{ display: "flex", flexDirection: "column", height: "100vh", overflow: "hidden" }}>
                    <div style={{ display: "flex", flexDirection: isMobile ? "column" : "row", flex: 1, position: "relative", overflow: "hidden" }}>

                        {/* Stream Tiles Section */}
                        <div style={{
                            flex: 1,
                            display: "grid",
                            gridTemplateColumns: isMobile ? "repeat(auto-fit, minmax(140px, 1fr))" : "repeat(auto-fit, minmax(320px, 1fr))",
                            gap: isMobile ? "8px" : "15px",
                            padding: isMobile ? "10px" : "20px",
                            alignContent: "center",
                            backgroundColor: "#0f1114",
                            overflowY: "auto"
                        }}>
                            {videos.map((vid) => (
                                <div key={vid.socketId} style={{ position: "relative", backgroundColor: "#1e2226", borderRadius: "8px", overflow: "hidden", aspectRatio: "16/9" }}>
                                    <video
                                        autoPlay
                                        playsInline
                                        style={{ width: "100%", height: "100%", objectFit: "cover" }}
                                        ref={(ref) => { if (ref && vid.stream) ref.srcObject = vid.stream; }}
                                    />
                                    <div style={{ position: "absolute", bottom: "8px", left: "8px", backgroundColor: "rgba(0,0,0,0.6)", padding: "2px 8px", borderRadius: "4px", fontSize: "0.8rem" }}>
                                        {vid.n}
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Picture-in-Picture Local Overlay */}
                        <div style={{
                            position: "absolute",
                            top: "15px",
                            right: !isMobile && showModel ? "365px" : "15px",
                            width: isMobile ? "100px" : "180px",
                            height: isMobile ? "65px" : "110px",
                            borderRadius: "8px",
                            overflow: "hidden",
                            border: "2px solid #444",
                            zIndex: 10,
                            transition: "right 0.3s ease"
                        }}>
                            <video ref={localVideoRef} autoPlay muted playsInline style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                        </div>

                        {/* Adaptive Slide-Over Chat Panel */}
                        {showModel && (
                            <div style={{
                                width: isMobile ? "100%" : "350px",
                                height: isMobile ? "40%" : "100%",
                                backgroundColor: "#1e2226",
                                display: "flex",
                                flexDirection: "column",
                                borderLeft: isMobile ? "none" : "1px solid #2d3238",
                                borderTop: isMobile ? "1px solid #2d3238" : "none",
                                position: isMobile ? "absolute" : "relative",
                                bottom: 0, left: 0, zIndex: 20
                            }}>
                                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 15px", borderBottom: "1px solid #2d3238" }}>
                                    <h3 style={{ margin: 0, fontSize: "1rem" }}>Meeting Chat</h3>
                                    <IconButton onClick={() => setShowModel(false)} style={{ color: "#fff" }} size="small">
                                        <CloseIcon />
                                    </IconButton>
                                </div>

                                <div style={{ flex: 1, padding: "15px", overflowY: "auto", display: "flex", flexDirection: "column", gap: "10px" }}>
                                    {messages.map((msg, index) => {
                                        const isMe = msg.sender === username;
                                        return (
                                            <div key={index} style={{ display: "flex", flexDirection: "column", alignSelf: isMe ? "flex-end" : "flex-start", maxWidth: "80%" }}>
                                                <span style={{ fontSize: "0.7rem", color: "#aaa", marginBottom: "2px", alignSelf: isMe ? "flex-end" : "flex-start" }}>{msg.sender}</span>
                                                <div style={{ backgroundColor: isMe ? "#1976d2" : "#3a3f45", color: "#fff", padding: "8px 12px", borderRadius: "12px", fontSize: "0.9rem", wordBreak: "break-word" }}>
                                                    {msg.data}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>

                                <div style={{ padding: "12px", display: "flex", gap: "10px", borderTop: "1px solid #2d3238" }}>
                                    <TextField
                                        fullWidth
                                        size="small"
                                        placeholder="Type message..."
                                        value={message}
                                        onChange={(e) => setMessage(e.target.value)}
                                        onKeyDown={(e) => { if (e.key === "Enter") sendMessage(); }}
                                        inputProps={{ style: { color: '#fff', fontSize: '0.9rem' } }}
                                        style={{ backgroundColor: "rgba(255,255,255,0.05)", borderRadius: "4px" }}
                                    />
                                    <Button variant="contained" size="small" onClick={sendMessage}>Send</Button>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Bottom Action Menu Bar */}
                    <div style={{
                        height: isMobile ? "70px" : "80px",
                        backgroundColor: "#1e2226",
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center",
                        gap: isMobile ? "10px" : "20px",
                        borderTop: "1px solid #2d3238"
                    }}>
                        <IconButton size={isMobile ? "small" : "medium"} onClick={handleVideo} style={{ backgroundColor: video ? "rgba(255,255,255,0.08)" : "#ff4444", color: "#fff" }}>
                            {video ? <VideocamIcon /> : <VideocamOffIcon />}
                        </IconButton>
                        <IconButton size={isMobile ? "small" : "medium"} onClick={handleAudio} style={{ backgroundColor: audio ? "rgba(255,255,255,0.08)" : "#ff4444", color: "#fff" }}>
                            {audio ? <MicIcon /> : <MicOffIcon />}
                        </IconButton>

                        {/* Only render screen sharing controls on desktop (not supported natively on mobile browsers) */}
                        {!isMobile && (
                            <IconButton onClick={handleScreen} style={{ backgroundColor: "rgba(255,255,255,0.08)", color: screen ? "#1976d2" : "#fff" }} disabled={!screenAvailable}>
                                {screen ? <StopScreenShareIcon /> : <ScreenShareIcon />}
                            </IconButton>
                        )}

                        <IconButton size={isMobile ? "small" : "medium"} onClick={() => setShowModel(!showModel)} style={{ backgroundColor: "rgba(255,255,255,0.08)", color: showModel ? "#1976d2" : "#fff" }}>
                            {showModel ? <SpeakerNotesOffIcon /> : <ChatIcon />}
                        </IconButton>
                        <IconButton size={isMobile ? "small" : "medium"} onClick={handleEndCall} style={{ backgroundColor: "#ff4444", color: "#fff" }}>
                            <CallEndIcon />
                        </IconButton>
                    </div>
                </div>
            )}
        </div>
    );
}

export default VideoMeet;