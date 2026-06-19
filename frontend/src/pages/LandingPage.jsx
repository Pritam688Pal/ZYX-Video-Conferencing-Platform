import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import withAuth from '../utils/withAuth.jsx';
import { Button, IconButton } from '@mui/material';
import RestoreIcon from '@mui/icons-material/Restore';
import { AuthContext } from '../contexts/AuthContext.jsx';

function LandingPage() {
    const navigate = useNavigate();
    const { isLoggedIn, handleLogout } = React.useContext(AuthContext);
    const token = isLoggedIn();

    return (
        <div className="landing-page" style={{
            minHeight: "100vh",
            display: "flex",
            flexDirection: "column",
            backgroundColor: "#fafafa",
            fontFamily: "sans-serif"
        }}>
            {/* Header Navigation */}
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
                                localStorage.removeItem("token");
                                navigate("/home");
                            }}
                        >
                            Logout
                        </Button>
                    </div>
                ) : (
                    <div style={{ display: "flex", alignItems: "center", gap: "15px" }}>
                        <Button variant="text" onClick={() => navigate("/home")} style={{ color: "#555", fontWeight: 500 }}>
                            Join as Guest
                        </Button>
                        <Button variant="outlined" onClick={() => navigate("/auth/1")}>
                            Register
                        </Button>
                        <Button variant="contained" color="primary" onClick={() => navigate("/auth/0")}>
                            Log In
                        </Button>
                    </div>
                )}
            </div>

            {/* Main Content Area */}
            <div className="landingMainContainer" style={{
                display: "flex",
                flex: 1,
                alignItems: "center",
                justifyContent: "space-between",
                padding: "40px 80px",
                maxWidth: "1200px",
                margin: "0 auto",
                gap: "40px"
            }}>
                {/* Left Text Panel */}
                <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: "20px" }}>
                    <h1 style={{ fontSize: "3.5rem", margin: 0, color: "#222", lineHeight: "1.2" }}>
                        <span style={{ color: "#FF9839" }}>Connect</span> with your loved Ones
                    </h1>

                    <p style={{ fontSize: "1.2rem", color: "#666", margin: 0 }}>
                        Cover a distance by ZYX Video Call App
                    </p>

                    {/* Fixed button routing hierarchy */}
                    <Link to="/home" className='getStartedBtn' style={{ textDecoration: "none", width: "fit-content" }}>
                        <button style={{
                            backgroundColor: "#FF9839",
                            color: "#ffffff",
                            border: "none",
                            padding: "12px 30px",
                            fontSize: "1.1rem",
                            borderRadius: "25px",
                            fontWeight: "600",
                            cursor: "pointer",
                            boxShadow: "0 4px 6px rgba(255, 152, 57, 0.2)",
                            transition: "transform 0.2s ease"
                        }}>
                            Get Started
                        </button>
                    </Link>
                </div>

                {/* Right Image Panel */}
                <div className='landingImage' style={{ flex: 1, display: "flex", justifyContent: "center" }}>
                    <img
                        src="/mobile.png"
                        alt="Mobile app presentation"
                        style={{
                            maxWidth: "100%",
                            height: "auto",
                            maxHeight: "500px",
                            objectFit: "contain"
                        }}
                    />
                </div>
            </div>
        </div>
    );
}

export default LandingPage;