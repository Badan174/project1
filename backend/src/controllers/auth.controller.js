const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const AuthService = require("../services/auth.service");

exports.register = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ message: "Thiếu dữ liệu" });
    }

    const existing = await AuthService.findUserByEmail(email);
    if (existing) return res.status(409).json({ message: "Email đã tồn tại" });

    const passwordHash = await bcrypt.hash(password, 10);
    const user = await AuthService.createUser({ name, email, passwordHash });

    const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, { expiresIn: "7d" });
    return res.status(201).json({ user, token });
  } catch (err) {
    next(err);
  }
};

exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: "Thiếu dữ liệu" });
    }

    const user = await AuthService.findUserByEmail(email);
    if (!user) return res.status(401).json({ message: "Sai email hoặc mật khẩu" });

    const ok = await bcrypt.compare(password, user.password_hash);
    if (!ok) return res.status(401).json({ message: "Sai email hoặc mật khẩu" });

    const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, { expiresIn: "7d" });
    return res.json({ user: { id: user.id, name: user.name, email: user.email }, token });
  } catch (err) {
    next(err);
  }
};
