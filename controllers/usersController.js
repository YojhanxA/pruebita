const Users = require("../models/Users");
//const { users } = require("../validators/usersValidator");
const { SECRET_JWT } = process.env;
const jwt = require("jsonwebtoken");
const { matches } = require("../validators/usersValidator");

const loginUser = async (req, res, next) => {
  const { email, password } = req.body;
  try {
    const user = await Users.findOne({ email, password });

    let data = null;
    if (!user) {
      return res.status(400).json({
        ok_: false,
        error: {
          message: "Usuario no encontrado o credenciales incorrectas",
        },
      });
    }
    const token = jwt.sign(
      {
        email: user.email,
        password: user.password,
      },
      SECRET_JWT,
      { expiresIn: "1h" }
    );
    res.status(200).json({
      ok_: true,
      msg: "Usuario autenticado correctamente",
      user,
      token,
    });
  } catch (error) {
    console.error("Error al autenticar usuario:", error.message);
    res.status(500).json({
      ok_: false,
      error: {
        message: "Error en el servidor",
      },
    });
  }
};

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
  loginUser,
};
