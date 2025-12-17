const express = require("express");
const router = express.Router();

const auth = require("../middleware/auth.middleware");
const TodoController = require("../controllers/todo.controller");

router.get("/", auth, TodoController.list);
router.post("/", auth, TodoController.create);
router.patch("/:id/complete", auth, TodoController.complete);
router.delete("/:id", auth, TodoController.remove);
router.patch("/:id", auth, TodoController.update);
module.exports = router;

