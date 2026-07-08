const pool = require("../db/conexao");

async function buscarLojaPorCodigo(cod_loja) {
    const resultado = await pool.query(
        "SELECT * FROM lojas WHERE cod_loja = $1",
        [cod_loja]
    );
    return resultado.rows[0]; 
}

async function criarLoja(cod_loja, nome) {
    const resultado = await pool.query(
        `INSERT INTO lojas (cod_loja, nome)
         VALUES ($1, $2)
         RETURNING *`,
        [cod_loja, nome]
    );
    return resultado.rows[0];
}

async function listarLojas() {
    const resultado = await pool.query(
        "SELECT * FROM lojas ORDER BY cod_loja"
    );
    return resultado.rows;
}

async function atualizarLoja(cod_loja, nome) {
    const resultado = await pool.query(
        `UPDATE lojas
         SET nome = $1
         WHERE cod_loja = $2
         RETURNING *`,
        [nome, cod_loja]
    );
    return resultado.rows[0];
}

async function deletarLoja(cod_loja) {
    const resultado = await pool.query(
        `DELETE FROM lojas
         WHERE cod_loja = $1
         RETURNING *`,
        [cod_loja]
    );
    return resultado.rows[0]; 
}

module.exports = {
    buscarLojaPorCodigo,
    criarLoja,
    listarLojas,
    atualizarLoja,
    deletarLoja
};