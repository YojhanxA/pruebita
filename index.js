// index.js
const express = require("express");
const { dbConection } = require("./database/config");
const usersRoutes = require("./routes/users");
const messagesRoutes = require("./routes/messages"); // Importa las rutas de mensajes
require("dotenv").config();

const PORT = process.env.APP_PORT;
const app = express();

app.use(express.json());
app.use("/api", usersRoutes);
app.use("/api", messagesRoutes); // Usa las rutas de mensajes

// Start connection to MongoDB
dbConection();
app.listen(PORT, () => {
    console.log("express.js app is running at port: " + PORT);
});