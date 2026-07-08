const express = require("express");
const perfil = express.Router();
const pool = require("../db/conexao");

perfil.get("/", async (req, res) => {
    try {
        const resultado = await pool.query(
            `SELECT id_perfil, nome, descricao
             FROM perfil
             ORDER BY id_perfil`
        );

        res.json(resultado.rows);
    } catch (erro) {
        console.error("Erro ao buscar perfis:", erro);
        res.status(500).json({ erro: "Erro ao buscar perfis." });
    }
});

perfil.post("/", async (req, res) => {
    try {
        const { nome, descricao } = req.body;

        if (!nome) {
            return res.status(400).json({
                erro: "O nome do perfil é obrigatório."
            });
        }

        const resultado = await pool.query(
            `INSERT INTO perfil (nome, descricao)
             VALUES ($1, $2)
             RETURNING *`,
            [nome, descricao]
        );

        res.status(201).json({
            mensagem: "Perfil cadastrado com sucesso.",
            perfil: resultado.rows[0]
        });

    } catch (erro) {
        console.error("Erro ao cadastrar perfil:", erro);
        res.status(500).json({ erro: "Erro ao cadastrar perfil." });
    }
});

perfil.put("/:id", async (req, res) => {
    try {
        const { id } = req.params;
        const { nome, descricao } = req.body;

        const resultado = await pool.query(
            `UPDATE perfil
             SET nome = $1,
                 descricao = $2
             WHERE id_perfil = $3
             RETURNING *`,
            [nome, descricao, id]
        );

        if (resultado.rowCount === 0) {
            return res.status(404).json({
                erro: "Perfil não encontrado."
            });
        }

        res.json({
            mensagem: "Perfil atualizado com sucesso.",
            perfil: resultado.rows[0]
        });

    } catch (erro) {
        console.error("Erro ao atualizar perfil:", erro);
        res.status(500).json({ erro: "Erro ao atualizar perfil." });
    }
});

perfil.delete("/:id", async (req, res) => {
    try {
        const { id } = req.params;

        const resultado = await pool.query(
            `DELETE FROM perfil
             WHERE id_perfil = $1
             RETURNING *`,
            [id]
        );

        if (resultado.rowCount === 0) {
            return res.status(404).json({
                erro: "Perfil não encontrado."
            });
        }

        res.json({
            mensagem: "Perfil excluído com sucesso."
        });

    } catch (erro) {
        console.error("Erro ao excluir perfil:", erro);
        res.status(500).json({ erro: "Erro ao excluir perfil." });
    }
});

perfil.get("/vinculos", async (req, res) => {
    try {
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

        res.json(resultado.rows);

    } catch (erro) {
        console.error("Erro ao listar vínculos:", erro);
        res.status(500).json({ erro: "Erro ao listar vínculos." });
    }
});

perfil.delete("/vincular/:idUsuario/:idPerfil", async (req, res) => {
    try {
        const { idUsuario, idPerfil } = req.params;

        const resultado = await pool.query(
            `DELETE FROM perfil_usuario
             WHERE id_usuario = $1
               AND id_perfil = $2
             RETURNING *`,
            [idUsuario, idPerfil]
        );

        if (resultado.rowCount === 0) {
            return res.status(404).json({
                erro: "Vínculo não encontrado."
            });
        }

        res.json({
            mensagem: "Vínculo removido com sucesso."
        });

    } catch (erro) {
        console.error("Erro ao remover vínculo:", erro);
        res.status(500).json({ erro: "Erro ao remover vínculo." });
    }
});

module.exports = perfil;