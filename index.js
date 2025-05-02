const express = require("express");
const cors = require("cors");
const http = require("http");
const { dbConection } = require("./database/config");
const usersRoutes = require("./routes/users");
const { init } = require("./socket");
require("dotenv").config();

const PORT = process.env.APP_PORT;
const app = express();
const httpServer = http.createServer(app);

app.use(cors());
app.use(express.json());
app.use("/api", usersRoutes);

// Socket.io
init(httpServer); // inicializas y configuras `io`

// Inicia servidores
httpServer.listen(4000, () => {
  console.log("Socket.io server running on port 4000");
});

dbConection();
app.listen(PORT, () => {
  console.log("Express.js app running on port " + PORT);
});
