// routes/users.js
const express = require("express");
const {
  register,
  loginUser,
  list,
  swipe,
  getMatch,
  sendMessage,
} = require("../controllers/usersController");
const {
  createUserRules,
  isValid,
  authenticateToken,
  isVisValidAuth,
} = require("../middleware/usersValidator");
const router = express.Router();

router.post("/login", isVisValidAuth, loginUser);
router.post("/register", createUserRules, isValid, register);
router.get("/users", authenticateToken, list); // Lista de usuarios protegida
router.post("/swipe", authenticateToken, swipe); // Ruta para dar like o dislike
router.get("/match", authenticateToken, getMatch); // Obtener los matches del usuario
router.post("/mensaje", authenticateToken, sendMessage); // Enviar mensaje

module.exports = router;
