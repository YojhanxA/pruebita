let io;

module.exports = {
  init: (server) => {
    io = require("socket.io")(server, {
      connectionStateRecovery: {},
      cors: {
        origin: "*",
      },
    });

    io.on("connection", (socket) => {
      console.log("Nuevo Usuario conectado:", socket.id);

      socket.on("disconnect", () => {
        console.log("Usuario desconectado:", socket.id);
      });

      socket.on("chat message", (payload, callback) => {
        console.log("Mensaje recibido desde cliente:", JSON.stringify(payload));
        io.emit("chat message", payload);
        if (callback) callback();
      });
    });

    return io;
  },
  getIO: () => {
    if (!io) throw new Error("Socket.io no está inicializado");
    return io;
  },
};
