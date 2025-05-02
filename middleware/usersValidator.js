const { query, body } = require("express-validator");
const { validationResult } = require("express-validator");
const User = require("../models/Users");
const jwt = require("jsonwebtoken");
const users = [];
const myMatch = [];
const createUserRules = [
  body("nombre").notEmpty().escape().isString(),
  body("edad").notEmpty().escape().isInt({ min: 18 }), 
  body("genero").notEmpty().escape().isString(),
  body("email").notEmpty().escape().isEmail(),
  body("password").notEmpty().escape().isString().isLength({ min: 6 }), 
  body("preferencias").optional().isObject(), 
  body("ubicacion").optional().escape().isString(),
  body("fotoPerfil").optional().escape().isURL(), 
];

const isValid = async (req, res, next) => {
  const result = validationResult(req);
  if (!result.isEmpty()) {
    return res.status(422).json({ errors: result.array() });
  }

  const { nombre, email } = req.body; 

  try {
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(409).json({ message: "El usuario ya existe" });
    }

   
    next();
  } catch (error) {
    console.error("Error verificando usuario:", error);
    res
      .status(500)
      .json({ message: "Error en el servidor al verificar el usuario" });
  }
};

const isVisValidAuth = async (req, res, next) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email, password });

    if (!user) {
      return res.status(400).json({
        ok: false,
        error: {
          message: "Usuario no encontrado o credenciales incorrectas",
        },
      });
    }

    const token = jwt.sign({ userId: user.id }, process.env.SECRET_JWT, {
      expiresIn: "1h",
    });
    res.status(200).json({
      ok: true,
      msg: "Usuario autenticado correctamente",
      user,
      token,
    });
  } catch (error) {
    console.error("Error al autenticar usuario:", error.message);
    res
      .status(500)
      .json({ ok: false, error: { message: "Error en el servidor" } });
  }
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


const authenticateToken = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (token == null) return res.sendStatus(401);

  jwt.verify(token, process.env.SECRET_JWT, (err, user) => {
    if (err) return res.sendStatus(403);
    req.userId = user.userId;
    req.nombre = user.nombre;
    next();
  });
};

module.exports = {
  createUserRules,
  users,
  isValid,
  isVisValidAuth,
  matches,
  myMatch,
  authenticateToken,
};
