// controllers/usersController.js
const Users = require("../models/Users");
const Swipes = require("../models/Swipes");
const Matches = require("../models/Matches");
const jwt = require("jsonwebtoken");
const Chat = require("../models/Chat");
const User = require("../models/Users");
const { v4: uuidv4 } = require("uuid");
const { getIO } = require("../socket"); // Asegúrate de importar bien esto

const loginUser = async (req, res) => {
  res.status(200).json({ message: "Login exitoso" });
};

const register = async (req, res) => {
  try {
    const {
      ciudad,
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
      ciudad,
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
    const currentUser = await Users.findOne({ id: req.userId });
    if (!currentUser) {
      return res.status(404).json({ message: "Usuario actual no encontrado" });
    }

    const { ciudad } = req.query;

    // Obtener swipes hechos por el usuario actual (usando UUID)
    const swipesRealizados = await Swipes.find({
      usuario_origen_id: currentUser.id,
    });

    const idsSwiped = swipesRealizados.map((s) => s.usuario_destino_id);

    // Obtener matches (también comparando UUIDs)
    const matches = await Matches.find({
      $or: [
        { usuario1_id: currentUser.id },
        { usuario2_id: currentUser.id },
      ],
    });

    const idsMatch = matches.map((m) =>
      m.usuario1_id === currentUser.id ? m.usuario2_id : m.usuario1_id
    );

    const idsExcluidos = [...new Set([...idsSwiped, ...idsMatch, currentUser.id])];

    const filter = {
      id: { $nin: idsExcluidos },
    };

    if (ciudad && ciudad.toLowerCase() !== "todos") {
      filter.ciudad = ciudad;
    }

    const users = await Users.find(filter);
    res.status(200).json({ usuarios: users });
  } catch (error) {
    console.error("Error al listar usuarios:", error);
    res.status(500).json({ message: "Error en el servidor al listar usuarios" });
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
const getMatch = async (req, res) => {
  const userId = req.userId;

  try {
    // Buscar el match del usuario
    const match = await Matches.findOne({
      $or: [{ usuario1_id: userId }, { usuario2_id: userId }],
    });

    if (!match) {
      return res.status(404).json({ message: "No tienes un match." });
    }

    // Obtener los mensajes del chat relacionado con el match
    const chat = await Chat.findOne({ match_id: match.id }).populate(
      "messages"
    );

    const messages = chat ? chat.messages : [];

    // Obtener los nombres de los usuarios involucrados en el match
    const usuario1 = await User.findOne({ id: match.usuario1_id });
    const usuario2 = await User.findOne({ id: match.usuario2_id });

    const messagesWithNames = messages.map((message) => {
      const sender =
        message.sender_id.toString() === match.usuario1_id.toString()
          ? usuario1.nombre
          : usuario2.nombre;
      return {
        ...message.toObject(),
        senderName: sender,
      };
    });

    res.json({
      match: match,
      messages: messagesWithNames,
    });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ message: "Error al obtener el match y los mensajes." });
  }
};
const sendMessage = async (req, res) => {
  const { matchId, message } = req.body;
  const userId = req.userId;

  try {
    const match = await Matches.findOne({ id: matchId });

    if (
      !match ||
      (match.usuario1_id !== userId && match.usuario2_id !== userId)
    ) {
      return res.status(404).json({ message: "No tienes acceso a este chat." });
    }

    let chat = await Chat.findOne({ match_id: matchId });

    if (!chat) {
      chat = new Chat({ match_id: matchId, messages: [] });
    }

    const newMessage = {
      sender_id: userId,
      receiver_id:
        userId === match.usuario1_id ? match.usuario2_id : match.usuario1_id,
      message,
      createdAt: new Date(),
    };

    chat.messages.push(newMessage);
    await chat.save();

    const senderUser =
      userId === match.usuario1_id
        ? await User.findOne({ id: match.usuario1_id })
        : await User.findOne({ id: match.usuario2_id });

    const fullMessage = {
      ...newMessage,
      senderName: senderUser?.nombre || "Desconocido",
    };

    const io = getIO(); // Tu instancia global de socket.io
    io.emit("chat message", fullMessage); // Enviar a todos

    res.json({ message: fullMessage });
  } catch (error) {
    console.error("Error en sendMessage:", error);
    res.status(500).json({ message: "Error al enviar el mensaje" });
  }
};
module.exports = {
  register,
  loginUser,
  list,
  swipe,
  getMatch,
  sendMessage,
};
