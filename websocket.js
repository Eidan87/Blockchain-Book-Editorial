// websocket.js

const { app, HTTP_PORT, peers, connectToPeers } = require('./index'); // Ajusta la ruta según tu estructura de archivos

const WebSocket = require('ws');

const P2P_PORT = 6002; // Puerto base para WebSocket
let sockets = [];

// Función para iniciar el servidor WebSocket
function startWebSocketServer() {
    const wss = new WebSocket.Server({ port: P2P_PORT }, () => {
        console.log(`WebSocket Server running on port ${P2P_PORT}`);
    });

    // Manejar conexiones WebSocket
    wss.on('connection', (ws) => {
        console.log('New WebSocket connection');

        ws.on('message', (message) => {
            console.log(`Received message: ${message}`);
            handleMessage(ws, message); // Implementa la lógica para manejar el mensaje recibido
        });

        ws.on('close', () => {
            console.log('WebSocket disconnected');
            sockets = sockets.filter(socket => socket !== ws); // Eliminar el socket desconectado
        });

        sockets.push(ws);
    });
}

// Función para manejar mensajes recibidos en WebSocket
function handleMessage(ws, message) {
    // Implementa aquí la lógica para manejar los mensajes recibidos
}

module.exports = {
    startWebSocketServer,
    connectToPeers,
    sockets
};
