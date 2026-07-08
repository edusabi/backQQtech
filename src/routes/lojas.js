const express = require("express");
const lojas = express.Router();

const lojasRepository = require("../repositories/lojas.repository");

lojas.post("/", async (req, res) => {
    try {
        const { cod_loja, nome } = req.body;

        if (!cod_loja || !nome){
            return res.status(400).json({
                erro: "Informe o código e o nome da loja."
            });
        }

        const lojaExistente = await lojasRepository.buscarLojaPorCodigo(cod_loja);

        if (lojaExistente) {
            return res.status(400).json({
                erro: "Já existe uma loja com esse código."
            });
        }

        const lojaCriada = await lojasRepository.criarLoja(cod_loja, nome);

        res.status(201).json({
            mensagem: "Loja cadastrada com sucesso!",
            loja: lojaCriada
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
        const todasAsLojas = await lojasRepository.listarLojas();

        res.status(200).json(todasAsLojas);

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

        const lojaAtualizada = await lojasRepository.atualizarLoja(id, nome);

        if (!lojaAtualizada) {
            return res.status(404).json({
                erro: "Loja não encontrada."
            });
        }

        res.status(200).json({
            mensagem: "Loja atualizada com sucesso!",
            loja: lojaAtualizada
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

        const lojaExcluida = await lojasRepository.deletarLoja(id);

        if (!lojaExcluida) {
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