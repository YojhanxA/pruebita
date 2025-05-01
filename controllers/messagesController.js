// controllers/messagesController.js
const Messages = require("../models/Messages");
const Matches = require("../models/Matches");

const sendMessage = async (req, res) => {
    const { receiverId, contenido } = req.body;
    const senderId = req.userId; // Obtenido del middleware de autenticación

    try {
        // Verificar si existe un match entre los usuarios
        const match = await Matches.findOne({
            $or: [
                { usuario1_id: senderId, usuario2_id: receiverId },
                { usuario1_id: receiverId, usuario2_id: senderId }
            ]
        });

        if (!match) {
            return res.status(403).json({ message: "No existe un match entre estos usuarios." });
        }

        const newMessage = new Messages({
            sender_id: senderId,
            receiver_id: receiverId,
            contenido,
        });
        const savedMessage = await newMessage.save();
        // Aquí podrías emitir un evento de Socket.io para enviar el mensaje en tiempo real
        res.status(201).json(savedMessage);
    } catch (error) {
        console.error("Error al enviar el mensaje:", error);
        res.status(500).json({ message: "Error en el servidor al enviar el mensaje" });
    }
};

const getConversation = async (req, res) => {
    const { otherUserId } = req.params;
    const userId = req.userId; // Obtenido del middleware de autenticación

    try {
        // Verificar si existe un match entre los usuarios
        const match = await Matches.findOne({
            $or: [
                { usuario1_id: userId, usuario2_id: otherUserId },
                { usuario1_id: otherUserId, usuario2_id: userId }
            ]
        });

        if (!match) {
            return res.status(403).json({ message: "No existe un match entre estos usuarios." });
        }

        const messages = await Messages.find({
            $or: [
                { sender_id: userId, receiver_id: otherUserId },
                { sender_id: otherUserId, receiver_id: userId }
            ]
        }).sort({ timestamp: 1 }); // Ordenar los mensajes por fecha

        res.status(200).json(messages);
    } catch (error) {
        console.error("Error al obtener la conversación:", error);
        res.status(500).json({ message: "Error en el servidor al obtener la conversación" });
    }
};

module.exports = {
    sendMessage,
    getConversation,
};