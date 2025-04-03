import React, { useState, useEffect } from 'react';
import './App.css';

function App() {
    const [document, setDocument] = useState(""); // Shared document content
    const [socket, setSocket] = useState(null); // WebSocket connection
    const [userId, setUserId] = useState(""); // Unique ID for the user
    const [avatar, setAvatar] = useState(""); // Avatar URL for the user
    const [theme, setTheme] = useState("light"); // Theme state

    useEffect(() => {
        const newSocket = new WebSocket('ws://localhost:5000'); // Connect to WebSocket server
        setSocket(newSocket);

        newSocket.onopen = () => {
            console.log('WebSocket connection established');
        };

        newSocket.onmessage = (event) => {
            try {
                const message = JSON.parse(event.data);
                if (message.type === 'init') {
                    setDocument(message.data);
                    setUserId(message.userId);
                    setAvatar(message.avatar);
                } else if (message.type === 'update') {
                    setDocument(message.data);
                }
            } catch (error) {
                console.error('Error parsing message:', error);
            }
        };

        newSocket.onclose = () => {
            console.log('WebSocket connection closed');
        };

        newSocket.onerror = (error) => {
            console.error('WebSocket error:', error);
        };

        return () => {
            newSocket.close(); // Clean up WebSocket connection on component unmount
        };
    }, []);

    const handleChange = (e) => {
        const newDocument = e.target.value;
        setDocument(newDocument);

        if (socket && socket.readyState === WebSocket.OPEN) {
            socket.send(JSON.stringify({ type: 'update', data: newDocument }));
        }
    };

    const toggleTheme = () => {
        setTheme(theme === "light" ? "dark" : "light");
    };

    return (
        <div className={`App ${theme}`}>
            <h1>Collaborative Editor</h1>
            <div className="user-info">
                <img src={avatar} alt="Avatar" className="avatar" />
                <p>User ID: {userId}</p>
            </div>
            <div className="toolbar">
                <button onClick={() => document.execCommand('bold')}>Bold</button>
                <button onClick={() => document.execCommand('italic')}>Italic</button>
                <button onClick={() => document.execCommand('underline')}>Underline</button>
                <select onChange={(e) => document.execCommand('foreColor', false, e.target.value)}>
                    <option value="black">Black</option>
                    <option value="red">Red</option>
                    <option value="blue">Blue</option>
                </select>
                <button onClick={toggleTheme}>
                    {theme === "light" ? "Switch to Dark Theme" : "Switch to Light Theme"}
                </button>
            </div>
            <textarea
                value={document}
                onChange={handleChange}
                rows="20"
                cols="80"
            />
        </div>
    );
}

export default App;
