const mongoose = require("mongoose");
require("dotenv").config(); // ¡Esto debe ir arriba!

const { MONGO_URI, DB_NAME } = process.env;

const dbConection = async () => {
  try {
    const uri = `${MONGO_URI}/${DB_NAME}`;
    await mongoose.connect(uri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("✅ Conectado a MongoDB");
  } catch (error) {
    console.log("❌ Error de conexión a la base de datos", error);
    throw new Error("Error de conexión a la base de datos");
  }
};

module.exports = {
  dbConection,
};
