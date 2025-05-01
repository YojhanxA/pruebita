const { Schema, model } = require("mongoose"); // Asegúrate de tener esta línea
const { v4: uuidv4 } = require('uuid');

const MessageSchema = new Schema({
    id: { type: String, default: uuidv4, unique: true, primaryKey: true },
    sender_id: { type: String, ref: 'Users', required: true },
    receiver_id: { type: String, ref: 'Users', required: true },
    contenido: { type: String, required: true },
    timestamp: { type: Date, default: Date.now },
});

module.exports = model("Messages", MessageSchema);