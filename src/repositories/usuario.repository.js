const pool = require("../db/conexao");

async function listarUsuarios() {
    const resultado = await pool.query("SELECT * FROM usuarios");
    return resultado.rows;
}

async function buscarUsuarioPorEmailOuMatricula(email, matricula) {
    const resultado = await pool.query(
        "SELECT * FROM usuarios WHERE email = $1 OR matricula = $2",
        [email, matricula]
    );
    return resultado.rows;
}

async function buscarUsuarioPorEmail(email) {
    const resultado = await pool.query(
        "SELECT * FROM usuarios WHERE email = $1",
        [email]
    );
    return resultado.rows[0]; 
}

async function cadastrarUsuario(nome, matricula, email, senhaCriptografada) {
    const resultado = await pool.query(
        `INSERT INTO usuarios (nome, matricula, email, senha) 
         VALUES ($1, $2, $3, $4)
         RETURNING id_usuario, nome, matricula, email`, 
        [nome, matricula, email, senhaCriptografada]
    );
    return resultado.rows[0];
}

async function atualizarTokenSessao(id_usuario, token) {
    await pool.query(
        "UPDATE usuarios SET token_sessao = $1 WHERE id_usuario = $2",
        [token, id_usuario]
    );
}

async function salvarCodigoRecuperacao(email, codigo, expiracao) {
    const resultado = await pool.query(
        `UPDATE usuarios
         SET codigo_recuperacao = $1,
             codigo_expiracao = $2
         WHERE email = $3
         RETURNING *`,
        [codigo, expiracao, email]
    );
    return resultado.rows[0];
}

async function redefinirSenha(id_usuario, senhaCriptografada) {
    await pool.query(
        `UPDATE usuarios
         SET senha = $1,
             codigo_recuperacao = NULL,
             codigo_expiracao = NULL
         WHERE id_usuario = $2`,
        [senhaCriptografada, id_usuario]
    );
}

async function atualizarUsuario(id, nome, matricula, email) {
    const resultado = await pool.query(
        `UPDATE usuarios
         SET nome = $1,
             matricula = $2,
             email = $3
         WHERE id_usuario = $4
         RETURNING *`,
        [nome, matricula, email, id]
    );
    return resultado.rows[0];
}

async function deletarUsuario(id) {
    const resultado = await pool.query(
        "DELETE FROM usuarios WHERE id_usuario = $1 RETURNING *", 
        [id]
    );
    return resultado.rows[0];
}

module.exports = {
    listarUsuarios,
    buscarUsuarioPorEmailOuMatricula,
    buscarUsuarioPorEmail,
    cadastrarUsuario,
    atualizarTokenSessao,
    salvarCodigoRecuperacao,
    redefinirSenha,
    atualizarUsuario,
    deletarUsuario
};