import { connection } from "../configs/Database.js";

const authRepository = {

  async buscarPorEmail(email) {

    const [rows] = await connection.execute(
      `SELECT 
            idUsuario AS id,
            nome,
            email,
            senha
       FROM usuario
       WHERE email = ?
       LIMIT 1`,
      [email]
    );

    return rows[0] || null;
  },


  async buscarPorId(id) {

    const [rows] = await connection.execute(
      `SELECT
            idUsuario AS id,
            nome,
            email
       FROM usuario
       WHERE idUsuario = ?
       LIMIT 1`,
      [id]
    );

    return rows[0] || null;
  },


  async criar({ nome, email, senhaHash }) {

    const [result] = await connection.execute(
      `INSERT INTO usuario (nome, email, senha)
       VALUES (?, ?, ?)`,
      [nome, email, senhaHash]
    );

    return {
      id: result.insertId,
      nome,
      email
    };
  }
};

export default authRepository;
