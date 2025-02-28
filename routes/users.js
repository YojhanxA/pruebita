const express = require("express");
const {
  register,
  auth,
  list,
  match,
  myMatchs,
} = require("../controllers/usersController");
const router = express.Router();

router.post("/register", register);
router.post("/auth", auth);
router.get("/list", list);
router.post("/match", match);
router.get("/myMatchs", myMatchs);

module.exports = router;
