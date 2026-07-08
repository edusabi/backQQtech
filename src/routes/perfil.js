const express = require("express");
const perfil = express.Router();

const perfisRepository = require("../repositories/perfis.repository");

perfil.get("/", async (req, res) => {
    try {
        const perfis = await perfisRepository.listarPerfis();
        res.json(perfis);
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

        const perfilCriado = await perfisRepository.criarPerfil(nome, descricao);

        res.status(201).json({
            mensagem: "Perfil cadastrado com sucesso.",
            perfil: perfilCriado
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

        const perfilAtualizado = await perfisRepository.atualizarPerfil(id, nome, descricao);

        if (!perfilAtualizado) {
            return res.status(404).json({
                erro: "Perfil não encontrado."
            });
        }

        res.json({
            mensagem: "Perfil atualizado com sucesso.",
            perfil: perfilAtualizado
        });

    } catch (erro) {
        console.error("Erro ao atualizar perfil:", erro);
        res.status(500).json({ erro: "Erro ao atualizar perfil." });
    }
});

perfil.delete("/:id", async (req, res) => {
    try {
        const { id } = req.params;

        const perfilExcluido = await perfisRepository.deletarPerfil(id);

        if (!perfilExcluido) {
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
        const vinculos = await perfisRepository.listarVinculos();
        res.json(vinculos);
    } catch (erro) {
        console.error("Erro ao listar vínculos:", erro);
        res.status(500).json({ erro: "Erro ao listar vínculos." });
    }
});

perfil.delete("/vincular/:idUsuario/:idPerfil", async (req, res) => {
    try {
        const { idUsuario, idPerfil } = req.params;

        const vinculoRemovido = await perfisRepository.removerVinculo(idUsuario, idPerfil);

        if (!vinculoRemovido) {
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