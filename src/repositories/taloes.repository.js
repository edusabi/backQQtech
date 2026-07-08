const pool = require("../db/conexao");

async function criarEnvio(cod_lojas, id_usuario, data_envio, quantidade_enviada, observacao) {
    const resultado = await pool.query(
        `INSERT INTO envios_taloes (cod_lojas, id_usuario, data_envio, quantidade_enviada, observacao)
         VALUES ($1, $2, $3, $4, $5) RETURNING *`,
        [cod_lojas, id_usuario, data_envio, quantidade_enviada, observacao]
    );
    return resultado.rows[0];
}

async function listarEnvios() {
    const resultado = await pool.query("SELECT * FROM envios_taloes ORDER BY data_envio DESC");
    return resultado.rows;
}

async function criarRecebimento(cod_lojas, id_usuario, id_envio, data_recebimento, quantidade_recebida, observacao) {
    const resultado = await pool.query(
        `INSERT INTO recebimentos_taloes (cod_lojas, id_usuario, id_envio, data_recebimento, quantidade_recebida, observacao)
         VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
        [cod_lojas, id_usuario, id_envio, data_recebimento, quantidade_recebida, observacao]
    );
    return resultado.rows[0];
}

async function listarRecebimentos() {
    const resultado = await pool.query("SELECT * FROM recebimentos_taloes ORDER BY data_recebimento DESC");
    return resultado.rows;
}

async function criarManutencao(id_envio, id_usuario, data_hora_manutencao, motivo) {
    const resultado = await pool.query(
        `INSERT INTO manutencoes_taloes (id_envio, id_usuario, data_hora_manutencao, motivo)
         VALUES ($1, $2, $3, $4) RETURNING *`,
        [id_envio, id_usuario, data_hora_manutencao, motivo]
    );
    return resultado.rows[0];
}

async function listarManutencoes() {
    const resultado = await pool.query("SELECT * FROM manutencoes_taloes ORDER BY data_hora_manutencao DESC");
    return resultado.rows;
}

async function atualizarManutencao(id_manutencao, motivo) {
    const resultado = await pool.query(
        `UPDATE manutencoes_taloes SET motivo = $1 WHERE id_manutencao = $2 RETURNING *`,
        [motivo, id_manutencao]
    );
    return resultado.rows[0];
}

async function deletarManutencao(id_manutencao) {
    const resultado = await pool.query(
        `DELETE FROM manutencoes_taloes WHERE id_manutencao = $1 RETURNING *`,
        [id_manutencao]
    );
    return resultado.rows[0];
}

async function consolidarDadosTaloes() {
    const resultado = await pool.query(`
        SELECT e.id_envio, e.cod_lojas, e.quantidade_enviada, 
               r.quantidade_recebida, m.motivo AS manutencao_motivo
        FROM envios_taloes e
        LEFT JOIN recebimentos_taloes r ON e.id_envio = r.id_envio
        LEFT JOIN manutencoes_taloes m ON e.id_envio = m.id_envio
    `);
    return resultado.rows;
}

module.exports = {
    criarEnvio, listarEnvios,
    criarRecebimento, listarRecebimentos,
    criarManutencao, listarManutencoes, atualizarManutencao, deletarManutencao,
    consolidarDadosTaloes
};