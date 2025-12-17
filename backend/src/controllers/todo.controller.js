const TodoService = require("../services/todo.service");

exports.list = async (req, res, next) => {
  try {
    const todos = await TodoService.list(req.userId);
    res.json(todos);
  } catch (e) {
    next(e);
  }
};

exports.create = async (req, res, next) => {
  try {
    const { title, due_date } = req.body;
    if (!title) return res.status(400).json({ message: "Thiếu title" });

    const todo = await TodoService.create(req.userId, { title, due_date });
    res.status(201).json(todo);
  } catch (e) {
    next(e);
  }
};

exports.complete = async (req, res, next) => {
  try {
    const todoId = Number(req.params.id);
    const { completed } = req.body;

    const updated = await TodoService.setComplete(req.userId, todoId, !!completed);
    if (!updated) return res.status(404).json({ message: "Không tìm thấy todo" });

    res.json(updated);
  } catch (e) {
    next(e);
  }
};

exports.remove = async (req, res, next) => {
  try {
    const todoId = Number(req.params.id);
    const ok = await TodoService.remove(req.userId, todoId);
    if (!ok) return res.status(404).json({ message: "Không tìm thấy todo" });
    res.status(204).send();
  } catch (e) {
    next(e);
  }
};
exports.update = async (req, res, next) => {
  try {
    const todoId = Number(req.params.id);
    const { title, due_date, context } = req.body;

    if (!title) return res.status(400).json({ message: "Thiếu title" });

    const updated = await TodoService.update(req.userId, todoId, { title, due_date, context });
    if (!updated) return res.status(404).json({ message: "Không tìm thấy todo" });

    res.json(updated);
  } catch (e) {
    next(e);
  }
};
