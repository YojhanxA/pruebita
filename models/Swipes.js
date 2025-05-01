const { Schema, model } = require("mongoose"); // Asegúrate de tener esta línea
const { v4: uuidv4 } = require('uuid');

const SwipeSchema = new Schema({
    id: { type: String, default: uuidv4, unique: true, primaryKey: true },
    usuario_origen_id: { type: String, ref: 'Users', required: true },
    usuario_destino_id: { type: String, ref: 'Users', required: true },
    accion: { type: String, enum: ['like', 'dislike'], required: true },
    timestamp: { type: Date, default: Date.now },
});

module.exports = model("Swipes", SwipeSchema);