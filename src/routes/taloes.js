const express = require("express");
const taloes = express.Router();
const axios = require('axios');
const taloesRepository = require("../repositories/taloes.repository");

taloes.post("/", async (req, res) => {
    try {
        const { cod_lojas, id_usuario, data_envio, quantidade_enviada, observacao } = req.body;
        const envio = await taloesRepository.criarEnvio(cod_lojas, id_usuario, data_envio, quantidade_enviada, observacao);
        res.status(201).json({ mensagem: "Envio registrado!", envio });
    } catch (error) {
        console.error(error);
        res.status(500).json({ erro: "Erro ao registrar envio." });
    }
});

taloes.get("/", async (req, res) => {
    try {
        const envios = await taloesRepository.listarEnvios();
        res.json(envios);
    } catch (error) {
        console.error(error);
        res.status(500).json({ erro: "Erro ao buscar envios." });
    }
});

taloes.post("/receber", async (req, res) => {
    try {
        const { cod_lojas, id_usuario, id_envio, data_recebimento, quantidade_recebida, observacao } = req.body;
        const recebimento = await taloesRepository.criarRecebimento(cod_lojas, id_usuario, id_envio, data_recebimento, quantidade_recebida, observacao);
        res.status(201).json({ mensagem: "Recebimento registrado!", recebimento });
    } catch (error) {
        console.error(error);
        res.status(500).json({ erro: "Erro ao registrar recebimento." });
    }
});

taloes.get("/receber", async (req, res) => {
    try {
        const recebimentos = await taloesRepository.listarRecebimentos();
        res.json(recebimentos);
    } catch (error) {
        console.error(error);
        res.status(500).json({ erro: "Erro ao buscar recebimentos." });
    }
});

taloes.post("/manutencao", async (req, res) => {
    try {
        const { id_envio, id_usuario, data_hora_manutencao, motivo } = req.body;
        const manutencao = await taloesRepository.criarManutencao(id_envio, id_usuario, data_hora_manutencao, motivo);
        res.status(201).json({ mensagem: "Manutenção registrada!", manutencao });
    } catch (error) {
        console.error(error);
        res.status(500).json({ erro: "Erro ao registrar manutenção." });
    }
});

taloes.get("/manutencao/historico", async (req, res) => {
    try {
        const historico = await taloesRepository.listarManutencoes();
        res.json(historico);
    } catch (error) {
        console.error(error);
        res.status(500).json({ erro: "Erro ao buscar histórico de manutenção." });
    }
});

taloes.put("/manutencao/:id", async (req, res) => {
    try {
        const { motivo } = req.body;
        const atualizado = await taloesRepository.atualizarManutencao(req.params.id, motivo);
        if (!atualizado) return res.status(404).json({ erro: "Manutenção não encontrada." });
        res.json({ mensagem: "Manutenção atualizada!", manutencao: atualizado });
    } catch (error) {
        console.error(error);
        res.status(500).json({ erro: "Erro ao atualizar manutenção." });
    }
});

taloes.delete("/manutencao/:id", async (req, res) => {
    try {
        const deletado = await taloesRepository.deletarManutencao(req.params.id);
        if (!deletado) return res.status(404).json({ erro: "Manutenção não encontrada." });
        res.json({ mensagem: "Manutenção excluída com sucesso." });
    } catch (error) {
        console.error(error);
        res.status(500).json({ erro: "Erro ao excluir manutenção." });
    }
});

taloes.get("/exportar/csv", async (req, res) => {
    try {
        const dados = await taloesRepository.consolidarDadosTaloes();
        
        const cabecalho = "id_envio,cod_lojas,quantidade_enviada,quantidade_recebida,motivo_manutencao\n";
        const linhas = dados.map(d => `${d.id_envio},${d.cod_lojas},${d.quantidade_enviada},${d.quantidade_recebida || 0},${d.manutencao_motivo || ''}`).join('\n');
        
        res.header('Content-Type', 'text/csv');
        res.attachment('relatorio_taloes.csv');
        res.send(cabecalho + linhas);
    } catch (error) {
        console.error(error);
        res.status(500).json({ erro: "Erro ao exportar CSV." });
    }
});

module.exports = taloes;