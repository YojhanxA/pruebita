const { query, body } = require("express-validator");
const { validationResult } = require("express-validator");
const users = [];
const myMatch = [];
const createUserRules = [
  body("id").notEmpty().escape().isInt(),
  body("name").notEmpty().escape().isString(),
  body("email").notEmpty().escape().isEmail(),
  body("password").notEmpty().escape().isString(),
];

const isValid = (req, res, next) => {
  const result = validationResult(req);

  if (!result.isEmpty()) {
    res.status(422).json({
      errors: result.array(),
    });
  } else {
    const { id, name, email, password } = req.body;
    const newUser = { id, name, email, password };
    users.push(newUser);
    next();
  }
};

const isVisValidAuth = (req, res, next) => {
  const result = validationResult(req);

  if (!result.isEmpty()) {
    res.status(422).json({
      errors: result.array(),
      message: "usuario no existe",
    });
  }
  const { email, password } = req.body;
  const userExists = users.find(
    (user) => user.email === email && user.password === password
  );

  if (!userExists) {
    return res
      .status(401)
      .json({ message: "Usuario no encontrado o credenciales incorrectas" });
  }

  next();
};

const matches = (req, res, next) => {
  const { userId, nombre, action } = req.body;
  if (action == "like") {
    const matchh = { userId, nombre, action };
    myMatch.push(matchh);
    res.status(200).json({
      message: "hay match con " + nombre,
      data: { userId, nombre },
    });
  } else {
    res.status(200).json({
      message: "No hay match con " + nombre,
      data: { userId, nombre },
    });
    next();
  }
};

module.exports = {
  createUserRules,
  users,
  isValid,
  isVisValidAuth,
  matches,
  myMatch,
};
