const db = require("../db/pg");

exports.list = async (userId) => {
  const { rows } = await db.query(
    `SELECT id, title, context, due_date, completed, created_at, updated_at
     FROM todos
     WHERE user_id = $1
     ORDER BY completed ASC, due_date NULLS LAST, id DESC`,
    [userId]
  );
  return rows;
};

exports.create = async (userId, { title, due_date, context }) => {
  const { rows } = await db.query(
    `INSERT INTO todos(user_id, title, due_date, context)
     VALUES ($1, $2, $3, $4)
     RETURNING id, title, context, due_date, completed, created_at, updated_at`,
    [userId, title, due_date || null, context || ""]
  );
  return rows[0];
};

exports.update = async (userId, todoId, { title, due_date, context }) => {
  const { rows } = await db.query(
    `UPDATE todos
     SET title = $1,
         due_date = $2,
         context = $3,
         updated_at = now()
     WHERE id = $4 AND user_id = $5
     RETURNING id, title, context, due_date, completed, updated_at`,
    [title, due_date || null, context || "", todoId, userId]
  );
  return rows[0] || null;
};

exports.setComplete = async (userId, todoId, completed) => {
  const { rows } = await db.query(
    `UPDATE todos
     SET completed = $1, updated_at = now()
     WHERE id = $2 AND user_id = $3
     RETURNING id, title, context, due_date, completed, updated_at`,
    [completed, todoId, userId]
  );
  return rows[0] || null;
};

exports.remove = async (userId, todoId) => {
  const { rowCount } = await db.query(
    `DELETE FROM todos WHERE id = $1 AND user_id = $2`,
    [todoId, userId]
  );
  return rowCount > 0;
};
