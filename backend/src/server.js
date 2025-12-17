require("dotenv").config();
const express = require("express");
const cors = require("cors");

const authRoute = require("./routes/auth.route");
const todoRoute = require("./routes/todo.route");

const app = express();

app.use(cors());
app.use(express.json());
app.use((err, req, res, next) => {
  if (err?.type === "entity.parse.failed") {
    return res.status(400).json({ message: "JSON không hợp lệ" });
  }
  next(err);
});

app.get("/health", (req, res) => res.json({ ok: true }));




app.use("/api/auth", authRoute);
app.use("/api/todos", todoRoute);

app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ message: "Internal Server Error" });
});

app.listen(process.env.PORT || 8080, () => {
  console.log("Server running on port", process.env.PORT || 8080);
});
