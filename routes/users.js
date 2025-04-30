const express = require("express");
const {
  register,
  auth,
  list,
  match,
  myMatchs,
  loginUser,
} = require("../controllers/usersController");
const {
  createUserRules,
  isValid,
  isVisValidAuth,
  matches,
} = require("../validators/usersValidator");
const router = express.Router();

router.post("/login", loginUser);
router.post("/register", createUserRules, isValid, register);
router.post("/auth", createUserRules, isVisValidAuth, auth);
router.get("/list", list);
router.post("/match", matches, match);
router.get("/myMatchs", myMatchs);

module.exports = router;
