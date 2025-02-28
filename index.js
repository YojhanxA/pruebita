const express = require("express");
const usersRoutes = require("./routes/users");

const app = express();
const PORT = 3000;

app.use(express.json());
app.use("/api", usersRoutes);
app.listen(PORT, () => {
  console.log("express.js app is running at port: " + PORT);
});
