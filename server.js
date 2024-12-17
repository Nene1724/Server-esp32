const express = require("express");
const http = require("http");
const WebSocket = require("ws");

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

let esp32Client = null;
let androidClient = null;

wss.on("connection", (ws) => {
    console.log("New client connected!");

    ws.on("message", (message) => {
        const msg = message.toString();

        if (msg === "ESP32_CONNECTED") {
            esp32Client = ws;
            console.log("ESP32-CAM connected!");
        } else if (msg.startsWith("COMMAND:")) {
            console.log("Received command from Android: ", msg);
            if (esp32Client) esp32Client.send(msg);
        } else if (esp32Client === ws) {
            if (androidClient) androidClient.send(message);
        }
    });

    ws.on("close", () => console.log("Client disconnected!"));
});

app.get("/", (req, res) => {
    res.send("WebSocket Server for ESP32-CAM and Android!");
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
