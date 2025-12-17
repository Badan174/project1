const db = require("../db/pg");

async function findUserByEmail(email) {
  const { rows } = await db.query(`SELECT * FROM users WHERE email = $1`, [email]);
  return rows[0] || null;
}

async function createUser({ name, email, passwordHash }) {
  const { rows } = await db.query(
    `INSERT INTO users(name, email, password_hash)
     VALUES ($1, $2, $3)
     RETURNING id, name, email, created_at`,
    [name, email, passwordHash]
  );
  return rows[0];
}

module.exports = { findUserByEmail, createUser };
