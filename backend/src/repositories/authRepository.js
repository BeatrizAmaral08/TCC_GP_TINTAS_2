
import { connection } from "../configs/Database.js";

const authRepository = {

  // Buscar usuário pelo e-mail
  async buscarPorEmail(email) {
    const [rows] = await connection.query(
      `SELECT
        id,
        nome,
        email,
        cpf,
        senha,
        perfil,
        ativo
       FROM cliente
       WHERE email = ?
       LIMIT 1`,
      [email]
    );

    return rows[0] || null;
  },

  // Buscar usuário pelo ID
  async buscarPorId(id) {
    const [rows] = await connection.query(
      `SELECT
        id,
        nome,
        email,
        cpf,
        perfil,
        ativo
       FROM cliente
       WHERE id = ?
       LIMIT 1`,
      [id]
    );

    return rows[0] || null;
  },

  // Criar novo usuário
  async criar({ nome, email, senhaHash, cpf }) {
    const [resultado] = await connection.query(
      `INSERT INTO cliente
       (nome, email, cpf, senha, perfil)
       VALUES (?, ?, ?, ?, 'comprador')`,
      [nome, email, cpf, senhaHash]
    );

    return await authRepository.buscarPorId(
      resultado.insertId
    );
  },

};

export default authRepository;
