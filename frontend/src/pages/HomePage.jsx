import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom'; 
import withAuth from '../utils/withAuth.jsx'; 
import { Button, IconButton, TextField } from '@mui/material';
import RestoreIcon from '@mui/icons-material/Restore';
import VideoCallIcon from '@mui/icons-material/VideoCall';
import { AuthContext } from '../contexts/AuthContext.jsx';

function HomeComponent() {
    const { isLoggedIn, handleLogout } = React.useContext(AuthContext);
    const token = isLoggedIn();
    
    const navigate = useNavigate();
    const [meetingCode, setMeetingCode] = useState("");

    const handleCreateMeeting = () => {
        const randomCode = crypto.randomUUID();
        
        navigate(`/${randomCode}`); 
    };

    const handleJoinMeeting = () => {
        if (meetingCode.trim()) {
            navigate(`/${meetingCode.trim()}`);
        }
    };

    return ( 
        <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", backgroundColor: "#f5f5f5" }}>

            {/* Navbar */}
            <div className="navBar" style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                padding: "10px 40px",
                backgroundColor: "#ffffff",
                boxShadow: "0px 2px 4px rgba(0,0,0,0.1)"
            }}>
                <div style={{ display: "flex", alignItems: "center" }}>
                    <h2 style={{ margin: 0, color: "#1976d2", cursor: "pointer" }} onClick={() => navigate("/home")}>
                        ZYX Video Call
                    </h2>
                </div>

                {/* Conditional Navbar Options */}
                {token ? (
                    <div style={{ display: "flex", alignItems: "center", gap: "20px" }}>
                        <div style={{ display: "flex", alignItems: "center", cursor: "pointer" }} onClick={() => navigate("/history")}>
                            <IconButton>
                                <RestoreIcon />
                            </IconButton>
                            <p style={{ margin: 0, fontWeight: 500 }}>History</p>
                        </div>

                        <Button 
                            variant="outlined" 
                            color="error"
                            onClick={() => {
                                handleLogout();
                                navigate("/home");
                            }}
                        >
                            Logout
                        </Button>
                    </div>
                ) : (
                    <div style={{ display: "flex", alignItems: "center", gap: "15px" }}>
                        <Button variant="outlined" onClick={() => navigate("/auth/1")}>
                            Register
                        </Button>
                        <Button variant="contained" color="primary" onClick={() => navigate("/auth/0")}>
                            Log In
                        </Button>
                    </div>
                )}
            </div>

            {/* Main Content Container */}
            <div className="meetContainer" style={{
                display: "flex",
                flex: 1,
                alignItems: "center",
                justifyContent: "center",
                padding: "40px",
                gap: "50px",
                maxWidth: "1200px",
                margin: "0 auto"
            }}>
                {/* Left Panel */}
                <div className="leftPanel" style={{ flex: 1, display: "flex", flexDirection: "column", gap: "20px" }}>
                    <h1 style={{ fontSize: "2.5rem", color: "#333", lineHeight: "1.3" }}>
                        Providing Quality Video Call <br /> Just Like Quality Education
                    </h1>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: "15px", marginTop: "10px" }}>
                        {/* Control actions setup (Join row & Create row) */}
                        <div style={{ display: 'flex', gap: "10px" }}>
                            <TextField 
                                id="outlined-basic" 
                                label="Meeting Code" 
                                variant="outlined" 
                                size="small"
                                fullWidth
                                value={meetingCode}
                                onChange={(e) => setMeetingCode(e.target.value)}
                                style={{ maxWidth: "300px" }}
                            />
                            <Button 
                                variant='contained' 
                                color="primary" 
                                size="large"
                                onClick={handleJoinMeeting}
                                disabled={!meetingCode.trim()}
                            >
                                Join
                            </Button>
                        </div>

                        {/* Separate Divider or Accent break spacing */}
                        <div style={{ color: "#777", fontSize: "0.9rem", paddingLeft: "5px" }}>or</div>

                        {/* NEW: Create Meeting Trigger Button */}
                        <Button 
                            variant='outlined' 
                            color="primary" 
                            size="large"
                            startIcon={<VideoCallIcon />}
                            onClick={handleCreateMeeting}
                            style={{ maxWidth: "200px", borderRadius: "20px", fontWeight: "600" }}
                        >
                            Create Meeting
                        </Button>
                    </div>
                </div>

                {/* Right Panel */}
                <div className='rightPanel' style={{ flex: 1, display: "flex", justifyContent: "center" }}>
                    <img 
                        src='/logo3.png' 
                        alt="Hero illustration" 
                        style={{ maxWidth: "100%", height: "auto", maxHeight: "400px", objectFit: "contain" }} 
                    />
                </div>
            </div>
        </div>
    );
}

export default HomeComponent;