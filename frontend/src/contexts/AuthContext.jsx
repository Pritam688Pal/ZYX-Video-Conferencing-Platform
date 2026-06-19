import { createContext, useState, useEffect } from 'react';
import axios from 'axios';
import httpStatus from 'http-status';


export const AuthContext = createContext(null);

const client = axios.create({
    baseURL: import.meta.env.VITE_server_baseURL,
    withCredentials: true
});

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);

    const isLoggedIn = () => {
        const token = localStorage.getItem("token");
        return !!token;
    };

    const handleRegister = async (name, username, password) => {
        try {
            let request = await client.post("/register", {
                name: name,
                username: username,
                password: password
            });

            if (request.status === httpStatus.CREATED) {
                if (request.data.token) {
                    // console.log(request.data);

                    localStorage.setItem("token", request.data.token);
                }
                setUser(username);
                return request.data.message;
            }
        } catch (err) {
            throw err;
        }
    };

    const handleLogin = async (username, password) => {
        try {
            let request = await client.post("/login", {
                username: username,
                password: password
            });

            if (request.status === httpStatus.OK || request.status === 200) {
                // console.log(request.data);
                localStorage.setItem("token", request.data.token);
                setUser(username);
                return request.data;
            }
        } catch (err) {
            throw err;
        }
    };

    const getHistoryOfUser = async () => {
        try {
            let request = await client.get("/get_all_activity", {
                headers: {
                    "Authorization": `Bearer ${localStorage.getItem("token")}`
                }
            });
            return request.data;
        } catch (err) {
            throw err;
        }
    };

    const addToUserHistory = async (meetingCode) => {
        try {
            let request = await client.post(
                "/add_to_activity",
                { meeting_code: meetingCode },
                {
                    headers: {
                        "Authorization": `Bearer ${localStorage.getItem("token")}`
                    }
                }
            );
            return request.data;
        } catch (e) {
            throw e;
        }
    };

    const handleLogout = () => {
        try {
            localStorage.removeItem("token");
            setUser(null);
        } catch (error) {
            throw error;
        }
    };

    return (
        <AuthContext.Provider value={{
            user,
            isLoggedIn,
            handleRegister,
            handleLogin,
            getHistoryOfUser,
            addToUserHistory,
            handleLogout
        }}>
            {children}
        </AuthContext.Provider>
    );
};

export default AuthProvider;