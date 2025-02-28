const register = async (req, res) => {
  const { nombre, password } = req.body;

  res.status(200).json({
    message: "Usuario registrado correctamente",
    data: { nombre, password },
  });
};

const auth = async (req, res) => {
  const { nombre, password } = req.body;

  res.status(200).json({
    message: "el usuario existe, continue",
    data: { nombre, password },
  });
};

const list = async (req, res) => {
  const users = [
    { userId: "12", nombre: "Marta" },
    { userId: "54", nombre: "Maria" },
    { userId: "33", nombre: "Beatriz" },
    { userId: "23", nombre: "Juana" },
    { userId: "76", nombre: "Evelyn" },
  ];
  res.status(200).json(users);
};

const match = async (req, res) => {
  const { userId, nombre, action } = req.body;
  if (action == "like") {
    res.status(200).json({
      message: "hay match con " + nombre,
      data: { userId, nombre },
    });
  } else {
    res.status(200).json({
      message: "No hay match con " + nombre,
      data: { userId, nombre },
    });
  }
};

const myMatchs = async (req, res) => {
  const myMatchs = [
    { userId: "12", nombre: "Marta" },
    { userId: "54", nombre: "Maria" },
    { userId: "33", nombre: "Beatriz" },
    { userId: "23", nombre: "Juana" },
    { userId: "76", nombre: "Evelyn" },
  ];
  res.status(200).json({ message: "Mis matchs", data: myMatchs });
};
module.exports = {
  register,
  auth,
  list,
  match,
  myMatchs,
};
