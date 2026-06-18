import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../contexts/AuthContext.jsx';
import { useNavigate } from 'react-router-dom';
import Card from '@mui/material/Card';
import Box from '@mui/material/Box';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import HomeIcon from '@mui/icons-material/Home';
import { IconButton } from '@mui/material';

function History() {
    const navigate = useNavigate();
    const { getHistoryOfUser } = useContext(AuthContext);
    const [meetings, setMeetings] = useState([]);

    useEffect(() => {
        const fetchHistory = async () => {
            try {
                const data = await getHistoryOfUser();
                setMeetings(Array.isArray(data) ? data : data || []);
            } catch (err) {
                console.error("Failed to load user activity:", err);
                setMeetings([]);
            }
        };
        fetchHistory();
    }, [getHistoryOfUser]);

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        if (isNaN(date.getTime())) return "Invalid Date";
        const day = date.getDate().toString().padStart(2, "0");
        const month = (date.getMonth() + 1).toString().padStart(2, "0");
        const year = date.getFullYear();

        return `${day}/${month}/${year}`;
    };

    return (
        <div style={{ padding: "20px", maxWidth: "800px", margin: "0 auto", fontFamily: "sans-serif" }}>
            <IconButton onClick={() => navigate("/home")} style={{ marginBottom: "20px" }} color="primary">
                <HomeIcon />
            </IconButton>

            <Typography variant="h4" style={{ marginBottom: "20px", fontWeight: 600, color: "#333" }}>
                Meeting History
            </Typography>

            {/* Layout conditional container matching clean array instance fields */}
            {meetings && meetings.length > 0 ? (
                <div style={{ display: "flex", flexDirection: "column", gap: "15px" }}>
                    {meetings.map((e, i) => (
                        <Card key={e._id || i} variant="outlined" style={{ boxShadow: "0 2px 4px rgba(0,0,0,0.05)", borderRadius: "8px" }}>
                            <CardContent>
                                <Typography sx={{ fontSize: 16, fontWeight: 600 }} color="primary" gutterBottom>
                                    Meeting Code: {e.meeting_code || e.meetingCode || "N/A"}
                                </Typography>
                                <Typography sx={{ fontSize: 14 }} color="text.secondary">
                                    Joined On: {formatDate(e.date || e.createdAt)}
                                </Typography>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            ) : (
                <Box style={{ padding: "40px", textAlign: "center", color: "#777", backgroundColor: "#f9f9f9", borderRadius: "8px", border: "1px dashed #ccc" }}>
                    <p style={{ margin: 0, fontSize: "1.1rem" }}>No meeting history found.</p>
                </Box>
            )}
        </div>
    );
}

export default History;