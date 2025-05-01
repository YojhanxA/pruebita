const { Schema, model } = require("mongoose"); // Asegúrate de tener esta línea
const { v4: uuidv4 } = require('uuid');

const MatchSchema = new Schema({
    id: { type: String, default: uuidv4, unique: true, primaryKey: true },
    usuario1_id: { type: String, ref: 'Users', required: true },
    usuario2_id: { type: String, ref: 'Users', required: true },
    timestamp: { type: Date, default: Date.now },
});

module.exports = model("Matches", MatchSchema);