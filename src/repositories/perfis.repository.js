const pool = require("../db/conexao");

async function listarPerfis() {
    const resultado = await pool.query(
        `SELECT id_perfil, nome, descricao
         FROM perfil
         ORDER BY id_perfil`
    );
    return resultado.rows;
}

async function criarPerfil(nome, descricao) {
    const resultado = await pool.query(
        `INSERT INTO perfil (nome, descricao)
         VALUES ($1, $2)
         RETURNING *`,
        [nome, descricao]
    );
    return resultado.rows[0];
}

async function atualizarPerfil(id, nome, descricao) {
    const resultado = await pool.query(
        `UPDATE perfil
         SET nome = $1,
             descricao = $2
         WHERE id_perfil = $3
         RETURNING *`,
        [nome, descricao, id]
    );
    return resultado.rows[0]; 
}

async function deletarPerfil(id) {
    const resultado = await pool.query(
        `DELETE FROM perfil
         WHERE id_perfil = $1
         RETURNING *`,
        [id]
    );
    return resultado.rows[0]; 
}

async function listarVinculos() {
    const resultado = await pool.query(`
        SELECT
            pu.id_usuario,
            pu.id_perfil,
            p.nome AS perfil,
            pu.data_vinculo
        FROM perfil_usuario pu
        INNER JOIN perfil p
            ON p.id_perfil = pu.id_perfil
        ORDER BY pu.id_usuario, p.nome
    `);
    return resultado.rows;
}

async function removerVinculo(idUsuario, idPerfil) {
    const resultado = await pool.query(
        `DELETE FROM perfil_usuario
         WHERE id_usuario = $1
           AND id_perfil = $2
         RETURNING *`,
        [idUsuario, idPerfil]
    );
    return resultado.rows[0]; 
}

async function adicionarVinculos(idUsuario, perfisIds) {
    const promessas = perfisIds.map(idPerfil => 
        pool.query(
            `INSERT INTO perfil_usuario (id_usuario, id_perfil, data_vinculo)
             VALUES ($1, $2, CURRENT_TIMESTAMP)
             RETURNING *`,
            [idUsuario, idPerfil]
        )
    );

    const resultados = await Promise.all(promessas);
    return resultados.map(res => res.rows[0]); 
}

async function editarVinculos(idUsuario, perfisIds) {
    await pool.query(
        `DELETE FROM perfil_usuario WHERE id_usuario = $1`,
        [idUsuario]
    );

    if (perfisIds && perfisIds.length > 0) {
        return await adicionarVinculos(idUsuario, perfisIds);
    }

    return []; 
}

module.exports = {
    listarPerfis,
    criarPerfil,
    atualizarPerfil,
    deletarPerfil,
    listarVinculos,
    removerVinculo,
    adicionarVinculos,
    editarVinculos
};