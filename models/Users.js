// models/Users.js
const { Schema, model } = require("mongoose");
const { v4: uuidv4 } = require("uuid");

const UserSchema = new Schema(
  {
    id: { type: String, default: uuidv4, unique: true, primaryKey: true },
    ciudad: { type: String, required: true },
    nombre: { type: String, required: true },
    edad: { type: Number, required: true },
    genero: { type: String, required: true },
    preferencias: { type: Object },
    ubicacion: { type: String },
    fotoPerfil: { type: String },
    email: { type: String, required: true, unique: true }, // Asegúrate de tener esto
    password: { type: String, required: true }, // Y esto
  },
  { timestamps: true }
);

module.exports = model("Users", UserSchema);
