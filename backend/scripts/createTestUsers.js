import 'dotenv/config';
import bcrypt from 'bcrypt';
import { connection } from '../src/configs/Database.js';

const usuarios=[
  {nome:'Comprador Teste',email:'comprador@gptintas.com.br',cpf:'11111111111',perfil:'comprador'},
  {nome:'Repositor Teste',email:'repositor@gptintas.com.br',cpf:'22222222222',perfil:'repositor'},
  {nome:'Dev GP Tintas',email:'dev@gptintas.com.br',cpf:'33333333333',perfil:'dev'}
];

try{
  const senha=await bcrypt.hash('123456',10);
  for(const u of usuarios){
    await connection.execute(
      `INSERT INTO cliente (nome,email,cpf,senha,perfil,ativo)
       VALUES (?,?,?,?,?,1)
       ON DUPLICATE KEY UPDATE nome=VALUES(nome),senha=VALUES(senha),perfil=VALUES(perfil),ativo=1`,
      [u.nome,u.email,u.cpf,senha,u.perfil]
    );
    console.log(`Usuário de teste pronto: ${u.email} / 123456 (${u.perfil})`);
  }
}finally{await connection.end();}
