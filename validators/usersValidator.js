const { query, body } = require("express-validator");
const { validationResult } = require("express-validator");
const User = require("../models/Users");
const users = [];
const myMatch = [];
const createUserRules = [
  body("nombre").notEmpty().escape().isString(),
  body("edad").notEmpty().escape().isInt({ min: 18 }), // Ejemplo: asegurar que la edad sea mayor o igual a 18
  body("genero").notEmpty().escape().isString(),
  body("email").notEmpty().escape().isEmail(),
  body("password").notEmpty().escape().isString().isLength({ min: 6 }), // Ejemplo: requerir una contraseña de al menos 6 caracteres
  body("preferencias").optional().isObject(), // Las preferencias son opcionales y deben ser un objeto
  body("ubicacion").optional().escape().isString(), // La ubicación es opcional y debe ser una cadena
  body("fotoPerfil").optional().escape().isURL(), // La foto de perfil es opcional y debe ser una URL
];

const isValid = async (req, res, next) => {
  const result = validationResult(req);
  if (!result.isEmpty()) {
    return res.status(422).json({ errors: result.array() });
  }

  const { nombre, email } = req.body; // Extrae con el nombre correcto

  try {
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(409).json({ message: "El usuario ya existe" });
    }

    // La validación pasó y el usuario no existe, pasa al siguiente middleware (el controlador register)
    next();
  } catch (error) {
    console.error("Error verificando usuario:", error);
    res.status(500).json({ message: "Error en el servidor al verificar el usuario" });
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
