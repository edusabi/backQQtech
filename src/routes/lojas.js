const express = require("express");
const lojas = express.Router();
const pool = require("../db/conexao");

lojas.post("/", async (req, res) => {
    try {
        const { cod_loja, nome } = req.body;

        if (!cod_loja || !nome){
            return res.status(400).json({
                erro: "Informe o código e o nome da loja."
            });
        };

        const lojaExistente = await pool.query(
            "SELECT * FROM lojas WHERE cod_loja = $1",
            [cod_loja]
        );

        if (lojaExistente.rows.length > 0) {
            return res.status(400).json({
                erro: "Já existe uma loja com esse código."
            });
        };

        const resultado = await pool.query(
            `INSERT INTO lojas (cod_loja, nome)
            VALUES ($1, $2)
            RETURNING *`,
            [cod_loja, nome]
        );

        res.status(201).json({
            mensagem: "Loja cadastrada com sucesso!",
            loja: resultado.rows[0]
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({
            erro: "Erro ao cadastrar loja."
        });
    }
});


lojas.get("/", async (req, res) => {
    try {

        const resultado = await pool.query(
            "SELECT * FROM lojas ORDER BY cod_loja"
        );

        res.status(200).json(resultado.rows);

    } catch (error) {
        console.error(error);
        res.status(500).json({
            erro: "Erro ao buscar lojas."
        });
    }
});


lojas.put("/:id", async (req, res) => {
    try {
        const { id } = req.params;
        const { nome } = req.body;

        if (!nome) {
            return res.status(400).json({
                erro: "Informe o nome da loja."
            });
        }

        const resultado = await pool.query(
            `UPDATE lojas
             SET nome = $1
             WHERE cod_loja = $2
             RETURNING *`,
            [nome, id]
        );

        if (resultado.rows.length === 0) {
            return res.status(404).json({
                erro: "Loja não encontrada."
            });
        }

        res.status(200).json({
            mensagem: "Loja atualizada com sucesso!",
            loja: resultado.rows[0]
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({
            erro: "Erro ao atualizar loja."
        });
    }
});


lojas.delete("/:id", async (req, res) => {
    try {
        const { id } = req.params;

        const resultado = await pool.query(
            `DELETE FROM lojas
             WHERE cod_loja = $1
             RETURNING *`,
            [id]
        );

        if (resultado.rows.length === 0) {
            return res.status(404).json({
                erro: "Loja não encontrada."
            });
        }

        res.status(200).json({
            mensagem: "Loja excluída com sucesso!"
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({
            erro: "Erro ao excluir loja."
        });
    }
});

module.exports = lojas;