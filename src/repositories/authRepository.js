import { connection } from '../configs/Database.js';

const authRepository = {
  async buscarPorEmail(email) {

    const [rows] = await connection.execute(

      `SELECT id, nome, email, cpf, senha, perfil, ativo, dataCad
       FROM cliente WHERE email = ? LIMIT 1`, [email]
    );
    return rows[0] || null;
  },

  async criar({ cliente, senhaHash, telefone, endereco }) {

    const conn = await connection.getConnection();
    try {
      await conn.beginTransaction();

      const [result] = await conn.execute(
        `INSERT INTO cliente (nome, email, cpf, senha, perfil, ativo)
         VALUES (?, ?, ?, ?, 'comprador', 1)`,
        [cliente.nome, cliente.email, cliente.cpf, senhaHash]
      );

      const idCliente = result.insertId;

      if (telefone) {
        await conn.execute(
          `INSERT INTO telefone (telefone, idCliente, tipo, principal)
           VALUES (?, ?, 'celular', 1)`,
          [telefone, idCliente]
        );
      }

      if (endereco?.cep && endereco?.rua && endereco?.numero != null) {

        await conn.execute(
          `INSERT INTO endereco (CEP, rua, numero, complemento, bairro, cidade, estado, principal, idCliente)
           VALUES (?, ?, ?, ?, ?, ?, ?, 1, ?)`,
          [
            endereco.cep,
            endereco.rua,
            endereco.numero,
            endereco.complemento || null,
            endereco.bairro || '',
            endereco.cidade || '',
            endereco.estado || '',
            idCliente
          ]
        );
      }

      await conn.commit();
      return { id: idCliente, nome: cliente.nome, email: cliente.email, perfil: 'comprador' };
      
    } catch (error) {

      await conn.rollback();
      throw error;

    } finally {
      conn.release();
    }
  }
};

export default authRepository;