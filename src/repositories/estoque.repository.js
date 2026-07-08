const pool = require("../db/conexao"); 

async function listarEstoque() {
    const resultado = await pool.query(
        `SELECT *
         FROM estoque_lojas
         ORDER BY cod_lojas`
    );
    return resultado.rows;
}

async function buscarLojaPorId(cod_lojas) {
    const resultado = await pool.query(
        "SELECT * FROM estoque_lojas WHERE cod_lojas = $1",
        [cod_lojas]
    );
    return resultado.rows[0]; 
}

async function atualizarEstoque(cod_lojas, estoque_atual, estoque_minimo, qtd_recomendada) {
    const resultado = await pool.query(
        `UPDATE estoque_lojas
         SET estoque_atual = $1,
             estoque_minimo = $2,
             qtd_recomendada = $3
         WHERE cod_lojas = $4
         RETURNING *`,
        [estoque_atual, estoque_minimo, qtd_recomendada, cod_lojas]
    );
    return resultado.rows[0]; 
}

module.exports = {
    listarEstoque,
    buscarLojaPorId,
    atualizarEstoque
};