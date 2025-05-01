// routes/messages.js
const express = require("express");
const {
    sendMessage,
    getConversation,
} = require("../controllers/messagesController");
const { authenticateToken } = require("../middleware/usersValidator"); // Reutiliza el middleware de autenticación
const router = express.Router();

router.post("/messages", authenticateToken, sendMessage);
router.get("/messages/:otherUserId", authenticateToken, getConversation);

module.exports = router;