const express = require("express");
const http = require("http");
const WebSocket = require("ws");

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

let esp32Client = null; // Lưu kết nối ESP32
let androidClient = null; // Lưu kết nối Android

// Lắng nghe kết nối từ WebSocket
wss.on("connection", (ws, req) => {
    console.log("New client connected!");

    ws.on("message", (message) => {
        const msg = message.toString();
        console.log("Received message:", msg);

        // Kiểm tra ESP32 gửi thông báo kết nối
        if (msg === "ESP32_CONNECTED") {
            esp32Client = ws; // Lưu kết nối ESP32
            console.log("ESP32-CAM connected!");
            ws.send("Server: ESP32 connection acknowledged");
        } 
        // Nhận dữ liệu hình ảnh từ ESP32
        else if (esp32Client === ws) {
            console.log("Received image data from ESP32");
            ws.send("ACK"); // Gửi phản hồi về ESP32 để xác nhận
            if (androidClient) {
                console.log("Forwarding image to Android client...");
                androidClient.send(message); // Chuyển tiếp hình ảnh đến Android
            }
        } 
        // Android client gửi thông báo kết nối
        else if (msg === "ANDROID_CONNECTED") {
            androidClient = ws; // Lưu kết nối Android
            console.log("Android client connected!");
            ws.send("Server: Android connection acknowledged");
        }
    });

    // Xử lý khi client ngắt kết nối
    ws.on("close", () => {
        if (esp32Client === ws) {
            console.log("ESP32-CAM disconnected!");
            esp32Client = null;
        } else if (androidClient === ws) {
            console.log("Android client disconnected!");
            androidClient = null;
        } else {
            console.log("A client disconnected!");
        }
    });
});

// Endpoint root đơn giản
app.get("/", (req, res) => {
    res.send("WebSocket Server for ESP32-CAM and Android!");
});

// Chạy server
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
