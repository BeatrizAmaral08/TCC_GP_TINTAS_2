import { connection } from '../configs/Database.js';

const select = `
    SELECT 
        p.idProduto AS id,
        p.idCategoria AS categoriaId,
        c.nome AS categoria,
        p.nome,
        p.descricao,
        p.marca,
        p.preco,
        p.precoPromocional,
        p.desconto,
        p.estoque,
        p.estoqueMinimo,
        p.unidade,
        p.imagem,
        p.ativo,
        p.dataCad,
        p.dataAlt
    FROM produto p
    JOIN categoria c ON c.idCategoria = p.idCategoria
`;

const produtoRepository = {
    //l ista os produtos aplicando os filtros informados
    async listar({
        busca = '',
        categoriaId,
        categoria,
        incluirInativos = false,
        apenasPromocoes = false
    } = {}) {

        const where = [];
        const values = [];

        if (!incluirInativos) {
            where.push('p.ativo=1');
        }

        if (busca) {
            where.push(
                '(p.nome LIKE ? OR c.nome LIKE ? OR p.marca LIKE ?)'
            );

            const q = `%${busca}%`;
            values.push(q, q, q);
        }

        if (categoriaId) {
            where.push('p.idCategoria=?');
            values.push(Number(categoriaId));
        }

        if (categoria) {
            where.push('c.nome=?');
            values.push(categoria);
        }

        if (apenasPromocoes) {
            where.push(
                'p.precoPromocional IS NOT NULL AND p.precoPromocional < p.preco'
            );
        }

        const query = `
            ${select}
            ${where.length ? `WHERE ${where.join(' AND ')}` : ''}
            ORDER BY p.idProduto DESC
        `;

        const [rows] = await connection.execute(query, values);
        return rows;
    },

    //busca um produto pelo ID
    async buscarPorId(id) {

        const [rows] = await connection.execute(
            `${select} WHERE p.idProduto=? LIMIT 1`, [id]
        );
        return rows[0] || null;
    },

    //cria um novo produto
    async criar(p) {

        const [r] = await connection.execute(
            `
            INSERT INTO produto (
                idCategoria,
                nome,
                descricao,
                marca,
                preco,
                precoPromocional,
                desconto,
                estoque,
                estoqueMinimo,
                unidade,
                imagem,
                ativo
            )
            VALUES (?,?,?,?,?,?,?,?,?,?,?,?)
            `,
            [
                p.idCategoria,
                p.nome,
                p.descricao,
                p.marca,
                p.preco,
                p.precoPromocional,
                p.desconto,
                p.estoque,
                p.estoqueMinimo,
                p.unidade,
                p.imagem,
                p.ativo ? 1 : 0
            ]
        );

        return this.buscarPorId(r.insertId);
    },

    //atualiza apenas os campos que foram informados
    async atualizar(id, data) {

        const map = {
            idCategoria: 'idCategoria',
            categoriaId: 'idCategoria',
            nome: 'nome',
            descricao: 'descricao',
            marca: 'marca',
            preco: 'preco',
            precoPromocional: 'precoPromocional',
            desconto: 'desconto',
            estoque: 'estoque',
            estoqueMinimo: 'estoqueMinimo',
            unidade: 'unidade',
            imagem: 'imagem',
            ativo: 'ativo'
        };

        //filtra os campos informados e prepara os valores para o UPDATE
        const campos = Object.entries(map)
            .filter(([key]) => data[key] !== undefined)
            .map(([key, col]) => [
             `${col}=?`,
             key === 'ativo'
              ? (data[key] ? 1 : 0)
             : (data[key] === '' ? null : data[key])
            ]);

        if (!campos.length) {
            return this.buscarPorId(id);
        }

        const fields = campos.map(([field]) => field);
        const values = campos.map(([_, value]) => value);

        values.push(id);
        await connection.execute(
            `UPDATE produto SET ${fields.join(', ')} WHERE idProduto=?`,
            values
        );

        return this.buscarPorId(id);
    },

    // desativa o produto sem remover ele do banco
    async deletar(id) {

        const [r] = await connection.execute(
            'UPDATE produto SET ativo=0 WHERE idProduto=?',
            [id]
        );

        return r.affectedRows;
    },

    //altera o estoque
    async alterarEstoque(
        id,
        { operacao, quantidade, motivo, idUsuario }
    ) {
        const conn = await connection.getConnection();

        try {
            await conn.beginTransaction();

            const [[produto]] = await conn.execute(
                `
                SELECT idProduto, nome, estoque
                FROM produto
                WHERE idProduto=?
                FOR UPDATE
                `,
                [id]
            );

            if (!produto) {
                throw Object.assign(
                    new Error('Produto não encontrado'),
                    { status: 404 }
                );
            }

            const qtd = Math.trunc(Number(quantidade));

            if (!Number.isInteger(qtd) || qtd < 0) {
                throw Object.assign(
                    new Error('Quantidade inválida'),
                    { status: 400 }
                );
            }

            //define o novo estoque de acordo com a operação
            const operacoes = {
                entrada: estoque => estoque + qtd,
                saida: estoque => estoque - qtd,
                definir: () => qtd
            };

            if (!operacoes[operacao]) {
                throw Object.assign(
                    new Error(
                        'Operação deve ser entrada, saida ou definir'
                    ),
                    { status: 400 }
                );
            }

            const novo = operacoes[operacao](produto.estoque);

            if (novo < 0) {
                throw Object.assign(
                    new Error('Estoque insuficiente'),
                    { status: 400 }
                );
            }

            await conn.execute(
                'UPDATE produto SET estoque=? WHERE idProduto=?',
                [novo, id]
            );

            await conn.execute(
                `
                INSERT INTO movimentacao_estoque (
                    idProduto,
                    tipo,
                    quantidade,
                    estoqueAnterior,
                    estoquePosterior,
                    motivo,
                    idUsuario
                )
                VALUES (?,?,?,?,?,?,?)
                `,
                [
                    id,
                    operacao,
                    qtd,
                    produto.estoque,
                    novo,
                    motivo || 'Ajuste pelo painel',
                    idUsuario || null
                ]
            );

            await conn.commit();

            return {
                idProduto: id,
                produto: produto.nome,
                estoqueAnterior: produto.estoque,
                estoque: novo
            };

        } catch (e) {

            await conn.rollback();
            throw e;

        } finally {

            conn.release();
        }
    }
};

export default produtoRepository;