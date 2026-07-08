const express = require("express");
const estoque = express.Router();

const estoqueRepository = require("../repositories/estoque.repository");

estoque.get("/", async (req, res) => {
    try {
        const estoqueEncontrado = await estoqueRepository.listarEstoque();
        
        res.status(200).json(estoqueEncontrado);
    } catch (error) {
        console.error(error);
        res.status(500).json({
            erro: "Erro ao buscar estoque."
        });
    }
});

estoque.put("/ajuste", async (req, res) => {
    try {
        const {
            cod_lojas,
            estoque_atual,
            estoque_minimo,
            qtd_recomendada
        } = req.body;

        if (
            !cod_lojas ||
            estoque_atual === undefined ||
            estoque_minimo === undefined ||
            qtd_recomendada === undefined
        ) {
            return res.status(400).json({
                erro: "Preencha todos os campos."
            });
        }

        const loja = await estoqueRepository.buscarLojaPorId(cod_lojas);

        if (!loja) { 
            return res.status(404).json({
                erro: "Loja não encontrada."
            });
        }

        const estoqueAtualizado = await estoqueRepository.atualizarEstoque(
            cod_lojas, 
            estoque_atual, 
            estoque_minimo, 
            qtd_recomendada
        );

        res.status(200).json({
            mensagem: "Estoque atualizado com sucesso!",
            estoque: estoqueAtualizado
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({
            erro: "Erro ao atualizar estoque."
        });
    }
});

module.exports = estoque;