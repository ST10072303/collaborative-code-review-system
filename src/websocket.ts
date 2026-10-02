import { WebSocketServer, WebSocket } from "ws";

// stores active WebSocket connections.
// The key is the user's ID and the value is the WebSocket connection belonging to that user.
const connectedUsers = new Map<number, WebSocket>();

// create the WebSocket server.
// The server listens on port 3001 so that it can separately from the Express HTTP server on port 3000.
const wss = new WebSocketServer({port: 3001});

// handle a new WebSocket connection.
wss.on("connection", (socket: WebSocket, request) => {
    console.log("New WebSocket connection.");

    // Get the user ID from the connection URL.
        const url = new URL(request.url || "", "http://localhost:3001");

    const userId = Number(url.searchParams.get("userId"));

    // validate the user ID.
    if (isNaN(userId)) {
        socket.close();
        return;
    }

    // store the user's active connection.
    connectedUsers.set(userId, socket);

    console.log(`User ${userId} connected to WebSocket.`);

    // remove the user when the connection closes.
    socket.on("close", () => {
        connectedUsers.delete(userId);
        console.log(`User ${userId} disconnected from WebSocket.`);
    });
});

// send a notification to a specific connected user.
export const sendNotification = (userId: number, message: string): void => {
    const socket = connectedUsers.get(userId);
    // only send the notification if the user currently has an active WebSocket connection.
    if (!socket) {
        return;
    }
    // make sure the connection is still open.
    if (socket.readyState !== WebSocket.OPEN) {
        return;
    }
    socket.send(JSON.stringify({type: "notification", message})
    );
};
console.log("WebSocket server is running on ws://localhost:3001");