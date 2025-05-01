// routes/users.js
const express = require("express");
const {
  register,
  loginUser,
  list,
  swipe,
  getMatches,
} = require("../controllers/usersController");
const {
  createUserRules,
  isValid,
  authenticateToken,
   isVisValidAuth, 
  // matches, // Esta lógica ahora está en el controlador
} = require("../middleware/usersValidator");
const router = express.Router();

router.post("/login", isVisValidAuth, loginUser);
router.post("/register", createUserRules, isValid, register);
// router.post("/auth", createUserRules, isVisValidAuth, auth); // Ya no se usa como antes
router.get("/users", authenticateToken, list); // Lista de usuarios protegida
router.post("/swipe", authenticateToken, swipe); // Ruta para dar like o dislike
router.get("/matches", authenticateToken, getMatches); // Obtener los matches del usuario

module.exports = router;
