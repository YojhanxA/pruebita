const { users } = require("../validators/usersValidator");

const { matches } = require("../validators/usersValidator");
const register = (req, res) => {
  res.status(200).json({
    message: "Usuario registrado correctamente",
  });
};

const auth = (req, res) => {
  res.status(200).json({
    message: "Usuario autenticado correctamente",
  });
};

const list = (req, res) => {
  res.status(200).json(users);
};

const match = (req, res) => {
  res.status(200).json(matches);
};

const myMatchs = (req, res) => {
  const { myMatch } = require("../validators/usersValidator");
  res.status(200).json(myMatch);
};
module.exports = {
  register,
  auth,
  list,
  match,
  myMatchs,
};
