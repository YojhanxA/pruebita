// index.js
const express = require("express");
const cors = require("cors");
const { dbConection } = require("./database/config");
const usersRoutes = require("./routes/users");
const http = require("http");
const { Server, Socket } = require("socket.io");
require("dotenv").config();

const PORT = process.env.APP_PORT;
const app = express();

const httpServer = http.createServer(app);
app.use(cors());
app.use(express.json());
app.use("/api", usersRoutes);

const io = new Server(httpServer, {
  connectionStateRecovery: {},
  cors: {
    origin: "*",
  },
});
io.on("connection", (socket = Socket) => {
  console.log("Nuevo Usuario conectado:", socket.id);

  socket.on("disconnect", () => {
    console.log("Usuario desconectado:", socket.id);
  });

  socket.on("chat message", (payload, callback) => {
    console.log("Mensaje recibido:", JSON.stringify(payload));
    io.emit("chat message", payload);

    if (callback) callback();
  });
});

httpServer.listen(4000, () => {
  console.log("Socket.io server is running at port: " + 4000);
});

// Start connection to MongoDB
dbConection();
app.listen(PORT, () => {
  console.log("express.js app is running at port: " + PORT);
});
