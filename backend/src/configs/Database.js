import "dotenv/config";
import mysql from "mysql2/promise";

class Database {
static #instance = null;
#pool = null;

#createPool() {
    this.#pool = mysql.createPool({
        host: process.env.DB_HOST,
        port: Number(process.env.DB_PORT) || 3306,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_DATABASE,

        waitForConnections: true,
        connectionLimit: 10,
        queueLimit: 0,

        connectTimeout: 10000
    });
}

static getInstance() {
    if (!Database.#instance) {
        Database.#instance = new Database();
        Database.#instance.#createPool();
    }

    return Database.#instance;
}

getPool() {
    return this.#pool;
}

}

export const connection =
Database.getInstance().getPool();

export const testarConexao = async () => {
try {
const conn = await connection.getConnection();

    console.log(" Conectado ao MySQL!");
    console.log(` Host: ${process.env.DB_HOST}`);
    console.log(` Banco: ${process.env.DB_DATABASE}`);

    conn.release();

    return true;
} catch (error) {
    console.error("Erro ao conectar ao banco:");
    console.error(error.message);

    return false;
}

};