// controllers/usersController.js
const Users = require("../models/Users");
const Swipes = require("../models/Swipes");
const Matches = require("../models/Matches");
const jwt = require("jsonwebtoken");
const { v4: uuidv4 } = require("uuid"); // Importa uuid

const loginUser = async (req, res) => {
  res.status(200).json({ message: "Login exitoso" });
};

const register = async (req, res) => {
  try {
    const {
      nombre,
      edad,
      genero,
      preferencias,
      ubicacion,
      fotoPerfil,
      email,
      password,
    } = req.body;

    const existingUser = await Users.findOne({ email });
    if (existingUser) {
      return res
        .status(409)
        .json({ message: "El usuario ya existe con este correo electrónico" });
    }

    const newUser = new Users({
      nombre,
      edad,
      genero,
      preferencias,
      ubicacion,
      fotoPerfil,
      email,
      password,
      id: uuidv4(), // Genera un UUID para el nuevo usuario
    });

    const savedUser = await newUser.save();
    res
      .status(201)
      .json({ message: "Usuario registrado correctamente", user: savedUser });
  } catch (error) {
    console.error("Error al registrar usuario:", error);
    res
      .status(500)
      .json({ message: "Error en el servidor al registrar el usuario" });
  }
};

const list = async (req, res) => {
  try {
    // Buscar el usuario actual por su UUID (el 'id' que generaste)
    const currentUser = await Users.findOne({ id: req.userId });
    if (!currentUser) {
      return res.status(404).json({ message: "Usuario actual no encontrado" });
    }

    // Buscar todos los demás usuarios excluyendo al usuario actual por su UUID
    const users = await Users.find({ id: { $ne: req.userId } });
    res.status(200).json(users);
  } catch (error) {
    console.error("Error al listar usuarios:", error);
    res
      .status(500)
      .json({ message: "Error en el servidor al listar usuarios" });
  }
};

const swipe = async (req, res) => {
  const { destinoId, accion } = req.body;
  const origenId = req.userId; // Obtenido del middleware de autenticación

  try {
    const newSwipe = new Swipes({
      usuario_origen_id: origenId,
      usuario_destino_id: destinoId,
      accion,
    });
    await newSwipe.save();

    // Verificar si hay un "like" mutuo
    if (accion === "like") {
      const reverseSwipe = await Swipes.findOne({
        usuario_origen_id: destinoId,
        usuario_destino_id: origenId,
        accion: "like",
      });

      if (reverseSwipe) {
        // Crear un nuevo match
        const newMatch = new Matches({
          usuario1_id: origenId,
          usuario2_id: destinoId,
        });
        const savedMatch = await newMatch.save();
        // Aquí podrías emitir un evento de Socket.io para notificar a los usuarios del match
        res.status(200).json({ message: "¡Es un match!", match: savedMatch });
      } else {
        res.status(200).json({ message: `Le diste ${accion} a este usuario.` });
      }
    } else {
      res.status(200).json({ message: `Le diste ${accion} a este usuario.` });
    }
  } catch (error) {
    console.error("Error al registrar el swipe:", error);
    res
      .status(500)
      .json({ message: "Error en el servidor al procesar el swipe" });
  }
};

const getMatches = async (req, res) => {
  const userId = req.userId; // Obtenido del middleware de autenticación
  try {
    const matches = await Matches.find({
      $or: [{ usuario1_id: userId }, { usuario2_id: userId }],
    })
      .populate("usuario1_id", "nombre fotoPerfil")
      .populate("usuario2_id", "nombre fotoPerfil");

    // Formatear la respuesta para que sea más fácil de usar en el frontend
    const formattedMatches = matches.map((match) => {
      const matchedUser =
        match.usuario1_id.id === userId ? match.usuario2_id : match.usuario1_id;
      return {
        id: match.id,
        user: matchedUser,
        timestamp: match.timestamp,
      };
    });

    res.status(200).json(formattedMatches);
  } catch (error) {
    console.error("Error al obtener los matches:", error);
    res
      .status(500)
      .json({ message: "Error en el servidor al obtener los matches" });
  }
};

module.exports = {
  register,
  loginUser,
  list,
  swipe,
  getMatches,
};
