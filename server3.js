const WebSocket = require('ws');
const { v4: uuidv4 } = require('uuid');

const port = process.env.PORT || 5000; // Use environment variable or default port
const server = new WebSocket.Server({ port });

let documentData = ""; // Shared document content
let users = {}; // Store user data (ID and avatar)

server.on('connection', (socket) => {
    const userId = uuidv4(); // Generate a unique ID for the user
    const avatar = `https://api.dicebear.com/6.x/bottts/svg?seed=${userId}`; // Generate avatar URL based on ID
    users[userId] = { avatar };

    console.log(`User connected: ${userId}`);
    socket.send(JSON.stringify({ type: 'init', data: documentData, userId, avatar }));

    socket.on('message', (message) => {
        const parsedMessage = JSON.parse(message);

        if (parsedMessage.type === 'update') {
            documentData = parsedMessage.data;

            // Broadcast updated content to all connected clients
            server.clients.forEach((client) => {
                if (client.readyState === WebSocket.OPEN) {
                    client.send(JSON.stringify({ type: 'update', data: documentData }));
                }
            });
        }
    });

    socket.on('close', () => {
        console.log(`User disconnected: ${userId}`);
        delete users[userId];
    });
});

console.log(`WebSocket server running on port ${port}`);
